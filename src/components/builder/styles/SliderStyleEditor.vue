<script lang="ts" setup>
/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, ref } from 'vue';
import type { AnyComponentInstance } from '../../../type/component';
import { useStyleEditor } from '../../../hook/useStyleEditor';
import BaseStyleEditor from './BaseStyleEditor.vue';
import LayoutStyleEditor from './LayoutStyleEditor.vue';
import PropertyGroup from '../ui/PropertyGroup.vue';
import PropertyRow from '../ui/PropertyRow.vue';
import PropertyInput from '../ui/PropertyInput.vue';
import ButtonGroup from '../ui/ButtonGroup.vue';
import CompositionColorPicker from '../../composition/CompositionColorPicker.vue';
import VariableInputControl from '../../../type/VariableInputControl.vue';
import { 
  ChevronRight, 
  MoreHorizontal,
  Circle,
  Minus,
  Square
} from 'lucide-vue-next';

const props = defineProps<{
  element: AnyComponentInstance;
}>();

const { getRawValue, getHexValue, updateStyle } = useStyleEditor(props.element);

const activePicker = ref<'arrowColor' | 'arrowBg' | 'pagColor' | 'pagActiveColor' | null>(null);

const styles = computed(() => props.element.styles as any);

const shapeOptions = [
  { value: 'circle', icon: Circle, tooltip: 'Circle' },
  { value: 'line', icon: Minus, tooltip: 'Line' },
  { value: 'square', icon: Square, tooltip: 'Square' },
];
</script>

<template>
  <div class="space-y-4">
    <BaseStyleEditor :element="element" />

    <!-- Paramètres de Layout Spécifiques -->
    <PropertyGroup title="Layout" :open="true" :icon="ChevronRight">
      <div class="space-y-3">
        <PropertyInput 
          label="Nombre par page" 
          type="number" 
          :model-value="getRawValue(styles.slidesPerView)" 
          @update:model-value="(val) => updateStyle('slidesPerView', parseInt(val.toString()) || 1)"
          placeholder="1"
        />
      </div>
    </PropertyGroup>

    <LayoutStyleEditor :element="element" />

    <!-- Configuration Section moved to DataEditor -->

    <!-- Navigation Arrows -->
    <PropertyGroup title="Arrows" :open="false" :icon="ChevronRight">
      <div class="space-y-4">
        <PropertyRow>
          <div class="space-y-1.5">
            <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter">Color</label>
            <VariableInputControl :model-value="styles.arrowColor" @update:model-value="(val) => updateStyle('arrowColor', val)" variable-type="COLOR">
              <CompositionColorPicker 
                :is-open="activePicker === 'arrowColor'"
                :initial-color="'#' + getHexValue(styles.arrowColor)"
                @close="activePicker = null"
                @color-change="(hex) => updateStyle('arrowColor', { type: 'static', value: hex })"
              >
                <template #trigger>
                  <button @click="activePicker = 'arrowColor'" class="w-full h-7 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-[10px]">
                    <div class="w-2.5 h-2.5 rounded-sm border border-builder-bar-border" :style="{ backgroundColor: '#' + getHexValue(styles.arrowColor) }"></div>
                    <span class="truncate">{{ getRawValue(styles.arrowColor) || '#FFF' }}</span>
                  </button>
                </template>
              </CompositionColorPicker>
            </VariableInputControl>
          </div>
          <div class="space-y-1.5">
             <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter">Background</label>
             <VariableInputControl :model-value="styles.arrowBg" @update:model-value="(val) => updateStyle('arrowBg', val)" variable-type="COLOR">
              <CompositionColorPicker 
                :is-open="activePicker === 'arrowBg'"
                :initial-color="'#' + getHexValue(styles.arrowBg)"
                @close="activePicker = null"
                @color-change="(hex) => updateStyle('arrowBg', { type: 'static', value: hex })"
              >
                <template #trigger>
                  <button @click="activePicker = 'arrowBg'" class="w-full h-7 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-[10px]">
                    <div class="w-2.5 h-2.5 rounded-sm border border-builder-bar-border" :style="{ backgroundColor: '#' + getHexValue(styles.arrowBg) }"></div>
                    <span class="truncate">{{ getRawValue(styles.arrowBg) || 'Transp.' }}</span>
                  </button>
                </template>
              </CompositionColorPicker>
            </VariableInputControl>
          </div>
        </PropertyRow>
        
        <PropertyInput 
          label="Arrow Size" 
          type="number" 
          :model-value="getRawValue(styles.arrowSize)" 
          @update:model-value="(val) => updateStyle('arrowSize', parseInt(val.toString()))"
          placeholder="24"
        />
      </div>
    </PropertyGroup>

    <!-- Pagination Dots -->
    <PropertyGroup title="Pagination" :open="false" :icon="MoreHorizontal">
      <div class="space-y-4">
        <PropertyRow>
          <div class="space-y-1.5">
            <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter">Dots</label>
            <VariableInputControl :model-value="styles.paginationColor" @update:model-value="(val) => updateStyle('paginationColor', val)" variable-type="COLOR">
              <CompositionColorPicker 
                :is-open="activePicker === 'pagColor'"
                :initial-color="'#' + getHexValue(styles.paginationColor)"
                @close="activePicker = null"
                @color-change="(hex) => updateStyle('paginationColor', { type: 'static', value: hex })"
              >
                <template #trigger>
                  <button @click="activePicker = 'pagColor'" class="w-full h-7 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-[10px]">
                    <div class="w-2.5 h-2.5 rounded-sm border border-builder-bar-border" :style="{ backgroundColor: '#' + getHexValue(styles.paginationColor) }"></div>
                    <span class="truncate">{{ getRawValue(styles.paginationColor) || '#FFF' }}</span>
                  </button>
                </template>
              </CompositionColorPicker>
            </VariableInputControl>
          </div>
          <div class="space-y-1.5">
             <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter">Active Dot</label>
             <VariableInputControl :model-value="styles.paginationActiveColor" @update:model-value="(val) => updateStyle('paginationActiveColor', val)" variable-type="COLOR">
              <CompositionColorPicker 
                :is-open="activePicker === 'pagActiveColor'"
                :initial-color="'#' + getHexValue(styles.paginationActiveColor)"
                @close="activePicker = null"
                @color-change="(hex) => updateStyle('paginationActiveColor', { type: 'static', value: hex })"
              >
                <template #trigger>
                  <button @click="activePicker = 'pagActiveColor'" class="w-full h-7 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-[10px]">
                    <div class="w-2.5 h-2.5 rounded-sm border border-builder-bar-border" :style="{ backgroundColor: '#' + getHexValue(styles.paginationActiveColor) }"></div>
                    <span class="truncate">{{ getRawValue(styles.paginationActiveColor) || 'Primary' }}</span>
                  </button>
                </template>
              </CompositionColorPicker>
            </VariableInputControl>
          </div>
        </PropertyRow>

        <div class="space-y-1.5">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter">Shape</label>
          <ButtonGroup 
              :model-value="getRawValue(styles.paginationShape) as string" 
              @update:model-value="(val) => updateStyle('paginationShape', val)"
              :options="shapeOptions"
              size="sm"
          />
        </div>
      </div>
    </PropertyGroup>
  </div>
</template>
