<script setup lang="ts">
import { ref, computed, watch } from "vue"
import {
  Search, Plus, Menu, Palette, Hash, Type,
  ToggleLeft, Loader2, Trash2, X, Copy, Edit3,
  Database
} from "lucide-vue-next"
import type { Variable, VariableType } from "../../type/variable"

import DropdownMenu from "@/components/ui/dropdown-menu/DropdownMenu.vue"
import DropdownMenuTrigger from "@/components/ui/dropdown-menu/DropdownMenuTrigger.vue"
import DropdownMenuContent from "@/components/ui/dropdown-menu/DropdownMenuContent.vue"
import DropdownMenuItem from "@/components/ui/dropdown-menu/DropdownMenuItem.vue"
import ContextMenu from "@/components/ui/context-menu/ContextMenu.vue"
import ContextMenuTrigger from "@/components/ui/context-menu/ContextMenuTrigger.vue"
import ContextMenuContent from "@/components/ui/context-menu/ContextMenuContent.vue"
import ContextMenuItem from "@/components/ui/context-menu/ContextMenuItem.vue"
import ContextMenuSeparator from "@/components/ui/context-menu/ContextMenuSeparator.vue"

import CompositionColorPicker from "@/components/composition/CompositionColorPicker.vue"
import CompositionError from "@/components/composition/CompositionError.vue"

import {
  useCreateCollection,
  useCreateVariable,
  useDeleteCollection,
  useDeleteVariable,
  useGetCollections,
  useUpdateVariable
} from "../../hook/variable"
import { showToast } from "../../lib/toast"
import { validateValueByType } from "../../lib/validateType"
import CompositionListEmpty from "../../components/composition/CompositionListEmpty.vue"
import { getErrorMessage } from "../../lib/errorMessage"

const searchQuery = ref("")

const debouncedSearch = ref("")

let timeout: ReturnType<typeof setTimeout>
watch(searchQuery, (newValue) => {
  clearTimeout(timeout)
  timeout = setTimeout(() => {
    debouncedSearch.value = newValue
  }, 300)
})

const {
  data: collections,
  isLoading: isCollectionsLoading,
  isError: isCollectionsError,
  error: collectionsError,
  refetch: refetchCollections,
} = useGetCollections(computed(() => debouncedSearch.value))

const {
  mutate: createCol,
  isPending: isCreateColLoading,
} = useCreateCollection()

const {
  mutate: deleteCol,
  isPending: isDeleteColLoading,
} = useDeleteCollection()

const {
  mutate: createVar,
  isPending: isCreateVarLoading,
} = useCreateVariable()

const {
  mutate: updateVar,
  isPending: isUpdateVarLoading,
} = useUpdateVariable()

const {
  mutate: deleteVar,
  isPending: isDeleteVarLoading,
} = useDeleteVariable()

const sidebarOpen = ref(true)
const selectedCollectionId = ref<number | null>(0)
const colorPickerOpen = ref(false)
const editingCell = ref<{ id: number; field: "name" | "value" } | null>(null)
const isCreatingCollection = ref<VariableType | null>(null)
const newCollectionName = ref("")

const tempEditValue = ref("");

const startEditing = (v: Variable, field: "name" | "value") => {
  editingCell.value = { id: v.id, field };
  tempEditValue.value = v[field];
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
}

watch(() => collections.value, (newCols) => {
  if (newCols && newCols.length > 0 && !selectedCollectionId.value) {
    selectedCollectionId.value = 0
  }
}, { immediate: true })

const selectedCollection = computed(() => {
  if (selectedCollectionId.value === 0) return null
  return collections.value?.find(c => c.id === selectedCollectionId.value) || null
})

const filteredVariables = computed(() => {
  if (!collections.value) return []

  const search = searchQuery.value.trim().toLowerCase()

  // 1. D'abord, on détermine le périmètre (toutes les collections ou une seule)
  let scope = collections.value

  if (selectedCollectionId.value !== 0) {
    scope = collections.value.filter(c => c.id === selectedCollectionId.value)
  }

  // 2. Ensuite, on extrait et on filtre les variables dans ce périmètre
  const allVarsFromScope = scope.flatMap(col =>
    col.variables.map(v => ({
      ...v,
      collectionName: col.name,
      type: col.type
    }))
  )

  // 3. On applique la recherche textuelle si nécessaire
  if (search.length > 0) {
    return allVarsFromScope.filter(v =>
      v.name.toLowerCase().includes(search) ||
      v.value.toLowerCase().includes(search)
    )
  }

  return allVarsFromScope
})

const handleUpdate = async (id: number, field: "name" | "value", newValue: string | number | boolean, type?: VariableType) => {
  const stringValue = String(newValue);
  const cleanValue = stringValue.trim();

  if (cleanValue === "" && field === "name") {
    editingCell.value = null;
    return;
  }

  const targetType = type || selectedCollection.value?.type;

  if (field === "value" && targetType) {
    if (!validateValueByType(targetType, cleanValue)) {
      showToast("error", `Format invalide pour le type ${targetType}`);
      return;
    }
  }

  console.log('eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee');
  

  editingCell.value = null;

  updateVar({ id, data: { [field]: cleanValue } }, {
    onSuccess: () => {
      refetchCollections();
      showToast("success", "Variable mise à jour");
    },
    onError: (error) => {
      showToast("error", `Erreur: ${error.message}`);
      refetchCollections();
    }
  });
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

const submitNewCollection = async () => {
  if (newCollectionName.value.trim() && isCreatingCollection.value) {
    await createCol(
      { name: newCollectionName.value, type: isCreatingCollection.value },
      {
        onSuccess: () => {
          refetchCollections()
          showToast("success", "Collection créée avec succès")
        },
        onError: (error) => {
          showToast("error", `${getErrorMessage(error)}`)
        }
      }
    )
    cancelCollectionCreation()
  }
}

const cancelCollectionCreation = () => {
  isCreatingCollection.value = null
  newCollectionName.value = ""
}

const addNewVariable = async () => {
  if (!selectedCollectionId.value) return
  const type = selectedCollection.value?.type
  const defaultValue = type === 'COLOR' ? '000000' : type === 'BOOLEAN' ? 'false' : '0'
  await createVar(
    { name: "new-variable", value: defaultValue, collectionId: selectedCollectionId.value },
    {
      onSuccess: () => {
        refetchCollections()
        showToast("success", "Variable créée avec succès")
      },
      onError: (error) => {
        showToast("error", `${getErrorMessage(error)}`)
      }
    }
  )
}

const deleteVariable = async (id: number) => {
  await deleteVar(id, {
    onSuccess: () => {
      refetchCollections()
      showToast("success", "Variable supprimée avec succès")
    },
    onError: (error) => {
      showToast("error", `${getErrorMessage(error)}`)
    }
  })
}

const deleteCollection = async (id: number) => {
  await deleteCol(id, {
    onSuccess: () => {
      refetchCollections()
      showToast("success", "Collection supprimée avec succès")
    },
    onError: (error) => {
      showToast("error", `${getErrorMessage(error)}`)
    }
  })
}

const vFocus = { mounted: (el: HTMLInputElement) => el.focus() }
</script>

<template>
  <div class=" flex flex-row bg-background text-foreground h-[80vh] max-w-[90vw] w-[90%] overflow-hidden antialiased font-mono">

    <aside v-if="sidebarOpen" class="w-72 h-full sticky top-0 flex-shrink-0 border-r border-border flex flex-col bg-background">
      <div class="p-6 space-y-6 pl-0">
        <div class="flex items-center justify-between">
          <h2 class="p12 font-bold uppercase tracking-widest text-muted-foreground">Collections</h2>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <button class="hover:bg-muted p-1 rounded transition-colors">
                <Plus :size="16" :stroke-width="1.2" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="border-border p14 font-mono">
              <DropdownMenuItem class="hover:!bg-primary hover:!text-white" @click="prepareNewCollection('COLOR')"><Palette :size="14" class="mr-2 text-orange-500" :stroke-width="1.2"/> Color</DropdownMenuItem>
              <DropdownMenuItem class="hover:!bg-primary hover:!text-white" @click="prepareNewCollection('NUMBER')"><Hash :size="14" class="mr-2 text-blue-500" :stroke-width="1.2" /> Number</DropdownMenuItem>
              <DropdownMenuItem class="hover:!bg-primary hover:!text-white" @click="prepareNewCollection('STRING')"><Type :size="14" class="mr-2 text-green-500" :stroke-width="1.2" /> String</DropdownMenuItem>
              <DropdownMenuItem class="hover:!bg-primary hover:!text-white" @click="prepareNewCollection('BOOLEAN')"><ToggleLeft :size="14" class="mr-2 text-purple-500" :stroke-width="1.2" /> Boolean</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div class="space-y-4 font-mono">
          <div v-if="isCreatingCollection" class="relative">
             <input v-model="newCollectionName" v-focus type="text"
                    @keydown.enter="submitNewCollection"
                    @keydown.esc="cancelCollectionCreation"
                    class="w-full pl-3 pr-8 py-1 rounded border border-primary/30 bg-transparent p14 outline-none"
                    placeholder="Nom Collection..."/>
             <X @click="cancelCollectionCreation" class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer" :size="14" />
          </div>

          <div class="space-y-1 overflow-y-auto custom-scrollbar">
            <div
              @click="selectedCollectionId = 0"
              :class="['flex items-center justify-between px-3 py-1.5 rounded cursor-pointer transition-all font-mono',
                selectedCollectionId === 0 ? 'bg-primary text-white' : 'hover:bg-muted']"
            >
              <span class="p14 truncate">Tout</span>
              <span class="p11 opacity-60"></span>
            </div>
            <ContextMenu v-for="collection in (collections ?? [])" :key="collection.id">
              <ContextMenuTrigger>
                <div
                  @click="selectedCollectionId = collection.id"
                  :class="['flex items-center justify-between px-3 py-1.5 rounded cursor-pointer transition-all font-mono',
                    selectedCollectionId === collection.id ? 'bg-primary text-white' : 'hover:bg-muted']"
                >
                  <span class="p14 truncate">{{ collection.name }}</span>
                  <span class="p11 opacity-60">{{ collection.variables.length }} ({{ collection.type }})</span>
                </div>
              </ContextMenuTrigger>

              <ContextMenuContent class="w-auto border-border font-mono">
                <ContextMenuItem @click="selectedCollectionId = collection.id"><Edit3 class="mr-2 h-4 w-4" :stroke-width="1.2" /> Open</ContextMenuItem>
                <ContextMenuItem @click="deleteCollection(collection.id)" class="text-destructive">
                  <Trash2 class="mr-2 h-4 w-4" :stroke-width="1.2" /> Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>

          </div>
        </div>

        <div v-if="isCollectionsLoading || isCreateColLoading || isUpdateVarLoading || isDeleteVarLoading || isCreateVarLoading || isDeleteColLoading" class="flex justify-center p-8">
          <Loader2 class="animate-spin text-primary/60" :size="20" />
        </div>
      </div>
    </aside>

    <main class="flex-1 flex flex-col min-h-0 overflow-hidden  border-l border-border">
      <div class="border-b border-border px-8 py-6 bg-background/50">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-4">
            <button @click="sidebarOpen = !sidebarOpen" class="text-muted-foreground hover:text-foreground p-1 hover:bg-muted rounded transition-colors">
              <Menu :size="18" :stroke-width="1.2" />
            </button>
            <p v-if="!searchQuery" class="capitalize text-lg font-bold tracking-tight">
              {{ selectedCollectionId === 0 ? 'Tout' : (selectedCollection?.name || 'Sélectionner') }}
            </p>
          </div>
          <button v-if="selectedCollectionId !==0 && !searchQuery" @click="addNewVariable" class="text-muted-foreground hover:text-primary transition-colors">
            <Plus :size="20" :stroke-width="1.2" />
          </button>
        </div>

        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" :size="16" />
          <input v-model="searchQuery" type="text" placeholder="Search variables..."
            class="w-full pl-10 input-custom bg-transparent" />
        </div>
      </div>

      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <div v-if="isCollectionsError" class="flex justify-center p-8">
          <CompositionError :error="collectionsError" />
        </div>

        <table v-else-if="filteredVariables.length > 0" class="w-full border-collapse">
          <thead class="sticky top-0 z-10 bg-background opacity-100 border-b border-border text-muted-foreground p11 uppercase tracking-widest">
            <tr>
              <th class="px-8 py-3 text-left">Name</th>
              <th class="px-8 py-3 text-left">Value</th>
              <th v-if="searchQuery || selectedCollectionId === 0" class="px-8 py-3 text-left">Collection</th>
              <th v-if="searchQuery || selectedCollectionId === 0" class="px-8 py-3 text-left">Type</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border custom-scrollbar">
            <ContextMenu v-for="v in filteredVariables" :key="v.id">
              <ContextMenuTrigger as-child>
                <tr class="hover:bg-muted/30 transition-colors group">
                  <td class="px-8 py-4 p14" @dblclick="startEditing(v, 'name')">
                    <input v-if="editingCell?.id === v.id && editingCell?.field === 'name'"
                      v-focus
                      v-model="tempEditValue"
                      @blur="handleUpdate(v.id, 'name', tempEditValue, v.type)"
                      @keydown.enter="($event.target as HTMLInputElement).blur()"
                      @keydown.esc="editingCell = null"
                      class="bg-background border border-primary/50 rounded px-2 py-0.5 outline-none "
                    />
                    <span v-else class="text-foreground/90">{{ v.name }}</span>
                  </td>

                  <td class="px-8 py-4 p14" @dblclick="startEditing(v, 'value')">
                    <template v-if="v.type === 'COLOR'">
                      <CompositionColorPicker
                        :is-open="colorPickerOpen && editingCell?.id === v.id"
                        :initial-color="v.value"
                        @close="colorPickerOpen = false; editingCell = null"
                        @color-change="handleColorChange">
                        <template #trigger>
                          <div class="flex items-center gap-3 cursor-pointer" @click="startEditing(v, 'value'); colorPickerOpen = true">
                            <div class="w-6 h-6 rounded border border-border shadow-sm" :style="{ backgroundColor: `#${v.value}` }" />
                            <span class="font-mono text-muted-foreground uppercase">#{{ v.value }}</span>
                          </div>
                        </template>
                      </CompositionColorPicker>
                    </template>

                    <template v-else-if="v.type === 'BOOLEAN'">
                      <button
                        @click="handleUpdate(v.id, 'value', v.value === 'true' ? 'false' : 'true', v.type)"
                        :class="[
                          'px-3 py-1 rounded-full text-[10px] uppercase transition-colors font-bold tracking-wider',
                          v.value === 'true' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                        ]"
                      >
                        {{ v.value }}
                      </button>
                    </template>

                    <template v-else>
                      <div class="flex items-center gap-3 cursor-pointer" @click="startEditing(v, 'value')">
                        <input v-if="editingCell?.id === v.id && editingCell?.field === 'value'"
                          v-focus
                          v-model="tempEditValue"
                          :type="v.type === 'NUMBER' ? 'number' : 'text'"
                          @blur="handleUpdate(v.id, 'value', tempEditValue, v.type)"
                          @keydown.enter="($event.target as HTMLInputElement).blur()"
                          @keydown.esc="editingCell = null"
                          class="bg-background border border-primary/50 rounded px-2 py-0.5 outline-none font-mono w-full max-w-[150px]"
                        />
                        <span v-else class="text-muted-foreground font-mono">{{ v.value }}</span>
                      </div>
                    </template>
                  </td>
                  <td v-if="searchQuery || selectedCollectionId === 0" class="px-8 py-4">
                    <span class="p11 px-2 py-0.5 rounded border border-border bg-muted/50 text-muted-foreground">
                      {{ v.collectionName }}
                    </span>
                  </td>
                  <td v-if="searchQuery || selectedCollectionId === 0" class="px-8 py-4">
                    <span class="p11 px-2 py-0.5 rounded border border-border bg-muted/50 text-muted-foreground">
                      {{ v.type }}
                    </span>
                  </td>
                </tr>
              </ContextMenuTrigger>

              <ContextMenuContent class="w-auto border-border font-mono">
                <ContextMenuItem @click="editingCell = { id: v.id, field: 'name' }">
                  <Edit3 class="mr-2 h-4 w-4" :stroke-width="1.2"/> Rename
                </ContextMenuItem>
                <ContextMenuItem @click="copyToClipboard(v.value)">
                  <Copy class="mr-2 h-4 w-4" :stroke-width="1.2" /> Copier
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem @click="deleteVariable(v.id)" class="text-destructive">
                  <Trash2 class="mr-2 h-4 w-4" :stroke-width="1.2" /> Delete
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </tbody>

        </table>
        <div v-else class="h-[100%] flex justify-center">
          <CompositionListEmpty  :icon="Database" title="Aucune variable" description="Cliquez sur le bouton + pour ajouter une variable"/>
        </div>
        <div  class="flex-1 overflow-y-auto ">
          <div v-if="isCollectionsLoading" class="flex justify-center p-12">
            <Loader2 class="animate-spin text-primary/60" :size="30" />
          </div>

          <div v-else-if="searchQuery && filteredVariables.length === 0" class="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <Search :size="24" class="mb-2 opacity-20" />
            <p class="p14">Aucun résultat pour "{{ searchQuery }}"</p>
          </div>

          <table v-else-if="filteredVariables.length > 0" class="w-full border-collapse">
            </table>
        </div>
      </div>
    </main>
  </div>
</template>
