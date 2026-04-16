<script lang="ts" setup>
import type { AnyComponentInstance } from '../../../type/component';
import TextStyleEditor from './TextStyleEditor.vue';

const props = defineProps<{
  element: AnyComponentInstance;
}>();
</script>

<template>
  <div class="space-y-4">
    <TextStyleEditor :element="props.element" />

    <!-- On ne met pas BaseStyleEditor ici car TextStyleEditor l'inclut déjà avec les bons champs -->

    <!-- Button Settings removed as per user request -->
  </div>
</template>
