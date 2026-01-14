<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { type IFieldDefinition, type INumberConfig } from '../../type/field'

const props = defineProps<{
  config: IFieldDefinition & INumberConfig
  modelValue?: number | string | null
  error?: string
  hideLabel?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
}>()

const value = computed({
  get: () => (props.modelValue === null || props.modelValue === undefined) ? '' : props.modelValue,
  set: (val: number | string | null) => {
    if (val === '' || val === null || val === undefined) {
      emit('update:modelValue', null)
    } else {
      emit('update:modelValue', Number(val))
    }
  }
})

const placeholder = computed(() => props.config.placeholder || props.config.label)
</script>

<template>
  <div class="grid w-full items-center gap-1.5">
    <Label
      v-if="!hideLabel"
      :for="config.name"
      class="text-sm font-medium mb-1"
    >
      {{ config.label }}
      <span v-if="config.required" class="text-destructive ml-0.5">*</span>
    </Label>

    <Input
      :id="config.name"
      v-model.number="value"
      :placeholder="placeholder"
      type="number"
      :min="config.min"
      :max="config.max"
      :step="config.step ?? 'any'"
      class="input-custom"
    />

    <p v-if="config.description && !error" class="text-xs text-muted-foreground">
      {{ config.description }}
    </p>

    <p v-if="error" class="p12 font-medium text-destructive italic">
      {{ error }}
    </p>
  </div>
</template>
