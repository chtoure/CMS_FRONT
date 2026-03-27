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
      :whitelist="['padding', 'bg', 'bgImage', 'bgVideo', 'bgSize', 'bgPosition', 'bgRepeat', 'opacity', 'borderWidth', 'borderColor', 'borderStyle', 'position', 'top', 'right', 'bottom', 'left', 'zIndex']" 
    />
    
    <!-- Layout Logic for Sections -->
    <LayoutStyleEditor :element="element" />
  </div>
</template>
