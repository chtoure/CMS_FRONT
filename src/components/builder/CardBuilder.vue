<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed } from 'vue';
import type { ContainerStyles, AnyComponentInstance } from '../../type/component';
import { buildCardStyles, buildCardInlineStyles } from '../../lib/style/cardProcessor';
import { useVariableResolver } from '../../hook/variable';
import { inject } from 'vue';

interface Props {
  styles?: ContainerStyles;
  data?: Record<string, unknown>;
  element?: AnyComponentInstance;
  children?: AnyComponentInstance[];
}

const props = defineProps<Props>();

const builderState = inject<{
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' }
}>('builderState', { currentBreakpoint: { value: 'default' } } as any);

const { resolveValue } = useVariableResolver();

const computedClasses = computed(() => {
  return buildCardStyles(props.styles as Record<string, unknown>, resolveValue);
});

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  return buildCardInlineStyles(props.styles as Record<string, unknown>, bp, resolveValue);
});
</script>

<template>
  <div :class="['relative transition-all duration-200 overflow-auto custom-scrollbar w-full h-full', computedClasses]" :style="computedInlineStyles">
    <slot />
  </div>
</template>