<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  label: string;
  modelValue?: string | number;
  type?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  icon?: Component;
  compact?: boolean;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  compact: false,
  disabled: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>();
</script>

<template>
  <div :class="['property-input', compact ? 'compact' : '']">
    <label class="text-[10px] font-mono font-bold text-builder-bar-text/70 uppercase tracking-wider">
      {{ label }}
    </label>
    <div class="relative flex items-center">
      <input
        :type="type"
        :value="modelValue"
        @input="(e) => emit('update:modelValue', (e.target as HTMLInputElement).value)"
        :placeholder="placeholder"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        class="input-field"
      />
      <component v-if="icon" :is="icon" class="absolute right-2.5 w-3.5 h-3.5 text-builder-bar-text/40 pointer-events-none" />
    </div>
  </div>
</template>

<style scoped>
.property-input {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.property-input.compact {
  gap: 0.125rem;
}

.property-input.compact label {
  font-size: 0.75rem;
}

.input-field {
  width: 100%;
  height: 1.75rem;
  padding: 0.25rem 0.625rem;
  font-size: 0.625rem;
  font-family: monospace;
  border-radius: 0.375rem;
  border: 1px solid;
  transition: all 0.2s;
  background-color: var(--builder-input-bg);
  border-color: var(--builder-input-border);
  color: var(--builder-input-text);
}

.input-field::placeholder {
  color: var(--builder-input-placeholder);
}

.input-field:focus-visible {
  border-color: var(--primary);
  opacity: 0.5;
  outline: 1px solid var(--primary);
  outline-offset: 0.125rem;
}

.input-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
