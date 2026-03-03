<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { AnyComponentInstance } from '../../../type/component';
import { useStyleEditor } from '../../../hook/useStyleEditor';
import Label from '../../ui/label/Label.vue';
import Input from '../../ui/input/Input.vue';
import Select from '../../ui/select/Select.vue';
import SelectTrigger from '../../ui/select/SelectTrigger.vue';
import SelectValue from '../../ui/select/SelectValue.vue';
import SelectContent from '../../ui/select/SelectContent.vue';
import SelectItem from '../../ui/select/SelectItem.vue';
import CompositionColorPicker from '../../composition/CompositionColorPicker.vue';
import VariableInputControl from '../../../hook/VariableInputControl.vue';

const props = defineProps<{
  element: AnyComponentInstance;
}>();

const { getRawValue, getHexValue, updateStyle } = useStyleEditor(props.element);

const activePicker = ref<'text' | null>(null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const styles = computed(() => props.element.styles as any);

const fontWeightOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Normal', value: 'normal' },
  { label: 'Medium', value: 'medium' },
  { label: 'Semibold', value: 'semibold' },
  { label: 'Bold', value: 'bold' },
];

const fontFamilyOptions = [
  { label: 'Sans (default)', value: 'sans' },
  { label: 'Heading', value: 'heading' },
  { label: 'Mono', value: 'mono' },
  { label: 'Serif', value: 'serif' },
];

const fontStyleOptions = [
  { label: 'Normal', value: 'normal' },
  { label: 'Italic', value: 'italic' },
];
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-3">
      <h4 class="text-[10px] tracking-wider text-primary font-black border-b border-white/10 pb-1">Typographie</h4>
      
      <div class="space-y-2">
        <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Couleur du texte</Label>
        <VariableInputControl
          :model-value="styles.textColor"
          @update:model-value="(val) => updateStyle('textColor', val)"
          variable-type="COLOR"
        >
          <CompositionColorPicker 
            :is-open="activePicker === 'text'"
            :initial-color="'#' + getHexValue(styles.textColor)"
            @close="activePicker = null"
            @color-change="(hex) => updateStyle('textColor', { type: 'static', value: hex })"
          >
            <template #trigger>
              <button @click="activePicker = 'text'" class="w-full h-8 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-xs hover:bg-white/5 transition-colors">
                <div class="w-4 h-4 rounded-sm border border-builder-bar-border" :style="{ backgroundColor: '#' + getHexValue(styles.textColor) }"></div>
                <span class="text-gray-300 font-mono truncate">{{ getRawValue(styles.textColor) || 'Inherit' }}</span>
              </button>
            </template>
          </CompositionColorPicker>
        </VariableInputControl>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Taille (px)</Label>
          <VariableInputControl
            :model-value="styles.fontSize"
            @update:model-value="(val) => updateStyle('fontSize', val)"
            variable-type="NUMBER"
          >
            <Input 
              type="number" 
              :model-value="getRawValue(styles.fontSize)" 
              @update:model-value="(val) => updateStyle('fontSize', Number(val))" 
              class="h-8 input-custom" />
          </VariableInputControl>
        </div>
        <div class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Poids</Label>
          <VariableInputControl :model-value="styles.fontWeight" @update:model-value="(val) => updateStyle('fontWeight', val)" variable-type="STRING">
            <Select :model-value="(getRawValue(styles.fontWeight) as string)" @update:model-value="(val) => updateStyle('fontWeight', { type: 'static', value: val })">
              <SelectTrigger class="h-8 input-custom">
                <SelectValue placeholder="Poids" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="opt in fontWeightOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
              </SelectContent>
            </Select>
          </VariableInputControl>
        </div>
      </div>

      <div class="space-y-1.5">
        <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Police</Label>
        <Select :model-value="(getRawValue(styles.fontFamily) as string)" @update:model-value="(val) => updateStyle('fontFamily', val)">
          <SelectTrigger class="h-8 input-custom">
            <SelectValue placeholder="Police" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="opt in fontFamilyOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-1.5">
        <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Style</Label>
        <Select :model-value="(getRawValue(styles.fontStyle) as string)" @update:model-value="(val) => updateStyle('fontStyle', val)">
          <SelectTrigger class="h-8 input-custom">
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="opt in fontStyleOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-1.5">
        <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Alignement</Label>
        <Select :model-value="(getRawValue(styles.textAlign) as string)" @update:model-value="(val) => updateStyle('textAlign', val)">
          <SelectTrigger class="h-8 input-custom">
            <SelectValue placeholder="Align" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Gauche</SelectItem>
            <SelectItem value="center">Centre</SelectItem>
            <SelectItem value="right">Droite</SelectItem>
            <SelectItem value="justify">Justifié</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-1.5">
        <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Décoration</Label>
        <div class="flex gap-2">
          <button 
            @click="updateStyle('textDecoration', getRawValue(styles.textDecoration) === 'underline' ? 'none' : 'underline')"
            class="flex-1 h-8 flex items-center justify-center rounded border transition-all"
            :class="getRawValue(styles.textDecoration) === 'underline' 
               ? 'bg-primary text-white border-primary shadow-sm' 
               : 'bg-builder-input-bg border-builder-bar-border text-gray-400 hover:text-gray-300 hover:bg-white/5'"
          >
            <span class="text-xs font-bold underline">U</span>
            <span class="ml-2 text-[10px] uppercase tracking-tighter">Souligner</span>
          </button>
          <!-- <div>
            <p>test</p>
            <BaseInputVariable />
          </div> -->
          
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
