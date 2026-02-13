<script setup lang="ts">
import { computed } from 'vue';
import type { InteractiveStyles, CliquableAction } from '../../type/component';
import { executeAction } from '../../registry/cliquable';
import { buildStyles, buildInlineStyles } from '../../lib/styleProcessor';

interface Props {
  // Respect de la structure séparée
  styles?: InteractiveStyles;
  data?: {
    content?: string;
    cliquable?: CliquableAction;
  };
}

const props = defineProps<Props>();

// On utilise le buildStyles pour transformer l'objet styles en classes
const computedClasses = computed(() => {
  return buildStyles('interactive', props.styles as Record<string, unknown>);
});

const computedInlineStyles = computed(() => {
  return buildInlineStyles('interactive', props.styles as Record<string, unknown>);
});

const handleClick = () => {
  if (props.data?.cliquable) {
    executeAction(props.data.cliquable);
  }
};
</script>

<template>
  <button
    :class="[
      'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
      computedClasses
    ]"
    :style="computedInlineStyles"
    @click="handleClick"
  >
    {{ props.data?.content || 'Nouveau Bouton' }}
  </button>
</template>