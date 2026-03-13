<script lang="ts" setup>
/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed } from 'vue';
import type { AnyComponentInstance } from '../../../type/component';
import type { AnySectionInstance } from '../../../type/section';
import { useStyleEditor } from '../../../hook/useStyleEditor';
import PropertyGroup from '../ui/PropertyGroup.vue';
import PropertyInput from '../ui/PropertyInput.vue';
import ButtonGroup from '../ui/ButtonGroup.vue';
import AlignmentMatrix from '../ui/AlignmentMatrix.vue';
import {
  Layout,
  ArrowRight,
  ArrowDown,
  Maximize2,
  GripHorizontal,
  Box,
  EyeOff
} from 'lucide-vue-next';

const props = defineProps<{
  element: AnyComponentInstance | AnySectionInstance;
}>();

const { getRawValue, updateStyle } = useStyleEditor(props.element);

const styles = computed(() => props.element.styles as any);

const displayOptions = [
  { value: 'block', icon: Box, tooltip: 'Block' },
  { value: 'flex', icon: Layout, tooltip: 'Auto Layout (Flex)' },
  { value: 'grid', icon: GripHorizontal, tooltip: 'Grid' },
  { value: 'hidden', icon: EyeOff, tooltip: 'Hidden' },
];

const directionOptions = [
  { value: 'horizontal', icon: ArrowRight, tooltip: 'Horizontal' },
  { value: 'vertical', icon: ArrowDown, tooltip: 'Vertical' },
];

const showFlex = computed(() => getRawValue(styles.value.display) === 'flex');
const showGrid = computed(() => getRawValue(styles.value.display) === 'grid');

</script>

<template>
  <div class="space-y-4">
    <!-- Structure Section -->
    <PropertyGroup v-if="!('tag' in element && element.tag === 'SliderBuilder')" title="Structure" :open="true">
      <div class="space-y-3">
        <div class="space-y-1.5">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text uppercase tracking-tighter">Affichage</label>
          <ButtonGroup 
            :model-value="(getRawValue(styles.display) as string)" 
            @update:model-value="(val) => updateStyle('display', val)"
            :options="displayOptions"
          />
        </div>

        <div v-if="showGrid" class="space-y-1.5">
          <PropertyInput 
            label="Colonnes" 
            type="number" 
            :model-value="getRawValue(styles.columns)" 
            @update:model-value="(val) => updateStyle('columns', parseInt(val.toString()))"
            :icon="GripHorizontal"
          />
        </div>
      </div>
    </PropertyGroup>

    <!-- Auto Layout Section (Flex) -->
    <PropertyGroup v-if="showFlex" title="Disposition Auto" :open="true" :icon="Layout">
      <div class="space-y-4">
        <!-- Direction & Wrap -->


        <!-- Alignment Matrix & Gap -->
        <div class="grid grid-cols-2 gap-1 items-start">
          <div class="space-y-1">
            <!-- <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter block ml-0.5">Alignment</label> -->
            <AlignmentMatrix
              :justify="(getRawValue(styles.justify) as string)"
              :align="(getRawValue(styles.align) as string)"
              @update:justify="(val) => updateStyle('justify', val)"
              @update:align="(val) => updateStyle('align', val)"
            />
          </div>
          
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <ButtonGroup
                :model-value="(getRawValue(styles.direction) as string)"
                @update:model-value="(val) => updateStyle('direction', val)"
                :options="directionOptions"
                size="sm"
                class="!w-auto"
              />
              <!-- Add wrap toggle here if needed -->
            </div>


            <div class="space-y-1">
              <!-- <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter block ml-0.5">Spacing (Gap)</label> -->
              <PropertyInput 
                label="Espacement" 
                type="number" 
                :model-value="getRawValue(styles.gap)" 
                @update:model-value="(val) => updateStyle('gap', val)"
                :icon="Maximize2"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        <!-- Secondary Alignment (Space Between) -->
        <div class="space-y-1">
          <button 
            @click="updateStyle('justify', getRawValue(styles.justify) === 'between' ? 'start' : 'between')"
            :class="[
              'w-full h-7 px-2 flex items-center justify-center rounded text-[10px] font-bold border transition-all',
              getRawValue(styles.justify) === 'between'
                ? 'bg-primary border-primary text-white'
                : 'bg-builder-input-bg border-builder-bar-border text-builder-bar-text hover:bg-white/5'
            ]"
          >
            {{ getRawValue(styles.justify) === 'between' ? 'Espace entre : actif' : 'Activer l\'espace entre' }}
          </button>
        </div>
      </div>
    </PropertyGroup>
  </div>
</template>
