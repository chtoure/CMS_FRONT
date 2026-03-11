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
    <div class="flex items-center justify-between h-7 px-2 bg-builder-input-bg border border-builder-bar-border rounded hover:border-builder-bar-border transition-all focus-within:border-primary group">
      <!-- Icon/Label Area -->
      <div class="flex items-center gap-1.5 shrink-0 opacity-40 group-hover:opacity-60 transition-opacity">
        <component v-if="icon" :is="icon" class="w-3.5 h-3.5" />
        <span v-else class="text-[9px] font-bold font-mono tracking-tight">{{ label }}</span>
      </div>

      <!-- Input Area -->
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

      <!-- Variable/Action Slot -->
      <div class="shrink-0 ml-1">
        <slot name="action" />
      </div>
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
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0 0.5rem;
  font-size: 10px;
  font-family: monospace;
  background: transparent;
  border: none;
  color: var(--builder-input-text);
  outline: none;
  text-align: right;
}

.input-field::placeholder {
  color: var(--builder-input-placeholder);
  opacity: 0.5;
}

.input-field:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
