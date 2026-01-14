<script setup lang="ts">
import { computed } from 'vue'

import { Label } from '../../components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'

import { type IFieldDefinition } from '../../type/field'
import { type JsonValue } from '../../type/content-entry'

const props = defineProps<{
  config: IFieldDefinition
  modelValue?: JsonValue
  error?: string
  hideLabel?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get: () => (props.modelValue ?? '') as string,
  set: (val) => emit('update:modelValue', val)
})



const mockOptions = computed(() => {
    // Mocking taxonomy options based on slug if needed, or just generic list
    return [
       { value: 'cat-1', label: 'Catégorie 1' },
       { value: 'cat-2', label: 'Catégorie 2' },
       { value: 'cat-3', label: 'Catégorie 3' },
       { value: 'tag-1', label: 'Tag 1' },
       { value: 'tag-2', label: 'Tag 2' }
    ]
})

// Placeholder for taxonomy selection logic

</script>

<template>
  <div class="grid w-full items-center gap-1.5">
    <Label v-if="!hideLabel" :for="config.name" class="block text-text font-medium mb-2">
      {{ config.label }}
      <span v-if="config.required" class="text-destructive">*</span>
    </Label>

    <Select v-model="value">
      <SelectTrigger :id="config.name" class="border-border" :class="{ 'border-destructive': error }">
        <SelectValue :placeholder="config.placeholder || 'Sélectionner...'" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="option in mockOptions"
          :key="option.value"
          :value="option.value"
          class="select-item-custom"
        >
          {{ option.label }}
        </SelectItem>
      </SelectContent>
    </Select>

    <p v-if="config.description" class="text-xs text-muted-foreground">
      {{ config.description }}
    </p>
    <p v-if="error" class="mt-2 text-xs text-destructive font-medium italic">
      {{ error }}
    </p>
  </div>
</template>
