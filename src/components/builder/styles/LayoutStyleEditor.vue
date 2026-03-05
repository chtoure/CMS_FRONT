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
    <PropertyGroup title="Structure" :open="true">
      <div class="space-y-3">
        <div class="space-y-1.5">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text/50 uppercase tracking-tighter">Display</label>
          <ButtonGroup 
            :model-value="(getRawValue(styles.display) as string)" 
            @update:model-value="(val) => updateStyle('display', val)"
            :options="displayOptions"
          />
        </div>

        <div v-if="showGrid" class="space-y-1.5">
          <PropertyInput 
            label="Columns" 
            type="number" 
            :model-value="getRawValue(styles.columns)" 
            @update:model-value="(val) => updateStyle('columns', parseInt(val.toString()))"
            :icon="GripHorizontal"
          />
        </div>
      </div>
    </PropertyGroup>

    <!-- Auto Layout Section (Flex) -->
    <PropertyGroup v-if="showFlex" title="Auto Layout" :open="true" :icon="Layout">
      <div class="space-y-4">
        <!-- Direction & Wrap -->
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

        <!-- Alignment Matrix & Gap -->
        <div class="flex gap-4">
          <AlignmentMatrix 
            :justify="(getRawValue(styles.justify) as string)"
            :align="(getRawValue(styles.align) as string)"
            @update:justify="(val) => updateStyle('justify', val)"
            @update:align="(val) => updateStyle('align', val)"
          />
          
          <div class="flex-1 space-y-2">
            <PropertyInput 
              label="Gap" 
              :model-value="getRawValue(styles.gap)" 
              @update:model-value="(val) => updateStyle('gap', val)"
              :icon="Maximize2"
            />
            <div class="text-[9px] text-builder-bar-text/40 font-mono mt-1">
              Spacing between items
            </div>
          </div>
        </div>

        <!-- Secondary Alignment (Space Between) -->
        <div class="space-y-1.5">
          <button 
            @click="updateStyle('justify', getRawValue(styles.justify) === 'between' ? 'start' : 'between')"
            :class="[
              'w-full h-7 px-2 flex items-center justify-center rounded text-[10px] font-bold border transition-all',
              getRawValue(styles.justify) === 'between'
                ? 'bg-primary/20 border-primary/50 text-white'
                : 'bg-builder-input-bg border-builder-bar-border text-builder-bar-text/60 hover:bg-white/5'
            ]"
          >
            {{ getRawValue(styles.justify) === 'between' ? 'Space Between: Active' : 'Enable Space Between' }}
          </button>
        </div>
      </div>
    </PropertyGroup>
  </div>
</template>
