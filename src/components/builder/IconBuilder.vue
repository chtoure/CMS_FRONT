<script setup lang="ts">
import { computed, inject } from 'vue';
import type { StaticStyles } from '../../type/component';
import { buildIconStyles, buildIconInlineStyles } from '../../lib/style/iconProcessor';
import { useVariableResolver } from '../../hook/variable';

interface Props {
  styles?: StaticStyles;
  data?: {
    icon?: any;
    size?: any;
    color?: any;
  };
}

const props = defineProps<Props>();

const builderState = inject<{
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' }
}>('builderState', { currentBreakpoint: { value: 'default' } } as any);

const { resolveValue } = useVariableResolver();

const computedClasses = computed(() => {
  return buildIconStyles(props.styles as Record<string, unknown>, resolveValue);
});

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  return buildIconInlineStyles(props.styles as Record<string, unknown>, bp, resolveValue);
});

const icon = computed(() => (resolveValue(props.data?.icon) as string) || 'ph-cube');
const size = computed(() => (resolveValue(props.data?.size) as number) || 24);
const color = computed(() => (resolveValue(props.data?.color) as string) || 'currentColor');
</script>

<template>
  <div 
    class="flex items-center justify-center transition-all"
    :class="computedClasses"
    :style="computedInlineStyles"
  >
     <i 
      :class="icon" 
      :style="{ 
        fontSize: size + 'px',
        color: color
      }"
    />
  </div>
</template>
