<script lang="ts" setup>
import type { AnyComponentInstance } from '../../../type/component';
import BaseStyleEditor from './BaseStyleEditor.vue';
import TextStyleEditor from './TextStyleEditor.vue';

defineProps<{
  element: AnyComponentInstance;
}>();

const appearanceWhitelist = [
  'rounded', 
  'shadow', 
  'opacity', 
  'bg', 
  'borderWidth', 
  'borderColor', 
  'borderStyle'
];
</script>

<template>
  <div class="space-y-6">
    <!-- Typography & Layout -->
    <TextStyleEditor :element="element" />

    <!-- Style & Appearance -->
    <BaseStyleEditor 
      :element="element" 
      :whitelist="appearanceWhitelist" 
    />
  </div>
</template>
