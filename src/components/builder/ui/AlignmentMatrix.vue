<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  justify?: string;
  align?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:justify', 'update:align']);

// Justify: start, center, end, between
// Align: start, center, end, stretch

const matrix = [
  ['start', 'start'], ['center', 'start'], ['end', 'start'],
  ['start', 'center'], ['center', 'center'], ['end', 'center'],
  ['start', 'end'], ['center', 'end'], ['end', 'end']
];

const isActive = (j: string, a: string) => props.justify === j && props.align === a;

function select(j: string, a: string) {
  emit('update:justify', j as any);
  emit('update:align', a as any);
}
</script>

<template>
  <div class="grid grid-cols-3 gap-1 p-1.5 bg-builder-input-bg border border-builder-bar-border rounded w-[72px] h-[72px]">
    <button
      v-for="[j, a] in matrix"
      :key="`${j}-${a}`"
      @click="select(j, a)"
      :class="[
        'w-full h-full rounded-[1px] transition-colors',
        isActive(j, a) ? 'bg-primary' : 'bg-builder-bar-text/10 hover:bg-builder-bar-text/20'
      ]"
    />
  </div>
</template>
