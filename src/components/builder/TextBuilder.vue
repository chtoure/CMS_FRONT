<script setup lang="ts">
import { computed } from 'vue';
import type { StaticStyles } from '../../type/component';
import { buildStyles, buildInlineStyles } from '../../lib/styleProcessor';

interface Props {
  styles?: StaticStyles;
  data?: {
    content?: string;
    tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
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

const tag = computed(() => props.data?.tag || 'p');
</script>

<template>
  <component
    :is="tag"
    :class="computedClasses"
    :style="computedInlineStyles"
  >
    {{ props.data?.content || 'Texte par défaut' }}
  </component>
</template>
