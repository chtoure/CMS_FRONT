<script setup lang="ts">
import { computed } from 'vue';

import type { Component } from 'vue';

interface Props {
  value: string | boolean;
  modelValue?: string | boolean | null;
  icon?: Component;
  tooltip?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  disabled: false
});

const emit = defineEmits<{
  'update:modelValue': [value: string | boolean]
}>();

const isActive = computed(() => props.modelValue === props.value);

const handleClick = () => {
  if (!props.disabled) {
    emit('update:modelValue', props.value);
  }
};
</script>

<template>
  <button
    @click="handleClick"
    :disabled="disabled"
    :title="tooltip"
    :class="[
      'relative transition-all rounded border',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      size === 'sm' ? 'h-6 w-6 px-1' : 'h-8 w-8 px-1.5',
      isActive
        ? 'bg-primary/20 border-primary/50 text-primary shadow-sm shadow-primary/20'
        : 'bg-builder-input-bg border-border text-builder-bar-text hover:bg-white/5 hover:border-white/20'
    ]"
  >
    <component v-if="icon" :is="icon" :class="size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'" />
    <slot />
  </button>
</template>

<style scoped>
button:active:not(:disabled) {
  transform: scale(0.95);
}
</style>
