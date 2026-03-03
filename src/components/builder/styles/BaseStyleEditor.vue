<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { AnyComponentInstance } from '../../../type/component';
import type { AnySectionInstance } from '../../../type/section';
import { useStyleEditor } from '../../../hook/useStyleEditor';
import CompositionColorPicker from '../../composition/CompositionColorPicker.vue';
import DimensionInput from '../DimensionInput.vue';
import PropertyGroup from '../ui/PropertyGroup.vue';
import PropertyRow from '../ui/PropertyRow.vue';
import PropertyInput from '../ui/PropertyInput.vue';
import PropertyButton from '../ui/PropertyButton.vue';
import { Zap, Layers } from 'lucide-vue-next';

const props = defineProps<{
  element: AnyComponentInstance | AnySectionInstance;
  whitelist?: string[];
}>();

const { getRawValue, getHexValue, updateStyle } = useStyleEditor(props.element);

const activePicker = ref<'bg' | 'border' | null>(null);
const showIndividualCorners = ref(false);

const styles = computed(() => props.element.styles as any);

const showField = (fieldName: string) => {
  if (props.whitelist && !props.whitelist.includes(fieldName)) return false;
  return true;
};

const roundedOptions = [
  { label: 'None', value: 'none' },
  { label: 'SM', value: 'sm' },
  { label: 'MD', value: 'md' },
  { label: 'LG', value: 'lg' },
  { label: 'XL', value: 'xl' },
  { label: 'Full', value: 'full' },
];

const shadowOptions = [
  { label: 'None', value: 'none' },
  { label: 'SM', value: 'sm' },
  { label: 'Default', value: 'default' },
  { label: 'MD', value: 'md' },
  { label: 'LG', value: 'lg' },
  { label: 'XL', value: 'xl' },
  { label: '2XL', value: '2xl' },
];
</script>

<template>
  <div class="properties-container">
    <!-- Spacing Section -->
    <PropertyGroup v-if="showField('padding') || showField('marginTop') || showField('marginBottom')" title="Spacing" :icon="Layers" :open="true">
      <div v-if="showField('padding')" class="space-y-1.5">
        <label class="text-[10px] font-mono font-bold text-builder-bar-text/70 uppercase tracking-wider">Padding</label>
        <DimensionInput :model-value="getRawValue(styles.padding)" @update:model-value="(val: any) => updateStyle('padding', val)" />
      </div>
      <PropertyRow v-if="showField('marginTop') || showField('marginBottom')">
        <PropertyInput 
          v-if="showField('marginTop')"
          label="Margin Top"
          :model-value="getRawValue(styles.marginTop)"
          @update:model-value="(val) => updateStyle('marginTop', val)"
          type="number"
        />
        <PropertyInput 
          v-if="showField('marginBottom')"
          label="Margin Bot."
          :model-value="getRawValue(styles.marginBottom)"
          @update:model-value="(val) => updateStyle('marginBottom', val)"
          type="number"
        />
      </PropertyRow>
    </PropertyGroup>

    <!-- Size Section -->
    <PropertyGroup v-if="showField('width') || showField('height')" title="Dimensions" :open="true">
      <PropertyRow v-if="showField('width') || showField('height')">
        <PropertyInput 
          v-if="showField('width')"
          label="Width"
          :model-value="getRawValue(styles.width)"
          @update:model-value="(val) => updateStyle('width', val)"
          type="number"
          placeholder="auto"
        />
        <PropertyInput 
          v-if="showField('height')"
          label="Height"
          :model-value="getRawValue(styles.height)"
          @update:model-value="(val) => updateStyle('height', val)"
          type="number"
          placeholder="auto"
        />
      </PropertyRow>
    </PropertyGroup>

    <!-- Fill/Color Section -->
    <PropertyGroup v-if="showField('bg')" title="Fill" :open="true">
      <div v-if="showField('bg')" class="space-y-2">
        <label class="text-[10px] font-mono font-bold text-builder-bar-text/70 uppercase tracking-wider">Background</label>
        <CompositionColorPicker 
          :is-open="activePicker === 'bg'"
          :initial-color="'#' + getHexValue(styles.bg)"
          @close="activePicker = null"
          @color-change="(hex) => updateStyle('bg', hex)"
        >
          <template #trigger>
            <button 
              @click="activePicker = 'bg'" 
              class="w-full h-8 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-xs hover:bg-white/5 transition-colors"
            >
              <div 
                class="w-5 h-5 rounded-md border-2 border-builder-bar-border transition-all" 
                :style="{ backgroundColor: '#' + getHexValue(styles.bg) }"
              />
              <span class="text-builder-bar-text font-mono text-[10px] flex-1 text-left truncate">{{ getRawValue(styles.bg) || 'Transparent' }}</span>
            </button>
          </template>
        </CompositionColorPicker>
      </div>
    </PropertyGroup>

    <!-- Appearance Section -->
    <PropertyGroup v-if="showField('rounded') || showField('shadow') || showField('opacity')" title="Appearance" :open="true">
      <div v-if="showField('opacity')" class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text/70 uppercase tracking-wider">Opacity</label>
          <span class="text-[10px] font-mono text-builder-bar-text/50">{{ Math.round((Number(getRawValue(styles.opacity)) || 1) * 100) }}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.05" 
          :value="getRawValue(styles.opacity) || 1" 
          @input="(e) => updateStyle('opacity', parseFloat((e.target as HTMLInputElement).value))" 
          class="w-full h-2 bg-builder-bar-border appearance-none cursor-pointer accent-primary rounded-full"
        />
      </div>

      <div v-if="showField('rounded')" class="space-y-2">
        <div class="flex items-center justify-between">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text/70 uppercase tracking-wider">Radius</label>
          <button 
            @click="showIndividualCorners = !showIndividualCorners" 
            class="text-[9px] text-primary/60 hover:text-primary transition-colors"
          >
            {{ showIndividualCorners ? '∟ Corners' : 'All' }}
          </button>
        </div>
        <div v-if="!showIndividualCorners" class="flex gap-2">
          <select 
            :value="getRawValue(styles.rounded) as string" 
            @input="(e) => updateStyle('rounded', (e.target as HTMLSelectElement).value)"
            class="flex-1 h-7 px-2 text-[10px] font-mono rounded border bg-builder-input-bg border-builder-bar-border text-builder-bar-text"
          >
            <option v-for="opt in roundedOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <PropertyRow v-else cols-4 gap-sm>
          <PropertyInput 
            v-for="corner in [
              { label: 'TL', key: 'roundedTopLeft' },
              { label: 'TR', key: 'roundedTopRight' },
              { label: 'BL', key: 'roundedBottomLeft' },
              { label: 'BR', key: 'roundedBottomRight' }
            ]"
            :key="corner.key"
            :label="corner.label"
            :model-value="getRawValue(styles[corner.key])"
            @update:model-value="(val) => updateStyle(corner.key, val)"
            type="number"
            compact
          />
        </PropertyRow>
      </div>

      <div v-if="showField('shadow')" class="space-y-2">
        <label class="text-[10px] font-mono font-bold text-builder-bar-text/70 uppercase tracking-wider">Shadow</label>
        <select 
          :value="getRawValue(styles.shadow) as string" 
          @input="(e) => updateStyle('shadow', (e.target as HTMLSelectElement).value)"
          class="w-full h-7 px-2 text-[10px] font-mono rounded border bg-builder-input-bg border-builder-bar-border text-builder-bar-text"
        >
          <option v-for="opt in shadowOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
    </PropertyGroup>

    <!-- Stroke Section -->
    <PropertyGroup v-if="showField('borderWidth')" title="Stroke" :open="false">
      <PropertyRow cols-2>
        <PropertyInput 
          label="Width"
          :model-value="getRawValue(styles.borderWidth)"
          @update:model-value="(val) => updateStyle('borderWidth', parseInt(val.toString()))"
          type="number"
        />
        <div v-if="showField('borderStyle')" class="space-y-1.5">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text/70 uppercase tracking-wider">Style</label>
          <select 
            :value="getRawValue(styles.borderStyle) as string" 
            @input="(e) => updateStyle('borderStyle', (e.target as HTMLSelectElement).value)"
            class="w-full h-7 px-2 text-[10px] font-mono rounded border bg-builder-input-bg border-builder-bar-border text-builder-bar-text"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </div>
      </PropertyRow>
      <div v-if="showField('borderColor')" class="space-y-2">
        <label class="text-[10px] font-mono font-bold text-builder-bar-text/70 uppercase tracking-wider">Color</label>
        <CompositionColorPicker 
          :is-open="activePicker === 'border'"
          :initial-color="'#' + getHexValue(styles.borderColor)"
          @close="activePicker = null"
          @color-change="(hex) => updateStyle('borderColor', hex)"
        >
          <template #trigger>
            <button 
              @click="activePicker = 'border'" 
              class="w-full h-8 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-xs hover:bg-white/5 transition-colors"
            >
              <div 
                class="w-5 h-5 rounded-md border-2 border-builder-bar-border" 
                :style="{ backgroundColor: '#' + getHexValue(styles.borderColor) }"
              />
              <span class="text-builder-bar-text font-mono text-[10px] flex-1 text-left truncate">{{ getRawValue(styles.borderColor) || 'Transparent' }}</span>
            </button>
          </template>
        </CompositionColorPicker>
      </div>
    </PropertyGroup>
  </div>
</template>

<style scoped>
.properties-container {
  @apply space-y-1;
}

select {
  transition: all 0.2s ease;
}

select:hover {
  @apply border-builder-bar-border bg-white/5;
}

select:focus-visible {
  @apply border-primary/50 ring-1 ring-primary/30 outline-none;
}
</style>
