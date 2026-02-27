<script setup lang="ts">
import { computed, inject } from 'vue';
import type { LinkStyles } from '../../type/style';
import { buildStyles, buildInlineStyles } from '../../lib/styleProcessor';

interface Props {
  styles?: LinkStyles;
  data?: {
    text?: string;
    url?: string;
    target?: '_blank' | '_self';
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
</script>

<template>
  <a
    :href="props.data?.url || '#'"
    :target="props.data?.target || '_self'"
    :class="computedClasses"
    :style="computedInlineStyles"
    class="hover:underline transition-all"
    @click.prevent="!props.data?.url && null"
  >
    {{ props.data?.text || 'Lien' }}
  </a>
</template>
