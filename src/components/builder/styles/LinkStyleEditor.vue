<script lang="ts" setup>
import type { AnyComponentInstance } from '../../../type/component';
import BaseStyleEditor from './BaseStyleEditor.vue';
import TextStyleEditor from './TextStyleEditor.vue';

defineProps<{
  element: AnyComponentInstance;
}>();
</script>

<template>
  <div class="space-y-6">
    <BaseStyleEditor :element="element" />
    <TextStyleEditor :element="element" />
    
    <div class="p-3 bg-primary/5 rounded border border-primary/10">
      <p class="text-[10px] text-primary/60 italic text-center">
        Note : l'URL et le texte se configurent dans l'onglet Données.
      </p>
    </div>
  </div>
</template>
