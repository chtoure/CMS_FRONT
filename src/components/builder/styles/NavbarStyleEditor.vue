<script lang="ts" setup>
import { computed, inject } from 'vue';
import type { AnyComponentInstance } from '../../../type/component';
import type { AnySectionInstance } from '../../../type/section';
import BaseStyleEditor from './BaseStyleEditor.vue';
import LayoutStyleEditor from './LayoutStyleEditor.vue';
import { Switch } from '../../ui/switch';
import { Label } from '../../ui/label';

const props = defineProps<{
  element: AnyComponentInstance;
}>();

const builderState = inject<{
  pageTree: { value: (AnyComponentInstance | AnySectionInstance)[] };
  libraryTree: { value: AnyComponentInstance[] };
  builderMode: { value: 'page' | 'library' };
}>('builderState');

const data = computed(() => props.element.data || {});

const updateData = (key: string, value: unknown) => {
  if (!builderState) return;
  const newData = { ...props.element.data, [key]: value };
  
  const updateTree = (items: (AnyComponentInstance | AnySectionInstance)[]): (AnyComponentInstance | AnySectionInstance)[] => {
    return items.map((item) => {
      // Pour forcer le typage sur item
      const currentItem = item as AnyComponentInstance;
      if (currentItem.id === props.element.id) {
        return { ...currentItem, data: newData };
      }
      if (currentItem.children) {
        return { ...currentItem, children: updateTree(currentItem.children) as AnyComponentInstance[] };
      }
      return item;
    });
  };
  
  if (builderState.builderMode.value === 'page') {
    builderState.pageTree.value = updateTree(builderState.pageTree.value);
  } else {
    builderState.libraryTree.value = updateTree(builderState.libraryTree.value) as AnyComponentInstance[];
  }
};
</script>

<template>
  <div class="space-y-4">
    <BaseStyleEditor :element="element" />
    <LayoutStyleEditor :element="(element as any)" />

    <div class="space-y-4 pt-4 border-t border-builder-bar-border">
      <h3 class="text-[10px] uppercase font-bold text-builder-bar-text mb-2">Comportement Navbar</h3>
      
      <div class="flex items-center justify-between">
        <Label class="text-xs text-builder-bar-text">Navbar Fixe (Sticky)</Label>
        <Switch 
          :checked="!!data.isSticky"
          @update:checked="(val: boolean) => updateData('isSticky', val)" 
        />
      </div>
    </div>
  </div>
</template>
