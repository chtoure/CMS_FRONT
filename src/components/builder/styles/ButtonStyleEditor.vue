<script lang="ts" setup>
/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed } from 'vue';
import type { AnyComponentInstance } from '../../../type/component';
import BaseStyleEditor from './BaseStyleEditor.vue';
import TextStyleEditor from './TextStyleEditor.vue';
import PropertyGroup from '../ui/PropertyGroup.vue';
import ButtonGroup from '../ui/ButtonGroup.vue';
import { useStyleEditor } from '../../../hook/useStyleEditor';
import { MousePointer2 } from 'lucide-vue-next';

const props = defineProps<{
  element: AnyComponentInstance;
}>();

const { getRawValue, updateStyle } = useStyleEditor(props.element);

const variantOptions = [
  { label: 'Def', value: 'default', tooltip: 'Default' },
  { label: 'Out', value: 'outline', tooltip: 'Outline' },
  { label: 'Ghost', value: 'ghost', tooltip: 'Ghost' },
  { label: 'Link', value: 'link', tooltip: 'Link' },
];

const sizeOptions = [
  { label: 'XS', value: 'xs' },
  { label: 'SM', value: 'sm' },
  { label: 'MD', value: 'default' },
  { label: 'LG', value: 'lg' },
];

const appearanceWhitelist = [
  'rounded', 
  'shadow', 
  'opacity', 
  'bg', 
  'borderWidth', 
  'borderColor', 
  'borderStyle'
];

const styles = computed(() => props.element.styles as any);
</script>

<template>
  <div class="space-y-4">
    <TextStyleEditor :element="element" />
    
    <BaseStyleEditor 
      :element="element" 
      :whitelist="appearanceWhitelist" 
    />
    
    <PropertyGroup title="Button Settings" :open="true" :icon="MousePointer2">
      <div class="space-y-4">
        <div class="space-y-1.5">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter">Variant</label>
          <ButtonGroup 
            :model-value="(getRawValue(styles.variant) as string)" 
            @update:model-value="(val) => updateStyle('variant', val)"
            :options="variantOptions"
            size="sm"
          />
        </div>

        <div class="space-y-1.5">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter">Size</label>
          <ButtonGroup 
            :model-value="(getRawValue(styles.size) as string)" 
            @update:model-value="(val) => updateStyle('size', val)"
            :options="sizeOptions"
            size="sm"
          />
        </div>
      </div>
    </PropertyGroup>
  </div>
</template>
