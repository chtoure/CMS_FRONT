<script lang="ts" setup>
import type { AnyComponentInstance } from '../../../type/component';
import BaseStyleEditor from './BaseStyleEditor.vue';
import TextStyleEditor from './TextStyleEditor.vue';
import Label from '../../ui/label/Label.vue';
import Input from '../../ui/input/Input.vue';
import { useStyleEditor } from '../../../hook/useStyleEditor';

const props = defineProps<{
  element: AnyComponentInstance;
}>();

const { getRawValue, updateStyle } = useStyleEditor(props.element);
</script>

<template>
  <div class="space-y-6">
    <BaseStyleEditor :element="element" />
    <TextStyleEditor :element="element" />
    
    <div class="space-y-3">
      <h4 class="text-[10px] tracking-wider text-primary font-black border-b border-white/10 pb-1">Bouton Spécifique</h4>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Variante</Label>
          <Input :model-value="getRawValue(element.styles.variant)" @update:model-value="(val) => updateStyle('variant', val)" class="h-8 input-custom" placeholder="ex: default, outline" />
        </div>
        <div class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Taille</Label>
          <Input :model-value="getRawValue(element.styles.size)" @update:model-value="(val) => updateStyle('size', val)" class="h-8 input-custom" placeholder="ex: sm, md, lg" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-custom {
  @apply h-8 w-full !rounded px-3 py-1 text-[11px] shadow-sm transition-all outline-none !font-mono;
  background-color: var(--builder-input-bg);
  border: 1px solid var(--builder-input-border);
  color: var(--builder-input-text);
}
</style>
