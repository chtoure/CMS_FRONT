<script setup lang="ts">
import { computed } from 'vue';
import type { ContainerStyles } from '../../type/component';
import { buildStyles } from '../../lib/styleProcessor';

interface Props {
  styles?: ContainerStyles;
  data?: Record<string, unknown>;
}

const props = defineProps<Props>();

const gridClasses = computed(() => {
  return buildStyles('container', props.styles as Record<string, unknown>);
});
</script>

<template>
  <div :class="['grid w-full', gridClasses]">
    <slot />
    
    <div v-if="!$slots.default" class="col-span-full p-10 border-2 border-dashed border-slate-200 text-center text-slate-400 rounded-lg">
      Grille vide (Glissez des éléments ici)
    </div>
  </div>
</template>