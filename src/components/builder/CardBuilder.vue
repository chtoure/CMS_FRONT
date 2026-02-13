<script setup lang="ts">
import { computed } from 'vue';
import type { ContainerStyles } from '../../type/component';
import { buildStyles, buildInlineStyles } from '../../lib/styleProcessor';

interface Props {
  styles?: ContainerStyles;
  data?: Record<string, unknown>;
}

const props = defineProps<Props>();

const computedClasses = computed(() => {
  return buildStyles('container', props.styles as Record<string, unknown>);
});

const computedInlineStyles = computed(() => {
  return buildInlineStyles('container', props.styles as Record<string, unknown>);
});
</script>

<template>
  <div :class="['relative transition-all duration-200 overflow-auto custom-scrollbar w-full h-full', computedClasses]" :style="computedInlineStyles">
    <slot />
  </div>
</template>