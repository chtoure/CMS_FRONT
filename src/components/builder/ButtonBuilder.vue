<script setup lang="ts">
import { computed } from 'vue';
import type { InteractiveStyles, CliquableAction } from '../../type/component';
import Button from '../ui/button/Button.vue';
import { executeAction } from '../../registry/cliquable';
import { buildStyles } from '../../lib/styleProcessor';

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

const handleClick = () => {
  if (props.data?.cliquable) {
    executeAction(props.data.cliquable);
  }
};
</script>

<template>
  <Button
    :variant="(props.styles?.variant as any) || 'default'"
    :size="(props.styles?.size as any) || 'default'"
    :class="computedClasses"
    @click="handleClick"
  >
    {{ props.data?.content || 'Nouveau Bouton' }}
  </Button>
</template>