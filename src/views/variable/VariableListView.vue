<script setup lang="ts">
import { ref, computed, watch } from "vue"
import {
  Search, Plus, Menu, Palette, Hash, Type,
  ToggleLeft, Loader2, Trash2, X, Copy, Edit3
} from "lucide-vue-next"
import type { VariableType } from "../../type/Variable"



import DropdownMenu from "../../components/ui/dropdown-menu/DropdownMenu.vue"
import DropdownMenuTrigger from "../../components/ui/dropdown-menu/DropdownMenuTrigger.vue"
import DropdownMenuContent from "../../components/ui/dropdown-menu/DropdownMenuContent.vue"
import DropdownMenuItem from "../../components/ui/dropdown-menu/DropdownMenuItem.vue"
import CompositionColorPicker from "../../components/composition/CompositionColorPicker.vue"

import {
  useCreateCollection,
  useCreateVariable,
  useDeleteCollection,
  useDeleteVariable,
  useGetCollections,
  useUpdateVariable
} from "../../hook/variable"
import ContextMenu from "../../components/ui/context-menu/ContextMenu.vue"
import ContextMenuTrigger from "../../components/ui/context-menu/ContextMenuTrigger.vue"
import ContextMenuContent from "../../components/ui/context-menu/ContextMenuContent.vue"
import ContextMenuItem from "../../components/ui/context-menu/ContextMenuItem.vue"
import ContextMenuSeparator from "../../components/ui/context-menu/ContextMenuSeparator.vue"

// ... (Le reste de votre logique script reste identique) ...
const { data: collections, isLoading } = useGetCollections()
const createCol = useCreateCollection()
const deleteCol = useDeleteCollection()
const createVar = useCreateVariable()
const updateVar = useUpdateVariable()
const deleteVar = useDeleteVariable()

const sidebarOpen = ref(true)
const selectedCollectionId = ref<number | null>(null)
const searchQuery = ref("")
const colorPickerOpen = ref(false)
const editingCell = ref<{ id: number; field: "name" | "value" } | null>(null)
const isCreatingCollection = ref<VariableType | null>(null)
const newCollectionName = ref("")

watch(collections, (newCols) => {
  if (newCols?.length && !selectedCollectionId.value) {
    selectedCollectionId.value = newCols[0].id
  }
}, { immediate: true })

const selectedCollection = computed(() =>
  collections.value?.find(c => c.id === selectedCollectionId.value) || null
)

const filteredVariables = computed(() => {
  if (!selectedCollection.value) return []
  const query = searchQuery.value.toLowerCase()
  return selectedCollection.value.variables.filter(v =>
    v.name.toLowerCase().includes(query) || v.value.toLowerCase().includes(query)
  )
})

const handleUpdate = (id: number, field: "name" | "value", newValue: string) => {
  if (!newValue.trim()) {
    editingCell.value = null
    return
  }
  updateVar.mutate({ id, [field]: newValue })
  editingCell.value = null
}

const handleColorChange = (newColor: string) => {
  if (editingCell.value?.id) {
    const hex = newColor.replace('#', '')
    handleUpdate(editingCell.value.id, 'value', hex)
  }
}

const prepareNewCollection = (type: VariableType) => {
  isCreatingCollection.value = type
  newCollectionName.value = ""
}

const submitNewCollection = () => {
  if (newCollectionName.value.trim() && isCreatingCollection.value) {
    createCol.mutate({ name: newCollectionName.value, type: isCreatingCollection.value })
    cancelCollectionCreation()
  }
}

const cancelCollectionCreation = () => {
  isCreatingCollection.value = null
  newCollectionName.value = ""
}

const addNewVariable = () => {
  if (!selectedCollectionId.value) return
  const type = selectedCollection.value?.type
  const defaultValue = type === 'COLOR' ? '000000' : type === 'BOOLEAN' ? 'false' : '0'
  createVar.mutate({ name: "new-variable", value: defaultValue, collectionId: selectedCollectionId.value })
}

const vFocus = { mounted: (el: HTMLInputElement) => el.focus() }
</script>

<template>
  <div class="flex h-full min-h-0 bg-background text-foreground overflow-hidden font-light">

    <aside v-if="sidebarOpen" class="w-72 border-r border-border bg-background overflow-y-auto h-full flex-shrink-0">
      <div class="p-6 space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="p12 font-light uppercase tracking-wider text-muted-foreground mb-1">Collections</h2>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <button>
                <Plus :size="18" :stroke-width="0.8" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="border-border font-light p12">
              <DropdownMenuItem @click="prepareNewCollection('COLOR')" ><Palette :size="16" class="mr-2 text-orange-500 " :stroke-width="0.8"/> Color</DropdownMenuItem>
              <DropdownMenuItem @click="prepareNewCollection('NUMBER')"><Hash :size="16" class="mr-2 text-blue-500" :stroke-width="0.8" /> Number</DropdownMenuItem>
              <DropdownMenuItem @click="prepareNewCollection('STRING')"><Type :size="16" class="mr-2 text-green-500" :stroke-width="0.8" /> String</DropdownMenuItem>
              <DropdownMenuItem @click="prepareNewCollection('BOOLEAN')"><ToggleLeft :size="16" class="mr-2 text-purple-500" :stroke-width="0.8" /> Boolean</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>

        <div v-if="isLoading" class="flex justify-center p-8">
          <Loader2 class="animate-spin text-primary" :size="24" />
        </div>

        <div v-else class="space-y-4">

          <div v-if="isCreatingCollection" class="relative">
             <input v-model="newCollectionName" v-focus type="text" @keydown.enter="submitNewCollection" @keydown.esc="cancelCollectionCreation" class="w-full pl-10 pr-8 py-1 rounded border border-border bg-transparent p12 font-light outline-none" />
             <X @click="cancelCollectionCreation" class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer" :size="16" />
          </div>

          <div class="space-y-1">
            <ContextMenu v-for="collection in collections" :key="collection.id">
              <ContextMenuTrigger>
                <div
                  @click="selectedCollectionId = collection.id"
                  :class="['flex items-center justify-between px-3 py-1 mt-1 mb-1 rounded cursor-pointer transition-all',
                    selectedCollectionId === collection.id ? 'bg-primary' : 'hover:bg-muted']"
                >
                  <div class="flex items-center gap-3 truncate">
                    <span class="p12 font-light truncate">{{ collection.name }}</span>
                  </div>
                  <span class="p12 font-light opacity-60">{{ collection.variables.length }}</span>
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent class="w-48 border-border">
                <ContextMenuItem @click="selectedCollectionId = collection.id"><Edit3 class="mr-2 h-4 w-4" :stroke-width="0.8" /> Open</ContextMenuItem>
                <ContextMenuItem @click="deleteCol.mutate(collection.id)" class="text-destructive focus:text-destructive">
                  <Trash2 class="mr-2 h-4 w-4" :stroke-width="0.8" /> Delete Collection
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </div>
        </div>
      </div>
    </aside>

    <main class="flex-1 flex flex-col min-h-0 overflow-hidden">
      <div class="border-b border-border px-8 py-6 bg-background/50">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <button @click="sidebarOpen = !sidebarOpen" class="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-lg">
              <Menu :size="20" />
            </button>
            <h1 class="p12 font-light">{{ selectedCollection?.name || 'Select Collection' }}</h1>
          </div>
          <button v-if="selectedCollection" @click="addNewVariable" class="hover:opacity-90">
            <Plus :size="18" :stroke-width="0.8" />
          </button>
        </div>

        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" :size="18" />
          <input v-model="searchQuery" type="text" placeholder="Search variables..." class="w-full bg-transparent border border-border rounded-lg px-3 py-2 pl-10 p12 font-light focus:outline-none  focus:ring-border" />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto">
        <table v-if="selectedCollection" class="w-full border-collapse">
          <thead class="sticky top-0 z-10 bg-background/95 border-b border-border text-muted-foreground p12 font-light uppercase">
            <tr>
              <th class="px-8 py-3 text-left font-semibold">Name</th>
              <th class="px-8 py-3 text-left font-semibold">Value</th>
              <th class="px-8 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <ContextMenu v-for="v in filteredVariables" :key="v.id">
              <ContextMenuTrigger asChild>
                <tr class="hover:bg-muted/50 transition-colors group cursor-default">
                  <td class="px-8 py-4 p12 font-light" @dblclick="editingCell = { id: v.id, field: 'name' }">
                    <div class="flex items-center gap-3">
                      <input v-if="editingCell?.id === v.id && editingCell?.field === 'name'"
                        v-focus v-model="v.name" @blur="handleUpdate(v.id, 'name', v.name)" @keydown.enter="handleUpdate(v.id, 'name', v.name)"
                        class="bg-background border border-primary rounded px-2 py-1 outline-none w-full" />
                      <span v-else class="font-medium">{{ v.name }}</span>
                    </div>
                  </td>

                  <td class="px-8 py-4 p12 font-light">
                    <template v-if="selectedCollection.type === 'COLOR'">
                      <CompositionColorPicker :is-open="colorPickerOpen && editingCell?.id === v.id" :initial-color="v.value" @close="colorPickerOpen = false; editingCell = null" @color-change="handleColorChange">
                        <template #trigger>
                          <div class="flex items-center gap-3 cursor-pointer" @click="editingCell = { id: v.id, field: 'value' }; colorPickerOpen = true">
                            <div class="w-6 h-6 rounded border border-border" :style="{ backgroundColor: `#${v.value}` }" />
                            <span class="font-mono p12 font-light uppercase">#{{ v.value }}</span>
                          </div>
                        </template>
                      </CompositionColorPicker>
                    </template>
                    <template v-else>
                      <div class="flex items-center gap-3 cursor-pointer" @click="editingCell = { id: v.id, field: 'value' }">
                        <input v-if="editingCell?.id === v.id && editingCell?.field === 'value'"
                          v-focus v-model="v.value" @blur="handleUpdate(v.id, 'value', v.value)" @keydown.enter="handleUpdate(v.id, 'value', v.value)"
                          class="bg-background border border-primary rounded px-2 py-1 outline-none w-full font-mono" />
                        <span v-else class="text-muted-foreground font-mono">{{ v.value }}</span>
                      </div>
                    </template>
                  </td>
                </tr>
              </ContextMenuTrigger>
              <ContextMenuContent class="w-48 border-border">
                <ContextMenuItem @click="editingCell = { id: v.id, field: 'name' }">
                  <Edit3 class="mr-2 h-4 w-4" :stroke-width="0.8"/> Rename
                </ContextMenuItem>
                <ContextMenuItem @click="window.navigator.clipboard.writeText(v.value)">
                  <Copy class="mr-2 h-4 w-4" :stroke-width="0.8" /> Copy Value
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem @click="deleteVar.mutate(v.id)" class="text-destructive focus:text-destructive">
                  <Trash2 class="mr-2 h-4 w-4" :stroke-width="0.8" /> Delete Variable
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>
