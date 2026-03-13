<script setup lang="ts">
import { computed, inject } from 'vue';
import { RouterLink } from 'vue-router';
import type { LinkStyles } from '../../type/style';
import type { AnyComponentInstance } from '../../type/component';
import { buildLinkStyles, buildLinkInlineStyles } from '../../lib/style/linkProcessor';
import { resolveValueForBreakpoint } from '../../lib/style/core';
import { useVariableResolver } from '../../hook/variable';

interface Props {
  styles?: LinkStyles;
  data?: {
    text?: string;
    url?: string;
    target?: string;
  };
  element?: AnyComponentInstance;
  children?: AnyComponentInstance[];
}

const props = defineProps<Props>();

const builderState = inject<{
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}>('builderState', { currentBreakpoint: { value: 'default' } } as any);

// Détecte si on est dans le contexte du builder (pour bloquer la navigation)
const isBuilder = inject<boolean>('isBuilder', false);

const { resolveValue } = useVariableResolver();

const computedClasses = computed(() => {
  return buildLinkStyles(props.styles as Record<string, unknown>, resolveValue);
});

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  const allStyles = buildLinkInlineStyles(props.styles as Record<string, unknown>, bp, resolveValue);

  // Retirer textAlign du lien car il va être appliqué au wrapper parent
  const { textAlign: _textAlign, ...linkStyles } = allStyles;
  void _textAlign;

  return linkStyles;
});

// Wrapper styles appliquent textAlign au conteneur
const wrapperInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  const inlineStyles: Record<string, string> = {};

  if (props.styles?.textAlign) {
    const textAlignValue = resolveValueForBreakpoint(props.styles.textAlign, bp, resolveValue);

    if (typeof textAlignValue === 'string' && ['left', 'center', 'right', 'justify'].includes(textAlignValue)) {
      inlineStyles.textAlign = textAlignValue;
    }
  }

  return inlineStyles;
});

const linkText = computed(() => (resolveValue(props.data?.text) as string) || 'Lien');
const linkUrl = computed(() => (resolveValue(props.data?.url) as string) || '#');
const linkTarget = computed(() => (resolveValue(props.data?.target) as string) || '_self');
</script>

<template>
  <div :style="wrapperInlineStyles">
    <!-- En mode builder : <a> classique avec navigation bloquée pour ne pas quitter l'éditeur -->
    <a
      v-if="isBuilder"
      :href="linkUrl"
      :target="linkTarget"
      :class="computedClasses"
      :style="computedInlineStyles"
      class="inline-block hover:underline transition-all"
      @click.prevent
    >
      {{ linkText }}
    </a>
    <!-- En mode rendu/preview : RouterLink fonctionnel -->
    <RouterLink
      v-else
      :to="linkUrl"
      :target="linkTarget"
      :class="computedClasses"
      :style="computedInlineStyles"
      class="inline-block hover:underline transition-all"
    >
      {{ linkText }}
    </RouterLink>
  </div>
</template>
