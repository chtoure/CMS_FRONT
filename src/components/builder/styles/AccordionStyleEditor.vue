<script lang="ts" setup>
/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, ref } from 'vue';
import type { AnyComponentInstance } from '../../../type/component';
import { useStyleEditor } from '../../../hook/useStyleEditor';
import BaseStyleEditor from './BaseStyleEditor.vue';
import PropertyGroup from '../ui/PropertyGroup.vue';
import PropertyInput from '../ui/PropertyInput.vue';
import ButtonGroup from '../ui/ButtonGroup.vue';
import IconButtonGroup from '../ui/IconButtonGroup.vue';
import CompositionColorPicker from '../../composition/CompositionColorPicker.vue';
import VariableInputControl from '../../../type/VariableInputControl.vue';
import { MessageSquare, AlignCenter, AlignLeft, AlignRight, AlignJustify } from 'lucide-vue-next';

const props = defineProps<{
  element: AnyComponentInstance;
}>();

const { getRawValue, getHexValue, updateStyle } = useStyleEditor(props.element);

const styles = computed(() => props.element.styles as any);

// Pickers ouverts
const activePicker = ref<
  'questionColor' | 'questionBg' | null
>(null);

const fontWeightOptions = [
  { label: 'L',  value: 'light',    tooltip: 'Light' },
  { label: 'R',  value: 'normal',   tooltip: 'Regular' },
  { label: 'M',  value: 'medium',   tooltip: 'Medium' },
  { label: 'SB', value: 'semibold', tooltip: 'Semi-bold' },
  { label: 'B',  value: 'bold',     tooltip: 'Bold' },
];

const textAlignOptions = [
  { value: 'left', icon: AlignLeft, tooltip: 'À Gauche' },
  { value: 'center', icon: AlignCenter, tooltip: 'Centré' },
  { value: 'right', icon: AlignRight, tooltip: 'À Droite' },
  { value: 'justify', icon: AlignJustify, tooltip: 'Justifié' },
];

// Whitelist pour BaseStyleEditor (container uniquement)
const containerWhitelist = [
  'width', 'padding', 'marginTop', 'marginBottom',
  'bg', 'rounded', 'shadow', 'opacity',
  'borderWidth', 'borderColor',
];
</script>

<template>
  <div class="space-y-4">

    <!-- ── Container (via BaseStyleEditor) ─────────────────────────────── -->
    <BaseStyleEditor :element="element" :whitelist="containerWhitelist" />

    <!-- ── Typographie (Question & Réponse) ────────────────────────────────────────────── -->
    <PropertyGroup title="Typographie" :open="true" :icon="MessageSquare">
      <div class="space-y-3">

        <!-- Taille, Poids & Alignement -->
        <div class="space-y-2">
          <div class="grid grid-cols-2 gap-2">
            <PropertyInput
              label="Taille"
              type="number"
              :model-value="getRawValue(styles.questionFontSize)"
              @update:model-value="(val) => updateStyle('questionFontSize', parseInt(val.toString()) || undefined)"
              :icon="AlignCenter"
            />
            <div class="flex items-end">
              <ButtonGroup
                :model-value="(getRawValue(styles.questionFontWeight) as string)"
                @update:model-value="(val) => updateStyle('questionFontWeight', val)"
                :options="fontWeightOptions"
                size="sm"
                class="w-full"
              />
            </div>
          </div>
          <div class="flex justify-end">
             <IconButtonGroup 
                :model-value="(getRawValue(styles.questionTextAlign) as string | number)" 
                @update:model-value="(val) => updateStyle('questionTextAlign', val as string)"
                :options="textAlignOptions"
              />
          </div>
        </div>

        <!-- Couleur texte -->
        <div class="space-y-1">
          <span class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter">Couleur texte</span>
          <VariableInputControl
            :model-value="styles.questionColor"
            @update:model-value="(val) => updateStyle('questionColor', val)"
            variable-type="COLOR"
          >
            <CompositionColorPicker
              :is-open="activePicker === 'questionColor'"
              :initial-color="'#' + getHexValue(styles.questionColor)"
              @close="activePicker = null"
              @color-change="(hex) => updateStyle('questionColor', { type: 'static', value: hex })"
            >
              <template #trigger>
                <button
                  @click="activePicker = 'questionColor'"
                  class="w-full h-8 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-xs hover:border-builder-bar-border/80 transition-colors"
                >
                  <div
                    class="w-4 h-4 rounded-sm border border-builder-bar-border shrink-0"
                    :style="{ backgroundColor: '#' + getHexValue(styles.questionColor) }"
                  />
                  <span class="text-builder-bar-text/60 font-mono text-[10px] truncate">
                    {{ getRawValue(styles.questionColor) || 'Hérité' }}
                  </span>
                </button>
              </template>
            </CompositionColorPicker>
          </VariableInputControl>
        </div>


      </div>
    </PropertyGroup>



  </div>
</template>
