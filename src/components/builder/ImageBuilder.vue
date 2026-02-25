<script setup lang="ts">
import { computed } from 'vue';
import type { StaticStyles } from '../../type/component';
import { buildStyles, buildInlineStyles } from '../../lib/styleProcessor';

interface Props {
  styles?: StaticStyles;
  data?: {
    src?: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  };
}

const props = defineProps<Props>();

import { inject } from 'vue';

const builderState = inject<{
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' }
}>('builderState', { currentBreakpoint: { value: 'default' } } as any);

const computedClasses = computed(() => {
  return buildStyles('static', props.styles as Record<string, unknown>);
});

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  return buildInlineStyles('static', props.styles as Record<string, unknown>, bp);
});

const imageStyles = computed(() => {
  const { width, height, objectFit } = props.data || {};
  return {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
    height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
    objectFit: objectFit || 'cover',
  };
});
</script>

<template>
  <img
    :src="props.data?.src || 'https://via.placeholder.com/150'"
    :alt="props.data?.alt || 'Image'"
    :class="computedClasses"
    :style="{ ...computedInlineStyles, ...imageStyles }"
  />
</template>
