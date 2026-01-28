<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, ChevronsUpDown, X } from 'lucide-vue-next'
import { type IFieldDefinition, type ITaxonomyConfig } from '../../type/field'
import { cn } from '../../lib/utils'

import Label from '../ui/label/Label.vue';
import Badge from '../ui/badge/Badge.vue';
import { getTaxonomyTermsByTaxonomyIds } from '../../hook/taxonomy';
import Popover from '../ui/popover/Popover.vue';
import PopoverTrigger from '../ui/popover/PopoverTrigger.vue';
import Button from '../ui/button/Button.vue';
import PopoverContent from '../ui/popover/PopoverContent.vue';
import Command from '../ui/command/Command.vue';
import CommandInput from '../ui/command/CommandInput.vue';
import CommandList from '../ui/command/CommandList.vue';
import CommandEmpty from '../ui/command/CommandEmpty.vue';
import CommandGroup from '../ui/command/CommandGroup.vue';
import CommandItem from '../ui/command/CommandItem.vue';
import BaseCheckbox from '../base/BaseCheckbox.vue';
import type { TaxonomyTerm } from '../../type/taxonomy';

const props = defineProps<{
  config: IFieldDefinition & ITaxonomyConfig
  modelValue?: number | number[] | null
  error?: string
  hideLabel?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | number[] | null): void
}>()

const open = ref(false)
const { data: taxonomy, isLoading, error: taxonomyError } = getTaxonomyTermsByTaxonomyIds(props.config.taxonomyIds)
const options = computed<TaxonomyTerm[]>(() =>{
  console.log(taxonomy.value);
  return taxonomy.value || []
} )

console.log(options.value);


const value = computed({
  get: () => {
    if (props.config.multiple) {
      return Array.isArray(props.modelValue) ? props.modelValue : []
    }
    return props.modelValue ?? null
  },
  set: (val) => emit('update:modelValue', val)
})

const toggleOption = (id: number) => {
  console.log('checker', id);

  if (!props.config.multiple) {
    value.value = value.value === id ? null : id
    open.value = false
    return
  }

  const currentValues = Array.isArray(value.value) ? [...value.value] : []
  const index = currentValues.indexOf(id)

  if (index > -1) {
    currentValues.splice(index, 1)
  } else {
    currentValues.push(id)
  }
  value.value = currentValues
}

const removeOption = (id: number) => {
  if (Array.isArray(value.value)) {
    value.value = value.value.filter(v => v !== id)
  } else if (value.value === id) {
    value.value = null
  }
}
</script>

<template>
  <div class="grid w-full items-center gap-1.5">
    <Label v-if="!hideLabel" :for="config.name" class="block text-text font-medium mb-2">
      {{ config.label }}
      <span v-if="config.required" class="text-destructive">*</span>
    </Label>

    <div v-if="isLoading" class="h-10 w-full bg-muted animate-pulse rounded-md" />
    <div v-else-if="taxonomyError || options == undefined || options === null" class="h-10 w-full bg-destructive animate-pulse rounded-md" />

    <template v-else>
      <!-- Rendu Checkbox -->
      <div v-if="config.renderType === 'checkbox'" class="flex flex-col gap-2.5 py-1">
        <div v-for="option in options" :key="option.id" class="flex items-center space-x-2">
          <BaseCheckbox
            :id="`${config.name}-${option.id}`"
            :checked="config.multiple ? (Array.isArray(value) && value.includes(option.id)) : value === option.id"
            @update:checked="toggleOption(option.id)"
          />
          <label :for="`${config.name}-${option.id}`" class="text-sm cursor-pointer select-none">
            {{ option.name }}
          </label>
        </div>
      </div>

      <div v-else class="space-y-3">
        <div v-if="config.renderType === 'badges'" class="flex flex-wrap gap-2 min-h-[32px]">
          <Badge
            v-for="id in (Array.isArray(value) ? value : (value ? [value] : []))"
            :key="id"
            variant="secondary"
            class="pl-2 pr-1 py-1 flex items-center gap-1"
          >
            {{ options.find(o => o.id === id)?.name }}
            <button @click="removeOption(id)" type="button" class="hover:bg-destructive/20 rounded-full p-0.5">
              <X class="w-3 h-3" />
            </button>
          </Badge>
        </div>

        <Popover v-model:open="open">
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              role="combobox"
              :aria-expanded="open"
              class="w-full justify-between font-normal bg-background"
              :class="{ 'border-destructive': error }"
            >
              <span class="truncate">
                <template v-if="config.multiple">
                  {{ Array.isArray(value) && value.length > 0 ? `${value.length} sélectionné(s)` : config.placeholder || 'Sélectionner...' }}
                </template>
                <template v-else>
                  {{ options.find((opt) => opt.id === value)?.name || config.placeholder || 'Sélectionner...' }}
                </template>
              </span>
              <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-full p-0 popover-content-width-full">
            <Command>
              <CommandInput placeholder="Rechercher un terme..." />
              <CommandList>
                <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    v-for="option in options"
                    :key="option.id"
                    :value="option.name"
                    @select="toggleOption(option.id)"
                  >
                    <Check
                      :class="cn(
                        'mr-2 h-4 w-4',
                        (config.multiple && Array.isArray(value) && value.includes(option.id)) || value === option.id
                          ? 'opacity-100'
                          : 'opacity-0'
                      )"
                    />
                    {{ option.name }}
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </template>

    <p v-if="config.description" class="text-[0.8rem] text-muted-foreground">{{ config.description }}</p>
    <p v-if="error" class="text-[0.8rem] text-destructive font-medium">{{ error }}</p>
  </div>
</template>

<style scoped>
.popover-content-width-full {
  width: var(--radix-popover-trigger-width);
}
</style>
