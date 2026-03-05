<script lang="ts" setup>
/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, inject } from 'vue';
import type { AnyComponentInstance } from '../../../type/component';
import type { AnySectionInstance } from '../../../type/section';
import BaseStyleEditor from './BaseStyleEditor.vue';
import LayoutStyleEditor from './LayoutStyleEditor.vue';
import PropertyGroup from '../ui/PropertyGroup.vue';
import ButtonGroup from '../ui/ButtonGroup.vue';
import { Switch } from '../../ui/switch';
import { Label } from '../../ui/label';
import { Smartphone, Zap, Monitor } from 'lucide-vue-next';

const props = defineProps<{
  element: AnyComponentInstance;
}>();

const builderState = inject<{
  pageTree: { value: (AnyComponentInstance | AnySectionInstance)[] };
  libraryTree: { value: AnyComponentInstance[] };
  builderMode: { value: 'page' | 'library' };
}>('builderState');

const data = computed(() => props.element.data || {});

const toggleOptions = [
  { label: 'Auto (Mobile)', value: true, icon: Smartphone, tooltip: 'Responsive Toggle' },
  { label: 'Always Open', value: false, icon: Monitor, tooltip: 'Always Visible' },
];

const updateData = (key: string, value: unknown) => {
  if (!builderState) return;
  const newData = { ...props.element.data, [key]: value };
  
  const updateTree = (items: (AnyComponentInstance | AnySectionInstance)[]): (AnyComponentInstance | AnySectionInstance)[] => {
    return items.map((item) => {
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

    <PropertyGroup title="Navbar Behavior" :open="true" :icon="Zap">
      <div class="space-y-4 pt-1">
        <div class="flex items-center justify-between gap-4">
          <Label class="text-[11px] text-builder-bar-text/60">Sticky Position</Label>
          <Switch 
            :checked="!!data.isSticky"
            @update:checked="(val: boolean) => updateData('isSticky', val)" 
          />
        </div>

        <div class="space-y-2">
          <Label class="text-[11px] text-builder-bar-text/60">Responsive Menu</Label>
          <ButtonGroup 
              :model-value="data.responsiveToggle !== false"
              @update:model-value="(val) => updateData('responsiveToggle', val)"
              :options="toggleOptions"
              size="sm"
          />
        </div>
      </div>
    </PropertyGroup>
  </div>
</template>
