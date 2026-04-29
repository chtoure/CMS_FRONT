<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  options: { label?: string; value: string | number | boolean; icon?: Component; tooltip?: string }[];
  modelValue?: string | number | boolean | null;
  size?: 'sm' | 'md';
}

defineProps<Props>();
const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="flex bg-builder-input-bg border border-border rounded overflow-hidden p-0.5 w-full">
    <button
      v-for="opt in options"
      :key="String(opt.value)"
      @click="emit('update:modelValue', opt.value)"
      :title="opt.tooltip"
      :class="[
        'flex-1 flex items-center justify-center transition-all px-1.5 rounded-sm',
        size === 'sm' ? 'h-6' : 'h-7',
        modelValue === opt.value 
          ? 'bg-builder-bar-border text-white shadow-sm' 
          : 'text-builder-bar-text/60 hover:text-builder-bar-text hover:bg-white/5'
      ]"
    >
      <component v-if="opt.icon" :is="opt.icon" :class="size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'" />
      <span v-else-if="opt.label" class="text-[10px] font-medium leading-none">{{ opt.label }}</span>
    </button>
  </div>
</template>
