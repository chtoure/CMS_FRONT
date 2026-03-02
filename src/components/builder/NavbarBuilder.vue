<script setup lang="ts">
import { computed, inject } from 'vue';
import type { ContainerStyles } from '../../type/component';
import { buildVisualStyles, buildVisualInlineStyles, buildLayoutStyles, buildLayoutInlineStyles } from '../../lib/styleProcessor';

interface Props {
  styles?: ContainerStyles;
  data?: {
    isSticky?: boolean;
    // Ajout d'autres options si nécessaire
    [key: string]: unknown;
  };
}

const props = defineProps<Props>();

const builderState = inject<{
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}>('builderState', { currentBreakpoint: { value: 'default' } } as any);

const computedClasses = computed(() => {
  return buildVisualStyles(props.styles as Record<string, unknown>);
});

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  return buildVisualInlineStyles(props.styles as Record<string, unknown>, bp);
});

const computedLayoutClasses = computed(() => {
  return buildLayoutStyles(props.styles as Record<string, unknown>);
});

const computedLayoutInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  return buildLayoutInlineStyles(props.styles as Record<string, unknown>, bp);
});
</script>

<template>
  <nav 
    class="w-full transition-all duration-300 z-50"
    :class="[
      computedClasses,
      { 'sticky top-0': props.data?.isSticky }
    ]"
    :style="computedInlineStyles"
  >
    <div 
      class="w-full h-full min-h-[60px]"
      :class="computedLayoutClasses"
      :style="computedLayoutInlineStyles"
    >
      <slot />
    </div>
  </nav>
</template>
