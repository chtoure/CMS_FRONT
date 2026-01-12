<script setup lang="ts">
import { ref, computed } from 'vue'
import { Label } from '../../components/ui/label'
import { Button } from '../../components/ui/button'
import { cn } from '../../lib/utils'
import { Plus, Link as LinkIcon, X, Check, Search } from 'lucide-vue-next'
import { type IFieldDefinition, type IRelationConfig, type IBaseField } from '../../type/field'
import { type JsonValue } from '../../type/content-entry'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover'
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
  config: IFieldDefinition
  modelValue?: JsonValue
  error?: string
}>()

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get: () => props.modelValue as IRelationItem | IRelationItem[] | null,
  set: (val) => emit('update:modelValue', val as JsonValue)
})

const relationConfig = computed(() => props.config as IBaseField & IRelationConfig)
const isDialogOpen = ref(false)

// Mock data as requested
const mockEntries: IRelationItem[] = [
  { id: 1, name: 'Article de blog 1' },
  { id: 2, name: 'Page à propos' },
  { id: 3, name: 'Contact' },
  { id: 4, name: 'Services' },
  { id: 5, name: 'Projets récents' }
]

const toggleSelection = (entry: IRelationItem) => {
  if (relationConfig.value.multiple) {
    const current = Array.isArray(value.value) ? [...value.value] : []
    const index = current.findIndex(e => e.id === entry.id)
    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(entry)
    }
    value.value = current
  } else {
    value.value = entry
  }
}

const removeRelation = (id: number) => {
  if (Array.isArray(value.value)) {
    value.value = value.value.filter((e: IRelationItem) => e.id !== id)
  } else {
    value.value = null
  }
}

const isSelected = (id: number) => {
  if (Array.isArray(value.value)) {
    return value.value.some(e => e.id === id)
  }
  return (value.value as IRelationItem | null)?.id === id
}
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <Label :for="config.name" class="text-sm font-semibold tracking-tight text-foreground/80">
        {{ config.label }}
        <span v-if="config.required" class="text-destructive">*</span>
      </Label>
      <span v-if="relationConfig.multiple" class="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Multiple</span>
    </div>

    <div class="flex flex-wrap gap-1.5 p-2 bg-muted/30 rounded-lg border border-border/50 min-h-[46px] transition-all hover:bg-muted/50">
      <!-- Selected Relations Display -->
      <template v-if="value">
        <div
          v-for="(item, index) in (Array.isArray(value) ? value : [value])"
          :key="(item as IRelationItem).id || index"
          class="flex items-center gap-1.5 pl-2 pr-1 h-7 rounded-md bg-background border shadow-sm text-xs font-medium animate-in fade-in zoom-in duration-200"
        >
          <LinkIcon class="h-3 w-3 text-primary/70" />
          <span>{{ (item as IRelationItem).name || `ID: ${(item as IRelationItem).id}` }}</span>
          <button
            type="button"
            @click.stop="removeRelation((item as IRelationItem).id)"
            class="hover:bg-destructive/10 hover:text-destructive rounded-sm p-0.5 transition-colors"
          >
            <X class="h-3 w-3" />
          </button>
        </div>
      </template>

      <!-- Trigger Popover -->
      <Popover v-model:open="isDialogOpen">
        <PopoverTrigger as-child>
          <Button
            v-if="relationConfig.multiple || !value"
            variant="ghost"
            size="sm"
            class="h-7 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-background border-dashed border h-7 ml-auto"
          >
            <Plus class="h-3 w-3 mr-1" />
            Lier
          </Button>
        </PopoverTrigger>

        <PopoverContent class="w-[280px] p-0 shadow-2xl rounded-xl border-border/50" align="end">
          <Command class="rounded-xl">
            <div class="flex items-center border-b px-3 bg-muted/20">
              <Search class="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput placeholder="Rechercher..." class="h-10 text-xs border-none focus:ring-0" />
            </div>
            <CommandEmpty class="py-6 text-center text-xs text-muted-foreground">Aucun résultat trouvé.</CommandEmpty>
            <CommandList class="max-h-[240px] overflow-y-auto">
              <CommandGroup class="p-1">
                <CommandItem
                  v-for="entry in mockEntries"
                  :key="entry.id"
                  :value="entry.name"
                  class="flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-xs"
                  @select="() => {
                    toggleSelection(entry)
                    if (!relationConfig.multiple) isDialogOpen = false
                  }"
                >
                  <div class="flex items-center justify-center h-4 w-4 border rounded-sm">
                    <Check
                      :class="cn(
                        'h-3 w-3 transition-all',
                        isSelected(entry.id) ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                      )"
                    />
                  </div>
                  <span class="flex-1 truncate">{{ entry.name }}</span>
                  <span class="text-[10px] opacity-40">#{{ entry.id }}</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <div v-if="!value" class="flex items-center text-[11px] text-muted-foreground italic ml-1 select-none">
        Aucune relation sélectionnée
      </div>
    </div>

    <p v-if="config.description" class="text-[10px] text-muted-foreground px-1 translate-y-[-2px]">
      {{ config.description }}
    </p>
    <p v-if="error" class="text-[10px] text-destructive font-semibold px-1 italic">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.animate-in {
  animation: animate-in 0.2s ease-out;
}

@keyframes animate-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
