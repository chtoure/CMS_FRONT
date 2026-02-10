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

const computedClasses = computed(() => {
  return buildStyles('static', props.styles as Record<string, unknown>);
});

const computedInlineStyles = computed(() => {
  return buildInlineStyles('static', props.styles as Record<string, unknown>);
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
