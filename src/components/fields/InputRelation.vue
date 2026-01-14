<script setup lang="ts">
import { computed } from 'vue'
import { Label } from '../../components/ui/label'
import { X, Plus } from 'lucide-vue-next'
import { type IFieldDefinition, type IRelationConfig } from '../../type/field'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../components/ui/command'

interface IRelationItem {
  id: number
  name: string
}

const props = defineProps<{
  config: IFieldDefinition & IRelationConfig
  modelValue?: number | number[] | null
  error?: string
  hideLabel?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | number[] | null): void
}>()

// Mock local (À remplacer plus tard par un appel API basé sur config.targetModel)
const mockEntries: IRelationItem[] = [
  { id: 1, name: 'Article de blog 1' },
  { id: 2, name: 'Page à propos' },
  { id: 3, name: 'Contact' },
  { id: 4, name: 'Services' },
  { id: 5, name: 'Projets récents' },
]

/**
 * Logique de mapping :
 * On transforme les IDs du modelValue en objets IRelationItem
 * pour que le template puisse afficher les noms.
 */
const selectedItems = computed(() => {
  if (!props.modelValue) return []
  const ids = Array.isArray(props.modelValue) ? props.modelValue : [props.modelValue]
  return mockEntries.filter(entry => ids.includes(entry.id))
})

const availableEntries = computed(() => {
  const ids = Array.isArray(props.modelValue) ? props.modelValue : (props.modelValue ? [props.modelValue] : [])
  return mockEntries.filter(entry => !ids.includes(entry.id))
})

const toggleSelection = (entry: IRelationItem) => {
  if (props.config.multiple) {
    const current = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = current.indexOf(entry.id)

    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(entry.id)
    }
    emit('update:modelValue', current)
  } else {
    emit('update:modelValue', entry.id)
  }
}

const removeRelation = (id: number) => {
  if (Array.isArray(props.modelValue)) {
    emit('update:modelValue', props.modelValue.filter(itemId => itemId !== id))
  } else {
    emit('update:modelValue', null)
  }
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <Label v-if="!hideLabel" :for="config.name" class="text-sm font-semibold tracking-tight text-foreground/80">
        {{ config.label }}
        <span v-if="config.required" class="text-destructive">*</span>
      </Label>
      <span v-if="config.multiple && !hideLabel" class="text-[9px] uppercase tracking-widest text-muted-foreground font-black bg-muted px-1.5 py-0.5 rounded">
        Multiple
      </span>
    </div>

    <div class="border border-border overflow-hidden bg-background">
      <Command class="rounded-none border-0">
        <div class="items-center border-b border-border px-3 bg-background">
          <CommandInput placeholder="Rechercher une entrée..." class="h-10 text-xs border-none focus:ring-0" />
        </div>

        <div class="flex h-[200px] divide-x divide-border">
          <div class="w-1/2 flex flex-col bg-background">
            <CommandEmpty class="py-10 text-center p11 text-text">Aucun résultat</CommandEmpty>
            <CommandList class="flex-1 overflow-y-auto p-1 custom-scrollbar">
              <CommandGroup heading="Disponibles" class="p11 !text-text px-2">
                <CommandItem
                  v-for="entry in availableEntries"
                  :key="entry.id"
                  :value="entry.name"
                  class="flex items-center gap-2 px-2 py-2 cursor-pointer text-xs select-item-custom"
                  @select="toggleSelection(entry)"
                >
                  <Plus class="h-3 w-3 text-text" />
                  <span class="truncate">{{ entry.name }}</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </div>

          <div class="w-1/2 flex flex-col bg-background">
            <div v-if="selectedItems.length === 0" class="flex-1 flex flex-col items-center justify-center p-4 text-muted-foreground italic text-[10px] opacity-60">
              <span class="mb-1">Vide</span>
            </div>
            <div v-else class="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
              <p class="p11 text-text font-bold px-1 mb-2">Sélectionnés</p>
              <div
                v-for="item in selectedItems"
                :key="item.id"
                class="flex items-center justify-between px-2 py-1.5 bg-background border border-border text-xs group animate-in fade-in slide-in-from-right-1"
              >
                <span class="truncate font-medium">{{ item.name }}</span>
                <button
                  type="button"
                  @click.stop="removeRelation(item.id)"
                  class="text-muted-foreground hover:text-destructive transition-colors ml-2"
                >
                  <X class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Command>
    </div>

    <p v-if="config.description" class="text-[10px] text-muted-foreground italic">
      {{ config.description }}
    </p>
    <p v-if="error" class="text-[10px] text-destructive font-bold italic animate-bounce-subtle">
      {{ error }}
    </p>
  </div>
</template>
