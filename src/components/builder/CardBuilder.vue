<script setup lang="ts">
import { computed } from 'vue';
import type { ContainerStyles } from '../../type/component';
import { buildStyles } from '../../lib/styleProcessor';

interface Props {
  styles?: ContainerStyles;
  data?: Record<string, unknown>;
}

const props = defineProps<Props>();

const computedClasses = computed(() => {
  return buildStyles('container', props.styles as Record<string, unknown>);
});
</script>

<template>
  <div :class="['relative transition-all duration-200 overflow-hidden', computedClasses]">
    <slot />

    <div 
      v-if="!$slots.default" 
      class="w-full min-h-[100px] border-2 border-dashed border-gray-300 flex items-center justify-center rounded-lg"
    >
      <span class="text-gray-400 text-sm">Zone de dépôt (Carte)</span>
    </div>
  </div>
</template>