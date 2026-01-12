<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { type IFieldDefinition } from '../../type/field'
import { type JsonValue } from '../../type/content-entry'

const props = defineProps<{
  config: IFieldDefinition
  modelValue?: JsonValue
  error?: string
}>()

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get: () => (props.modelValue ?? '') as string,
  set: (val) => emit('update:modelValue', val)
})

const placeholder = computed(() => props.config.placeholder || props.config.label)
</script>

<template>
  <div class="grid w-full items-center gap-1.5">
    <Label :for="config.name" class="block text-text font-medium mb-2">
      {{ config.label }}
      <span v-if="config.required" class="text-destructive">*</span>
    </Label>
    <Input
      :id="config.name"
      v-model="value"
      :placeholder="placeholder"
      :type="'text'"
      class="input-custom"
    />
    <p v-if="config.description" class="text-xs text-muted-foreground">
      {{ config.description }}
    </p>
    <p v-if="error" class="mt-2 text-xs text-destructive font-medium italic">
      {{ error }}
    </p>
  </div>
</template>
