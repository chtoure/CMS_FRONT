<script setup lang="ts">
import { computed, inject } from 'vue';
import type { StaticStyles, AnyComponentInstance } from '../../type/component';
import { buildIconStyles, buildIconInlineStyles } from '../../lib/style/iconProcessor';
import { useVariableResolver } from '../../hook/variable';
import { resolveValueForBreakpoint } from '../../lib/style/core';
import * as LucideIcons from 'lucide-vue-next';

interface Props {
  styles?: StaticStyles;
  data?: {
    icon?: unknown;
    size?: unknown;
    color?: unknown;
  };
  element?: AnyComponentInstance;
  children?: AnyComponentInstance[];
}

const props = defineProps<Props>();

const builderState = inject<{
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' }
}>('builderState', { currentBreakpoint: { value: 'default' as const } } as { currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' } });

const { resolveValue } = useVariableResolver();

const computedClasses = computed(() => {
  return buildIconStyles(props.styles as Record<string, unknown>, resolveValue);
});

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  return buildIconInlineStyles(props.styles as Record<string, unknown>, bp, resolveValue);
});

const iconName = computed(() => {
  const name = resolveValue(props.data?.icon) as string;
  return name && name in LucideIcons ? name : 'Star';
});

const LucideIcon = computed(() => {
  return (LucideIcons as Record<string, unknown>)[iconName.value] || (LucideIcons as Record<string, unknown>)['Star'];
});

const size = computed(() => (resolveValue(props.data?.size) as number) || 24);

const color = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  // Utiliser resolveValueForBreakpoint (comme iconProcessor.ts) pour gérer les valeurs
  // responsives {default:'#xxx', sm:'#yyy'} ET les VariableProperty {type, value}.
  const rawColor = (props.styles as Record<string, unknown>)?.color;
  const styleColor = resolveValueForBreakpoint<string>(rawColor, bp, resolveValue);
  const dataColor = resolveValue(props.data?.color);

  if (typeof styleColor === 'string') {
    return (
      styleColor.startsWith('#') ||
      styleColor.startsWith('rgb') ||
      styleColor.startsWith('hsl') ||
      ['currentColor', 'transparent', 'inherit'].includes(styleColor)
    ) ? styleColor : `#${styleColor}`;
  }
  if (typeof dataColor === 'string') return dataColor;
  return 'currentColor';
});
</script>

<template>
  <div 
    class="flex items-center justify-center transition-all"
    :class="computedClasses"
    :style="computedInlineStyles"
  >
     <component 
      :is="LucideIcon" 
      :size="size"
      :color="color"
    />
  </div>
</template>
