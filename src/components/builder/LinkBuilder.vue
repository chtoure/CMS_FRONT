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
  const allStyles = buildInlineStyles('static', props.styles as Record<string, unknown>, bp);
  
  // Retirer textAlign du lien car il va être appliqué au wrapper parent
  const { textAlign: _, ...linkStyles } = allStyles;
  
  return linkStyles;
});

// Wrapper styles appliquent textAlign au conteneur
const wrapperInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  const inlineStyles: Record<string, string> = {};
  
  if (props.styles?.textAlign) {
    let textAlignValue = props.styles.textAlign;
    
    // Gérer les responsive props
    if (typeof textAlignValue === 'object' && textAlignValue !== null && 'default' in textAlignValue) {
      const responsive = textAlignValue as any;
      textAlignValue = responsive[bp] || responsive.default;
    }
    
    if (typeof textAlignValue === 'string' && ['left', 'center', 'right', 'justify'].includes(textAlignValue)) {
      inlineStyles.textAlign = textAlignValue;
    }
  }
  
  return inlineStyles;
});
</script>

<template>
  <div :style="wrapperInlineStyles">
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
  </div>
</template>
