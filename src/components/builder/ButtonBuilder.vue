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

const { resolveValue } = useVariableResolver();

const computedClasses = computed(() => {
  return buildButtonStyles(props.styles as Record<string, unknown>, resolveValue);
});

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  return buildButtonInlineStyles(props.styles as Record<string, unknown>, bp, resolveValue);
});

const content = computed(() => (resolveValue(props.data?.content) as string) || 'Nouveau Bouton');

const handleClick = () => {
  const cliquable = resolveValue(props.data?.cliquable) as CliquableAction;
  if (cliquable) {
    if (cliquable.action === 'TOGGLE_VISIBILITY') {
      const targetId = (cliquable.action_params as { targetId?: string }).targetId;
      if (targetId && builderState.toggleVisibility) {
        builderState.toggleVisibility(targetId);
      }
    } else {
      executeAction(cliquable);
    }
  }
};
</script>

<template>
  <button
    :class="[
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 w-full',
      computedClasses
    ]"
    :style="computedInlineStyles"
    @click="handleClick"
  >
    <slot />
    {{ content }}
  </button>
</template>
