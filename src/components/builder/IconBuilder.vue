<script setup lang="ts">
import { computed } from 'vue';
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

const computedClasses = computed(() => {
  return buildStyles('static', props.styles as Record<string, unknown>);
});

const computedInlineStyles = computed(() => {
  return buildInlineStyles('static', props.styles as Record<string, unknown>);
});

const IconComponent = computed(() => {
  const iconName = props.data?.icon;
  if (iconName && Icons[iconName]) {
    return Icons[iconName];
  }
  return Icons.HelpCircle; // Fallback icon
});
</script>

<template>
  <div :class="computedClasses" :style="computedInlineStyles">
    <component
      :is="IconComponent"
      :size="props.data?.size || 24"
      :color="props.data?.color || 'currentColor'"
      :stroke-width="props.data?.strokeWidth || 2"
    />
  </div>
</template>
