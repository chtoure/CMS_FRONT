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
    <!-- Cards use full Base editor -->
    <BaseStyleEditor :element="element" />
    
    <!-- Cards also have Layout (they are containers) -->
    <LayoutStyleEditor :element="element" />
  </div>
</template>
