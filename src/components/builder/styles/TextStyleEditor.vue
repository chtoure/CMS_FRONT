<script lang="ts" setup>
/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, ref } from 'vue';
import type { AnyComponentInstance } from '../../../type/component';
import { useStyleEditor } from '../../../hook/useStyleEditor';
import PropertyGroup from '../ui/PropertyGroup.vue';
import PropertyInput from '../ui/PropertyInput.vue';
import ButtonGroup from '../ui/ButtonGroup.vue';
import IconButtonGroup from '../ui/IconButtonGroup.vue';
import CompositionColorPicker from '../../composition/CompositionColorPicker.vue';
import VariableInputControl from '../../../type/VariableInputControl.vue';
import BaseStyleEditor from './BaseStyleEditor.vue';
import {
  Type,
  Type as FontIcon,
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignJustify,
  Underline,
  Italic
} from 'lucide-vue-next';

const props = defineProps<{
  element: AnyComponentInstance;
}>();

const { getRawValue, getHexValue, updateStyle, updateStyles } = useStyleEditor(props.element);

const activePicker = ref<'text' | 'bg' | null>(null);
const styles = computed(() => props.element.styles as any);

console.log("stylessssssssssssssssssssssss",styles.value);


const fontWeightOptions = [
  { label: 'L', value: 'light', tooltip: 'Light' },
  { label: 'R', value: 'normal', tooltip: 'Regular' },
  { label: 'M', value: 'medium', tooltip: 'Medium' },
  { label: 'SB', value: 'semibold', tooltip: 'Semibold' },
  { label: 'B', value: 'bold', tooltip: 'Bold' },
];

const textAlignOptions = [
  { value: 'left', icon: AlignLeft, tooltip: 'Left' },
  { value: 'center', icon: AlignCenter, tooltip: 'Center' },
  { value: 'right', icon: AlignRight, tooltip: 'Right' },
  { value: 'justify', icon: AlignJustify, tooltip: 'Justify' },
];

const textDecorationOptions = [
  { value: 'underline', icon: Underline, tooltip: 'Underline' },
];

const fontStyleOptions = [
  { value: 'italic', icon: Italic, tooltip: 'Italic' },
];

const layoutWhitelist = [
  'width',
  'height',
  'padding',
  'marginTop',
  'marginBottom',
  'rounded',
  'shadow',
  'opacity',
  'bg',
  'borderWidth',
  'borderColor'
];
</script>

<template>
  <div class="space-y-1.5">
    <PropertyGroup title="Type" :open="true" :icon="Type">
      <div class="space-y-4">
        <!-- Font Family & Weight -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter">Font</span>
          </div>
          <div class="space-y-2">
            <select
              :value="getRawValue(styles.fontFamily)"
              @input="(e: any) => updateStyle('fontFamily', e.target.value)"
              class="flex-1 h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[11px] px-2 outline-none focus:border-primary"
            >
              <option value="sans">Inter (Sans)</option>
              <option value="heading">Outfit (Heading)</option>
              <option value="mono">Roboto Mono</option>
            </select>
            <ButtonGroup
              :model-value="(getRawValue(styles.fontWeight) as string)"
              @update:model-value="(val) => updateStyle('fontWeight', val)"
              :options="fontWeightOptions"
              size="sm"
              class="w-auto"
            />
          </div>
        </div>

        <!-- Font Size & Line Height & Align -->
        <div class="grid grid-cols-2 gap-2">
          <PropertyInput 
            label="Size" 
            type="number" 
            :model-value="getRawValue(styles.fontSize)" 
            @update:model-value="(val) => updateStyle('fontSize', parseInt(val.toString()) || 0)"
            :icon="FontIcon"
          >
            <template #action>
              <VariableInputControl
                :model-value="styles.fontSize"
                @update:model-value="(val) => updateStyle('fontSize', val)"
                variable-type="NUMBER"
              />
            </template>
          </PropertyInput>
          
          <div class="flex-1 items-end justify-end">
            <IconButtonGroup 
              :model-value="(getRawValue(styles.textAlign) as string | number)" 
              @update:model-value="(val) => updateStyle('textAlign', val as string)"
              :options="textAlignOptions"
            />
          </div>
        </div>

        <!-- Color & Appearance -->
        <div class="space-y-2">
          <span class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter">Couleur & Style</span>
          <div class="flex gap-2">
            <div class="flex-1">
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
                    <button
                      @click="activePicker = 'text'"
                      class="w-full h-8 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-xs hover:border-builder-bar-border/80 transition-colors"
                    >
                      <div
                        class="w-4 h-4 rounded-sm border border-builder-bar-border shrink-0"
                        :style="{ backgroundColor: '#' + getHexValue(styles.textColor) }"
                      />
                      <span class="text-builder-bar-text/60 font-mono text-[10px] truncate">{{ getRawValue(styles.textColor) || 'Inherit' }}</span>
                    </button>
                  </template>
                </CompositionColorPicker>
              </VariableInputControl>
            </div>

            <IconButtonGroup
              :model-value="[(getRawValue(styles.textDecoration) as string | number), (getRawValue(styles.fontStyle) as string | number)].filter(Boolean)"
              @update:model-value="(val) => {
                 if (Array.isArray(val)) {
                   updateStyles({
                     textDecoration: val.includes('underline') ? 'underline' : 'none',
                     fontStyle: val.includes('italic') ? 'italic' : 'normal'
                   });
                 }
              }"
              :options="[...textDecorationOptions, ...fontStyleOptions]"
              multiple
            />
          </div>

        </div>
      </div>
    </PropertyGroup>

    <!-- Layout Section -->
    <BaseStyleEditor :element="element" :whitelist="layoutWhitelist" />
  </div>
</template>
