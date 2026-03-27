<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed } from 'vue';
import type { ContainerStyles, AnyComponentInstance } from '../../type/component';
import { buildCardStyles, buildCardInlineStyles } from '../../lib/style/cardProcessor';
import { useVariableResolver } from '../../hook/variable';
import { inject } from 'vue';
import { resolveValueForBreakpoint } from '../../lib/style/core';

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

// Determine the current position value to conditionally apply base classes
const currentPosition = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  const pos = (props.styles as any)?.position;
  return resolveValueForBreakpoint<string>(pos, bp, resolveValue) ?? 'static';
});

// Whether the element uses non-normal positioning (fixed, absolute, sticky)
const isPositioned = computed(() =>
  ['fixed', 'absolute', 'sticky'].includes(currentPosition.value)
);

const computedClasses = computed(() => {
  return buildCardStyles(props.styles as Record<string, unknown>, resolveValue);
});

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  return buildCardInlineStyles(props.styles as Record<string, unknown>, bp, resolveValue);
});
</script>

<template>
  <div
    :class="[
      'transition-all duration-200 w-full h-full relative overflow-auto custom-scrollbar',
      computedClasses
    ]"
    :style="computedInlineStyles"
  >
    <slot />
  </div>
</template>