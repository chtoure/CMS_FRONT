<script setup lang="ts">
import { AlignCenterVertical, AlignEndVertical, AlignStartVertical } from 'lucide-vue-next';
import type { Component } from 'vue';

/* eslint-disable @typescript-eslint/no-explicit-any */
interface Props {
  justify?: string;
  align?: string;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:justify', 'update:align']);

// Justify: start, center, end, between
// Align: start, center, end, stretch

const matrix: [string, string, Component][] = [
  ['start', 'start', AlignStartVertical ], ['center', 'start', AlignCenterVertical], ['end', 'start', AlignEndVertical],
  ['start', 'center', AlignStartVertical ], ['center', 'center', AlignCenterVertical], ['end', 'center', AlignEndVertical],
  ['start', 'end', AlignStartVertical ], ['center', 'end', AlignCenterVertical], ['end', 'end', AlignEndVertical]
];

const isActive = (j: string, a: string) => (props.justify || 'start') === j && (props.align || 'start') === a;

function select(j: string, a: string) {
  emit('update:justify', j as any);
  emit('update:align', a as any);
}
</script>

<template>
  <div class="grid grid-cols-3 gap-0.5 p-1 bg-builder-input-bg border border-builder-bar-border rounded w-[68px] h-[68px] shrink-0">
    <button
      v-for="[j, a, icon] in matrix"
      :key="`${j}-${a}`"
      @click="select(j, a)"
      :class="[
        'w-full h-full rounded-[1px] transition-all duration-200 flex justify-center items-center',
        isActive(j, a)
          ? 'bg-primary shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] text-white'
          : 'bg-builder-bar-text/10 hover:bg-builder-bar-text/20 border border-builder-bar-border/20'
      ]"
      :title="`Justify: ${j}, Align: ${a}`"
    >
      <component :is="icon" class="w-3 h-3" stroke-width="1" />
    </button>
  </div>
</template>
