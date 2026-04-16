<script lang="ts" setup>
import type { AnyComponentInstance } from '../../../type/component';
import BaseStyleEditor from './BaseStyleEditor.vue';

defineProps<{
  element: AnyComponentInstance;
}>();
</script>

<template>
  <div class="space-y-6">
    <!-- Base Appearance for Icons -->
    <BaseStyleEditor 
      :element="element" 
      :whitelist="['bg', 'opacity', 'marginTop', 'marginBottom', 'padding', 'rounded', 'color']" 
    />
  </div>
</template>
