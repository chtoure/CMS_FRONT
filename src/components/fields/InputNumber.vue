<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { type IFieldDefinition, type IBaseField, type INumberConfig } from '../../type/field'
import { type JsonValue } from '../../type/content-entry'

const props = defineProps<{
  config: IFieldDefinition
  modelValue?: JsonValue
  error?: string
}>()

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get: () => typeof props.modelValue === 'number' ? props.modelValue : Number(props.modelValue ?? 0),
  set: (val) => emit('update:modelValue', val)
})

const numberConfig = computed(() => props.config as IBaseField & INumberConfig)
const placeholder = computed(() => props.config.placeholder || props.config.label)
</script>

<template>
  <div class="grid w-full items-center gap-1.5">
    <Label :for="config.name" class="text-text font-medium mb-2" :class="{ 'text-destructive': error }">
      {{ config.label }}
      <span v-if="config.required" class="text-destructive">*</span>
    </Label>
    <Input
      :id="config.name"
      v-model.number="value"
      :placeholder="placeholder"
      type="number"
      :min="numberConfig.min"
      :max="numberConfig.max"
      :step="numberConfig.step"
      class="input-custom"
      :class="{ 'border-destructive': error }"
    />
    <p v-if="config.description" class="text-xs text-muted-foreground">
      {{ config.description }}
    </p>
    <p v-if="error" class="mt-2 text-xs text-destructive font-medium italic">
      {{ error }}
    </p>
  </div>
</template>
