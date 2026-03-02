<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed } from 'vue';
import type { ContainerStyles } from '../../type/component';
import { buildVisualStyles, buildVisualInlineStyles } from '../../lib/styleProcessor';

interface Props {
  styles?: ContainerStyles;
  data?: Record<string, unknown>;
}

const props = defineProps<Props>();

import { inject } from 'vue';

const builderState = inject<{
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' }
}>('builderState', { currentBreakpoint: { value: 'default' } } as any);

const computedClasses = computed(() => {
  const visual = buildVisualStyles(props.styles as Record<string, unknown>);
  const layout = buildLayoutStyles(props.styles as Record<string, unknown>);
  return [visual, layout].filter(Boolean).join(' ');
});

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  const vis = buildVisualInlineStyles(props.styles as Record<string, unknown>, bp);
  const lay = buildLayoutInlineStyles(props.styles as Record<string, unknown>, bp);
  return {
    ...vis,
    ...lay
  };
});
</script>

<template>
  <div :class="['relative transition-all duration-200 overflow-auto custom-scrollbar w-full', computedClasses]" :style="computedInlineStyles">
    <slot />
  </div>
</template>