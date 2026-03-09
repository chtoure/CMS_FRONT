<script lang="ts" setup>
import type { AnyComponentInstance } from '../../../type/component';
import BaseStyleEditor from './BaseStyleEditor.vue';
import LayoutStyleEditor from './LayoutStyleEditor.vue';

defineProps<{
  element: AnyComponentInstance;
}>();
</script>

<template>
  <div class="space-y-6">
    <BaseStyleEditor :element="element" />
    <LayoutStyleEditor :element="element" />
    
    <div class="p-3 bg-primary/5 rounded border border-primary/10">
      <p class="text-[10px] text-primary/60 italic text-center">
        Configuration de l'Accordéon (L'ouverture et la vitesse se règlent dans l'onglet Paramètres)
      </p>
    </div>
  </div>
</template>
