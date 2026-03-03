<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { AnyComponentInstance } from '../../../type/component';
import { useStyleEditor } from '../../../hook/useStyleEditor';
import BaseStyleEditor from './BaseStyleEditor.vue';
import LayoutStyleEditor from './LayoutStyleEditor.vue';
import Label from '../../ui/label/Label.vue';
import Input from '../../ui/input/Input.vue';
import Select from '../../ui/select/Select.vue';
import SelectTrigger from '../../ui/select/SelectTrigger.vue';
import SelectValue from '../../ui/select/SelectValue.vue';
import SelectContent from '../../ui/select/SelectContent.vue';
import SelectItem from '../../ui/select/SelectItem.vue';
import CompositionColorPicker from '../../composition/CompositionColorPicker.vue';

const props = defineProps<{
  element: AnyComponentInstance;
}>();

const { getRawValue, getHexValue, updateStyle } = useStyleEditor(props.element);

const activePicker = ref<'arrowColor' | 'arrowBg' | 'pagColor' | 'pagActiveColor' | null>(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const styles = computed(() => props.element.styles as any);

const easeOptions = [
  { label: 'Ease In Out', value: 'ease-in-out' },
  { label: 'Linear', value: 'linear' },
  { label: 'Ease In', value: 'ease-in' },
  { label: 'Ease Out', value: 'ease-out' },
  { label: 'Step Start', value: 'step-start' },
];

const shapeOptions = [
  { label: 'Cercle', value: 'circle' },
  { label: 'Ligne', value: 'line' },
  { label: 'Carré', value: 'square' },
];
</script>

<template>
  <div class="space-y-6">
    <BaseStyleEditor :element="element" />
    <LayoutStyleEditor :element="element" />

    <!-- Slider Specific Layout -->
    <div class="space-y-3">
      <h4 class="text-[10px] tracking-wider text-primary font-black border-b border-white/10 pb-1 uppercase">Configuration Affichage</h4>
      <div class="space-y-1.5">
        <Label class="text-[11px] font-mono">Nombre d'éléments par vue</Label>
        <Input 
          type="number" 
          :model-value="getRawValue(styles.slidesPerView)" 
          @update:model-value="(val) => updateStyle('slidesPerView', parseInt(val.toString()) || 1)"
          class="h-8 !rounded bg-builder-input-bg border-builder-bar-border text-xs" 
          placeholder="1"
          min="1"
        />
      </div>
    </div>
    
    <!-- Animation Settings -->
    <div class="space-y-3">
      <h4 class="text-[10px] tracking-wider text-primary font-black border-b border-white/10 pb-1 uppercase">Animation</h4>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] font-mono">Durée (ms)</Label>
          <Input 
            type="number" 
            :model-value="getRawValue(styles.transitionDuration)" 
            @update:model-value="(val) => updateStyle('transitionDuration', parseInt(val.toString()))"
            class="h-8 !rounded bg-builder-input-bg border-builder-bar-border text-xs" 
            placeholder="500"
          />
        </div>
        <div class="space-y-1.5">
          <Label class="text-[11px] font-mono">Courbe</Label>
          <Select :model-value="getRawValue(styles.transitionEase)" @update:model-value="(val) => updateStyle('transitionEase', val)">
            <SelectTrigger class="h-8 !rounded bg-builder-input-bg border-builder-bar-border text-[10px]">
              <SelectValue placeholder="Ease" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in easeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <!-- Arrows Settings -->
    <div class="space-y-3">
      <h4 class="text-[10px] tracking-wider text-primary font-black border-b border-white/10 pb-1 uppercase">Navigation (Flèches)</h4>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-2">
          <Label class="text-[11px] font-mono">Couleur flèche</Label>
          <CompositionColorPicker 
            :is-open="activePicker === 'arrowColor'"
            :initial-color="'#' + getHexValue(styles.arrowColor)"
            @close="activePicker = null"
            @color-change="(hex) => updateStyle('arrowColor', hex)"
          >
            <template #trigger>
              <button @click="activePicker = 'arrowColor'" class="w-full h-8 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-xs">
                <div class="w-3 h-3 rounded-sm border border-builder-bar-border" :style="{ backgroundColor: '#' + getHexValue(styles.arrowColor) }"></div>
                <span class="truncate font-mono text-[10px]">{{ getRawValue(styles.arrowColor) || '#FFF' }}</span>
              </button>
            </template>
          </CompositionColorPicker>
        </div>
        <div class="space-y-2">
          <Label class="text-[11px] font-mono">Fond flèche</Label>
          <CompositionColorPicker 
            :is-open="activePicker === 'arrowBg'"
            :initial-color="'#' + getHexValue(styles.arrowBg)"
            @close="activePicker = null"
            @color-change="(hex) => updateStyle('arrowBg', hex)"
          >
            <template #trigger>
              <button @click="activePicker = 'arrowBg'" class="w-full h-8 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-xs">
                <div class="w-3 h-3 rounded-sm border border-builder-bar-border" :style="{ backgroundColor: '#' + getHexValue(styles.arrowBg) }"></div>
                <span class="truncate font-mono text-[10px]">{{ getRawValue(styles.arrowBg) || 'rgba(...)' }}</span>
              </button>
            </template>
          </CompositionColorPicker>
        </div>
      </div>
      <div class="space-y-1.5">
        <Label class="text-[11px] font-mono">Taille flèche (px)</Label>
        <Input 
          type="number" 
          :model-value="getRawValue(styles.arrowSize)" 
          @update:model-value="(val) => updateStyle('arrowSize', parseInt(val.toString()))"
          class="h-8 !rounded bg-builder-input-bg border-builder-bar-border text-xs" 
          placeholder="24"
        />
      </div>
    </div>

    <!-- Pagination Settings -->
    <div class="space-y-3">
      <h4 class="text-[10px] tracking-wider text-primary font-black border-b border-white/10 pb-1 uppercase">Pagination (Points)</h4>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-2">
          <Label class="text-[11px] font-mono">Couleur point</Label>
          <CompositionColorPicker 
            :is-open="activePicker === 'pagColor'"
            :initial-color="'#' + getHexValue(styles.paginationColor)"
            @close="activePicker = null"
            @color-change="(hex) => updateStyle('paginationColor', hex)"
          >
            <template #trigger>
              <button @click="activePicker = 'pagColor'" class="w-full h-8 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-xs">
                <div class="w-3 h-3 rounded-sm border border-builder-bar-border" :style="{ backgroundColor: '#' + getHexValue(styles.paginationColor) }"></div>
                <span class="truncate font-mono text-[10px]">{{ getRawValue(styles.paginationColor) || '#FFF' }}</span>
              </button>
            </template>
          </CompositionColorPicker>
        </div>
        <div class="space-y-2">
          <Label class="text-[11px] font-mono">Couleur active</Label>
          <CompositionColorPicker 
            :is-open="activePicker === 'pagActiveColor'"
            :initial-color="'#' + getHexValue(styles.paginationActiveColor)"
            @close="activePicker = null"
            @color-change="(hex) => updateStyle('paginationActiveColor', hex)"
          >
            <template #trigger>
              <button @click="activePicker = 'pagActiveColor'" class="w-full h-8 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-xs">
                <div class="w-3 h-3 rounded-sm border border-builder-bar-border" :style="{ backgroundColor: '#' + getHexValue(styles.paginationActiveColor) }"></div>
                <span class="truncate font-mono text-[10px]">{{ getRawValue(styles.paginationActiveColor) || 'Primary' }}</span>
              </button>
            </template>
          </CompositionColorPicker>
        </div>
      </div>
      <div class="space-y-1.5">
        <Label class="text-[11px] font-mono">Forme</Label>
        <Select :model-value="getRawValue(styles.paginationShape)" @update:model-value="(val) => updateStyle('paginationShape', val)">
          <SelectTrigger class="h-8 !rounded bg-builder-input-bg border-builder-bar-border text-[10px]">
            <SelectValue placeholder="Forme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="opt in shapeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  </div>
</template>
