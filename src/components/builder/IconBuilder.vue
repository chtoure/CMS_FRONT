<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, inject } from 'vue';
import * as Icons from 'lucide-vue-next';
import type { StaticStyles } from '../../type/component';
import { buildStyles, buildInlineStyles } from '../../lib/styleProcessor';

interface Props {
  styles?: StaticStyles;
  data?: {
    icon?: keyof typeof Icons;
    size?: number;
    color?: string;
    strokeWidth?: number;
  };
}

const props = defineProps<Props>();

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

const IconComponent = computed(() => {
  const iconName = props.data?.icon;
  if (iconName && Icons[iconName]) {
    return Icons[iconName];
  }
  return Icons.HelpCircle; // Fallback icon
});

const iconProps = computed(() => ({
  size: Number(props.data?.size) || 24,
  color: props.data?.color || 'currentColor',
  'stroke-width': Number(props.data?.strokeWidth) || 2
}));
</script>

<template>
  <div :class="computedClasses" :style="computedInlineStyles">
    <component
      :is="IconComponent"
      v-bind="iconProps"
    />
  </div>
</template>
