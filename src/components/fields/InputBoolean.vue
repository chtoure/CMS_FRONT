<script setup lang="ts">
import { computed } from 'vue'
import { Checkbox } from '../../components/ui/checkbox'
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
  get: () => !!props.modelValue,
  set: (val) => emit('update:modelValue', val)
})
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center space-x-2">
      <Checkbox
        :id="config.name"
        :checked="value"
        @update:checked="(val: boolean) => value = val"
      />
      <Label
        :for="config.name"
        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        :class="{ 'text-destructive': error }"
      >
        {{ config.label }}
        <span v-if="config.required" class="text-destructive">*</span>
      </Label>
    </div>
    <p v-if="config.description" class="text-xs text-muted-foreground ml-6">
      {{ config.description }}
    </p>
    <p v-if="error" class="mt-2 text-xs text-destructive font-medium italic">
      {{ error }}
    </p>
  </div>
</template>
