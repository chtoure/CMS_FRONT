<script setup lang="ts">
import { computed } from 'vue';
import type { ContainerStyles } from '../../type/component';
import { buildStyles, buildInlineStyles } from '../../lib/styleProcessor';

interface Props {
  styles?: ContainerStyles;
  data?: Record<string, unknown>;
}

const props = defineProps<Props>();

const gridClasses = computed(() => {
  return buildStyles('container', props.styles as Record<string, unknown>);
});

const gridInlineStyles = computed(() => {
  return buildInlineStyles('container', props.styles as Record<string, unknown>);
});
</script>

<template>
  <div :class="['w-full', gridClasses]" :style="gridInlineStyles">
    <slot />
    
    <div v-if="!$slots.default" class="col-span-full p-10 border-2 border-dashed border-gray-300 bg-gray-50/50 text-center text-gray-500 rounded-lg flex items-center justify-center min-h-[150px]">
      <span class="text-sm font-semibold uppercase">Grille vide - Glissez des éléments ici</span>
    </div>
  </div>
</template>