<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { type IFieldDefinition, type ITextConfig } from '../../type/field'

const props = defineProps<{
  config: IFieldDefinition & ITextConfig
  modelValue?: string | null
  error?: string
  hideLabel?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const value = computed({
  get: () => (props.modelValue ?? '') as string,
  set: (val) => emit('update:modelValue', val)
})

const placeholder = computed(() => props.config.placeholder || props.config.label)
</script>

<template>
  <div class="grid w-full items-center gap-1.5">
    <Label v-if="!hideLabel" :for="config.name" class="block font-medium mb-1">
      {{ config.label }}
      <span v-if="config.required" class="text-destructive">*</span>
    </Label>

    <Input
      :id="config.name"
      v-model="value"
      :placeholder="placeholder"
      type="text"
      :required="config.required"
      :minlength="config.minLength"
      :maxlength="config.maxLength"
      class="input-custom"
    />

    <p v-if="config.description" class="text-xs text-muted-foreground">
      {{ config.description }}
    </p>

    <p v-if="error" class="p12 text-destructive font-medium italic">
      {{ error }}
    </p>
  </div>
</template>
