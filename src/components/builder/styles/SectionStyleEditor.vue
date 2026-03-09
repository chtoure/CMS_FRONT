<script lang="ts" setup>
import type { AnySectionInstance } from '../../../type/section';
import BaseStyleEditor from './BaseStyleEditor.vue';
import LayoutStyleEditor from './LayoutStyleEditor.vue';

defineProps<{
  element: AnySectionInstance;
}>();
</script>

<template>
  <div class="space-y-6">
    <!-- Base Appearance for Sections -->
    <BaseStyleEditor 
      :element="element" 
      :whitelist="['padding', 'bg', 'opacity', 'borderWidth', 'borderColor', 'borderStyle']" 
    />
    
    <!-- Layout Logic for Sections -->
    <LayoutStyleEditor :element="element" />
  </div>
</template>
