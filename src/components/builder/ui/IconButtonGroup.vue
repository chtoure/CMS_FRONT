<script setup lang="ts">
import type { Component } from 'vue';

interface Props {
  options: { value: string | number | boolean; icon: Component; tooltip?: string }[];
  modelValue?: string | number | boolean | null | (string | number | boolean)[];
  multiple?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue']);

function isActive(val: string | number | boolean) {
  if (props.multiple && Array.isArray(props.modelValue)) {
    return (props.modelValue as (string | number | boolean)[]).includes(val);
  }
  return props.modelValue === val;
}

function select(val: string | number | boolean) {
  if (props.multiple && Array.isArray(props.modelValue)) {
    const newValues = [...(props.modelValue as (string | number | boolean)[])];
    const idx = newValues.indexOf(val);
    if (idx > -1) newValues.splice(idx, 1);
    else newValues.push(val);
    emit('update:modelValue', newValues);
  } else {
    emit('update:modelValue', val);
  }
}
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      v-for="opt in options"
      :key="String(opt.value)"
      @click="select(opt.value)"
      :title="opt.tooltip"
      :class="[
        'w-7 h-7 flex items-center justify-center rounded border border-builder-bar-border transition-all',
        isActive(opt.value)
          ? 'bg-primary text-white'
          : 'bg-builder-input-bg border-builder-bar-border text-builder-bar-text/60 hover:border-builder-bar-border/80 hover:text-builder-bar-text'
      ]"
    >
      <component :is="opt.icon" class="w-3.5 h-3.5" />
    </button>
  </div>
</template>
