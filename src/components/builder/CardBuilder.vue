<script setup lang="ts">
import { computed } from 'vue';
import type { ContainerStyles } from '../../type/component';
import { buildVisualStyles, buildVisualInlineStyles } from '../../lib/styleProcessor';

interface Props {
  styles?: ContainerStyles;
  data?: Record<string, unknown>;
}

const props = defineProps<Props>();

const computedClasses = computed(() => {
  return buildVisualStyles(props.styles as Record<string, unknown>);
});

const computedInlineStyles = computed(() => {
  return buildVisualInlineStyles(props.styles as Record<string, unknown>);
});
</script>

<template>
  <div :class="['relative transition-all duration-200 overflow-auto custom-scrollbar w-full', computedClasses]" :style="computedInlineStyles">
    <slot />
  </div>
</template>