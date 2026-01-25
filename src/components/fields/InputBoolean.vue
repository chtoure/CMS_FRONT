<script setup lang="ts">
import { computed } from 'vue'
import { Switch } from '../../components/ui/switch'
import { Label } from '../../components/ui/label'
import { type IFieldDefinition, type IBooleanConfig } from '../../type/field'

// On utilise l'intersection pour accéder à defaultValue si nécessaire
const props = defineProps<{
  config: IFieldDefinition & IBooleanConfig
  modelValue?: boolean | null // On restreint à boolean
  error?: string
  hideLabel?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const value = computed({
  // Si modelValue est undefined, on peut fallback sur la defaultValue de la config
  get: () => props.modelValue ?? props.config.defaultValue ?? false,
  set: (val) => emit('update:modelValue', val)
})
</script>

<template>
  <div class="flex flex-col gap-2 p-2 rounded-lg border border-transparent transition-colors" :class="{ 'bg-destructive/5 border-destructive/20': error }">
    <div class="flex items-center justify-between gap-4">
      <div class="space-y-0.5">
        <Label
          v-if="!hideLabel"
          :for="config.name"
          class="text-sm font-semibold leading-none cursor-pointer"
        >
          {{ config.label }}
          <span v-if="config.required" class="text-destructive ml-0.5">*</span>
        </Label>
        <p v-if="config.description" class="text-xs text-muted-foreground">
          {{ config.description }}
        </p>
      </div>

      <Switch
        :id="config.name"
        :checked="value"
        @update:checked="(val: boolean) => value = val"
        class="data-[state=unchecked]:bg-slate-200 data-[state=checked]:bg-primary border border-border"
      />
    </div>

    <p v-if="error" class="p12 font-medium text-destructive italic">
      {{ error }}
    </p>
  </div>
</template>
