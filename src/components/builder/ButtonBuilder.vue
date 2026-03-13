<script setup lang="ts">
import { computed } from 'vue';
import type { InteractiveStyles, CliquableAction, AnyComponentInstance } from '../../type/component';
import { executeAction } from '../../registry/cliquable';
import { buildButtonStyles, buildButtonInlineStyles } from '../../lib/style/buttonProcessor';
import { useVariableResolver } from '../../hook/variable';
import { inject } from 'vue';

interface Props {
  styles?: InteractiveStyles;
  data?: {
    content?: string | Record<string, unknown>;
    cliquable?: CliquableAction;
  };
  element?: AnyComponentInstance;
  children?: AnyComponentInstance[];
}

const props = defineProps<Props>();

const builderState = inject<{
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' }
  toggleVisibility?: (id: string) => void
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}>('builderState', { currentBreakpoint: { value: 'default' } } as any);

// Détecte si on est dans le contexte du builder (pour bloquer la navigation réelle)
const isBuilder = inject<boolean>('isBuilder', false);

const { resolveValue } = useVariableResolver();

const computedClasses = computed(() => {
  const classes = [buildButtonStyles(props.styles as Record<string, unknown>, resolveValue)];

  // Alignement Flex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const align = resolveValue((props.styles as Record<string, any>)?.textAlign) || 'center';
  const flexAlignMap: Record<string, string> = {
    'left': 'justify-start text-left',
    'center': 'justify-center text-center',
    'right': 'justify-end text-right',
    'justify': 'justify-between text-justify'
  };
  classes.push(flexAlignMap[align as string] || 'justify-center text-center');

  return classes.filter(Boolean).join(' ');
});

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  return buildButtonInlineStyles(props.styles as Record<string, unknown>, bp, resolveValue);
});

const content = computed(() => (resolveValue(props.data?.content) as string) || 'Nouveau Bouton');

const handleClick = () => {
  const cliquable = resolveValue(props.data?.cliquable) as CliquableAction;
  if (!cliquable || !cliquable.action) return;

  if (cliquable.action === 'TOGGLE_VISIBILITY') {
    const targetId = cliquable.action_params?.targetId;
    if (targetId && builderState.toggleVisibility) {
      builderState.toggleVisibility(targetId);
    }
  } else {
    // Dans le builder, on bloque NAVIGATE_TO pour ne pas quitter l'éditeur
    if (isBuilder && cliquable.action === 'NAVIGATE_TO') {
      console.log("[BUILDER] Navigation bloquée pour :", cliquable.action_params?.url);
      return;
    }
    executeAction(cliquable);
  }
};
</script>

<template>
  <button
    :class="[
      'inline-flex items-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 w-full',
      computedClasses
    ]"
    :style="computedInlineStyles"
    @click="handleClick"
  >
    {{ content }}
  </button>
</template>
