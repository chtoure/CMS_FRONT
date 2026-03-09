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
    <!-- Base Appearance -->
    <BaseStyleEditor :element="element" />
    
    <!-- Layout Logic (Grid/Flex) -->
    <LayoutStyleEditor :element="element" />
  </div>
</template>
