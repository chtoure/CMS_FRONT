<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { AnyComponentInstance } from '../../../type/component';
import type { AnySectionInstance } from '../../../type/section';
import { useStyleEditor } from '../../../hook/useStyleEditor';
import Label from '../../ui/label/Label.vue';
import Input from '../../ui/input/Input.vue';
import Select from '../../ui/select/Select.vue';
import SelectTrigger from '../../ui/select/SelectTrigger.vue';
import SelectValue from '../../ui/select/SelectValue.vue';
import SelectContent from '../../ui/select/SelectContent.vue';
import SelectItem from '../../ui/select/SelectItem.vue';
import CompositionColorPicker from '../../composition/CompositionColorPicker.vue';
import DimensionInput from '../DimensionInput.vue';
import PropertySection from '../ui/PropertySection.vue';
import PropertyRow from '../ui/PropertyRow.vue';
import PropertyGrid from '../ui/PropertyGrid.vue';
import PropertyButton from '../ui/PropertyButton.vue';
import { Box, Layers, Eye } from 'lucide-vue-next';

const props = defineProps<{
  element: AnyComponentInstance | AnySectionInstance;
  whitelist?: string[];
}>();

const { getRawValue, getHexValue, updateStyle } = useStyleEditor(props.element);

const activePicker = ref<'bg' | 'border' | null>(null);
const showIndividualCorners = ref(false);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const styles = computed(() => props.element.styles as any);

const showField = (fieldName: string) => {
  if (props.whitelist && !props.whitelist.includes(fieldName)) return false;
  return true;
};

// Options
const roundedOptions = [
  { label: 'Aucun', value: 'none' },
  { label: 'Petit', value: 'sm' },
  { label: 'Normal', value: 'md' },
  { label: 'Large', value: 'lg' },
  { label: 'XL', value: 'xl' },
  { label: 'Plein', value: 'full' },
];

const shadowOptions = [
  { label: 'Aucune', value: 'none' },
  { label: 'Petite', value: 'sm' },
  { label: 'Normale', value: 'default' },
  { label: 'Moyenne', value: 'md' },
  { label: 'Grande', value: 'lg' },
  { label: 'XL', value: 'xl' },
  { label: '2XL', value: '2xl' },
];
</script>

<template>
  <div class="space-y-0">
    <!-- Mise en page -->
    <PropertySection v-if="showField('padding') || showField('marginTop') || showField('marginBottom')" title="Mise en page" :icon="Box" :default-open="true">
      <PropertyRow v-if="showField('padding')" label="Padding">
        <DimensionInput :model-value="getRawValue(styles.padding)" @update:model-value="(val: any) => updateStyle('padding', val)" />
      </PropertyRow>
      
      <div class="grid grid-cols-2 gap-3">
        <PropertyRow v-if="showField('marginTop')" label="Marge Haut" label-position="top">
          <DimensionInput :model-value="getRawValue(styles.marginTop)" @update:model-value="(val: any) => updateStyle('marginTop', val)" />
        </PropertyRow>
        <PropertyRow v-if="showField('marginBottom')" label="Marge Bas" label-position="top">
          <DimensionInput :model-value="getRawValue(styles.marginBottom)" @update:model-value="(val: any) => updateStyle('marginBottom', val)" />
        </PropertyRow>
      </div>
    </PropertySection>

    <!-- Dimensions -->
    <PropertySection v-if="showField('width') || showField('height')" title="Dimensions" :default-open="true">
      <div class="grid grid-cols-2 gap-3">
        <PropertyRow v-if="showField('width')" label="Largeur" label-position="top">
          <DimensionInput :model-value="getRawValue(styles.width)" @update:model-value="(val: any) => updateStyle('width', val)" />
        </PropertyRow>
        <PropertyRow v-if="showField('height')" label="Hauteur" label-position="top">
          <DimensionInput :model-value="getRawValue(styles.height)" @update:model-value="(val: any) => updateStyle('height', val)" />
        </PropertyRow>
      </div>
    </PropertySection>

    <!-- Apparence -->
    <PropertySection v-if="showField('bg') || showField('rounded') || showField('shadow') || showField('opacity')" title="Apparence" :icon="Layers" :default-open="true">
      <PropertyRow v-if="showField('bg')" label="Fond">
        <CompositionColorPicker 
          :is-open="activePicker === 'bg'"
          :initial-color="'#' + getHexValue(styles.bg)"
          @close="activePicker = null"
          @color-change="(hex) => updateStyle('bg', hex)"
        >
          <template #trigger>
            <button @click="activePicker = 'bg'" class="w-full h-8 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-xs hover:bg-white/5 transition-colors">
              <div class="w-4 h-4 rounded-sm border border-builder-bar-border" :style="{ backgroundColor: '#' + getHexValue(styles.bg) }"></div>
              <span class="text-builder-bar-text font-mono truncate text-[10px]">{{ getRawValue(styles.bg) || 'Transparent' }}</span>
            </button>
          </template>
        </CompositionColorPicker>
      </PropertyRow>

      <PropertyRow v-if="showField('rounded')" label="Arrondis">
        <div class="flex items-center gap-2 w-full">
          <Select :model-value="(getRawValue(styles.rounded) as string)" @update:model-value="(val) => updateStyle('rounded', val)" v-if="!showIndividualCorners">
            <SelectTrigger class="h-8 input-custom flex-1">
              <SelectValue placeholder="Arrondis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in roundedOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
            </SelectContent>
          </Select>
          <button @click="showIndividualCorners = !showIndividualCorners" class="text-[10px] text-primary/60 hover:text-primary transition-colors px-2 py-1 rounded border border-primary/20 hover:border-primary/40">
            {{ showIndividualCorners ? '◼◼' : '◼' }}
          </button>
        </div>
        <div v-if="showIndividualCorners" class="grid grid-cols-2 gap-2">
          <div v-for="corner in [
            { label: 'TL', key: 'roundedTopLeft' },
            { label: 'TR', key: 'roundedTopRight' },
            { label: 'BL', key: 'roundedBottomLeft' },
            { label: 'BR', key: 'roundedBottomRight' }
          ]" :key="corner.key">
            <input :model-value="getRawValue(styles[corner.key])" @input="(e) => updateStyle(corner.key, (e.target as any).value)" class="h-7 w-full px-2 rounded text-[9px] input-custom" :placeholder="corner.label" />
          </div>
        </div>
      </PropertyRow>

      <PropertyRow v-if="showField('shadow')" label="Ombre">
        <Select :model-value="(getRawValue(styles.shadow) as string)" @update:model-value="(val) => updateStyle('shadow', val)">
          <SelectTrigger class="h-8 input-custom">
            <SelectValue placeholder="Ombre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="opt in shadowOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
          </SelectContent>
        </Select>
      </PropertyRow>

      <PropertyRow v-if="showField('opacity')" label="Opacité" :icon="Eye">
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <input type="range" min="0" max="100" :value="Math.round((Number(getRawValue(styles.opacity)) || 1) * 100)" @input="(e) => updateStyle('opacity', parseFloat((e.target as HTMLInputElement).value) / 100)" class="flex-1 h-1.5 bg-builder-input-bg appearance-none cursor-pointer accent-primary rounded-lg" />
            <span class="text-[10px] font-mono text-primary min-w-10">{{ Math.round((Number(getRawValue(styles.opacity)) || 1) * 100) }}%</span>
          </div>
        </div>
      </PropertyRow>
    </PropertySection>

    <!-- Bordures -->
    <PropertySection v-if="showField('borderWidth')" title="Bordures" :default-open="false">
      <PropertyRow label="Épaisseur">
        <Input type="number" :model-value="getRawValue(styles.borderWidth)" @update:model-value="(val) => updateStyle('borderWidth', parseInt(val.toString()))" class="h-8 input-custom" />
      </PropertyRow>
      
      <PropertyRow v-if="showField('borderStyle')" label="Style">
        <Select :model-value="(getRawValue(styles.borderStyle) as string)" @update:model-value="(val) => updateStyle('borderStyle', val)">
          <SelectTrigger class="h-8 input-custom">
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
            <SelectItem value="dotted">Dotted</SelectItem>
          </SelectContent>
        </Select>
      </PropertyRow>

      <PropertyRow v-if="showField('borderColor')" label="Couleur">
        <CompositionColorPicker 
          :is-open="activePicker === 'border'"
          :initial-color="'#' + getHexValue(styles.borderColor)"
          @close="activePicker = null"
          @color-change="(hex) => updateStyle('borderColor', hex)"
        >
          <template #trigger>
            <button @click="activePicker = 'border'" class="w-full h-8 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-xs hover:bg-white/5 transition-colors">
              <div class="w-4 h-4 rounded-sm border border-builder-bar-border" :style="{ backgroundColor: '#' + getHexValue(styles.borderColor) }"></div>
              <span class="text-builder-bar-text font-mono truncate text-[10px]">{{ getRawValue(styles.borderColor) || 'Transparent' }}</span>
            </button>
          </template>
        </CompositionColorPicker>
      </PropertyRow>
    </PropertySection>
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

<template>
  <div class="space-y-0">
    <!-- Mise en page -->
    <PropertySection v-if="showField('padding') || showField('marginTop') || showField('marginBottom')" title="Mise en page" :icon="Box" :default-open="true">
      <PropertyRow v-if="showField('padding')" label="Padding">
        <DimensionInput :model-value="getRawValue(styles.padding)" @update:model-value="(val: any) => updateStyle('padding', val)" />
      </PropertyRow>
      
      <div class="grid grid-cols-2 gap-3">
        <PropertyRow v-if="showField('marginTop')" label="Marge Haut" label-position="top">
          <DimensionInput :model-value="getRawValue(styles.marginTop)" @update:model-value="(val: any) => updateStyle('marginTop', val)" />
        </PropertyRow>
        <PropertyRow v-if="showField('marginBottom')" label="Marge Bas" label-position="top">
          <DimensionInput :model-value="getRawValue(styles.marginBottom)" @update:model-value="(val: any) => updateStyle('marginBottom', val)" />
        </PropertyRow>
      </div>
    </PropertySection>

    <!-- Dimensions -->
    <PropertySection v-if="showField('width') || showField('height')" title="Dimensions" :default-open="true">
      <div class="grid grid-cols-2 gap-3">
        <PropertyRow v-if="showField('width')" label="Largeur" label-position="top">
          <DimensionInput :model-value="getRawValue(styles.width)" @update:model-value="(val: any) => updateStyle('width', val)" />
        </PropertyRow>
        <PropertyRow v-if="showField('height')" label="Hauteur" label-position="top">
          <DimensionInput :model-value="getRawValue(styles.height)" @update:model-value="(val: any) => updateStyle('height', val)" />
        </PropertyRow>
      </div>
    </PropertySection>

    <!-- Apparence -->
    <PropertySection v-if="showField('bg') || showField('rounded') || showField('shadow') || showField('opacity')" title="Apparence" :icon="Layers" :default-open="true">
      <PropertyRow v-if="showField('bg')" label="Fond">
        <CompositionColorPicker 
          :is-open="activePicker === 'bg'"
          :initial-color="'#' + getHexValue(styles.bg)"
          @close="activePicker = null"
          @color-change="(hex) => updateStyle('bg', hex)"
        >
          <template #trigger>
            <button @click="activePicker = 'bg'" class="w-full h-8 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-xs hover:bg-white/5 transition-colors">
              <div class="w-4 h-4 rounded-sm border border-builder-bar-border" :style="{ backgroundColor: '#' + getHexValue(styles.bg) }"></div>
              <span class="text-builder-bar-text font-mono truncate text-[10px]">{{ getRawValue(styles.bg) || 'Transparent' }}</span>
            </button>
          </template>
        </CompositionColorPicker>
      </PropertyRow>

      <PropertyRow v-if="showField('rounded')" label="Arrondis">
        <div class="flex items-center gap-2 w-full">
          <Select :model-value="(getRawValue(styles.rounded) as string)" @update:model-value="(val) => updateStyle('rounded', val)" v-if="!showIndividualCorners">
            <SelectTrigger class="h-8 input-custom flex-1">
              <SelectValue placeholder="Arrondis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in roundedOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
            </SelectContent>
          </Select>
          <button @click="showIndividualCorners = !showIndividualCorners" class="text-[10px] text-primary/60 hover:text-primary transition-colors px-2 py-1 rounded border border-primary/20 hover:border-primary/40">
            {{ showIndividualCorners ? '◼◼' : '◼' }}
          </button>
        </div>
        <div v-if="showIndividualCorners" class="grid grid-cols-2 gap-2">
          <div v-for="corner in [
            { label: 'TL', key: 'roundedTopLeft' },
            { label: 'TR', key: 'roundedTopRight' },
            { label: 'BL', key: 'roundedBottomLeft' },
            { label: 'BR', key: 'roundedBottomRight' }
          ]" :key="corner.key">
            <input :model-value="getRawValue(styles[corner.key])" @input="(e) => updateStyle(corner.key, (e.target as any).value)" class="h-7 w-full px-2 rounded text-[9px] input-custom" :placeholder="corner.label" />
          </div>
        </div>
      </PropertyRow>

      <PropertyRow v-if="showField('shadow')" label="Ombre">
        <Select :model-value="(getRawValue(styles.shadow) as string)" @update:model-value="(val) => updateStyle('shadow', val)">
          <SelectTrigger class="h-8 input-custom">
            <SelectValue placeholder="Ombre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="opt in shadowOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
          </SelectContent>
        </Select>
      </PropertyRow>

      <PropertyRow v-if="showField('opacity')" label="Opacité" :icon="Eye">
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2">
            <input type="range" min="0" max="100" :value="Math.round((Number(getRawValue(styles.opacity)) || 1) * 100)" @input="(e) => updateStyle('opacity', parseFloat((e.target as HTMLInputElement).value) / 100)" class="flex-1 h-1.5 bg-builder-input-bg appearance-none cursor-pointer accent-primary rounded-lg" />
            <span class="text-[10px] font-mono text-primary min-w-10">{{ Math.round((Number(getRawValue(styles.opacity)) || 1) * 100) }}%</span>
          </div>
        </div>
      </PropertyRow>
    </PropertySection>

    <!-- Bordures -->
    <PropertySection v-if="showField('borderWidth')" title="Bordures" :default-open="false">
      <PropertyRow label="Épaisseur">
        <Input type="number" :model-value="getRawValue(styles.borderWidth)" @update:model-value="(val) => updateStyle('borderWidth', parseInt(val.toString()))" class="h-8 input-custom" />
      </PropertyRow>
      
      <PropertyRow v-if="showField('borderStyle')" label="Style">
        <Select :model-value="(getRawValue(styles.borderStyle) as string)" @update:model-value="(val) => updateStyle('borderStyle', val)">
          <SelectTrigger class="h-8 input-custom">
            <SelectValue placeholder="Style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solid">Solid</SelectItem>
            <SelectItem value="dashed">Dashed</SelectItem>
            <SelectItem value="dotted">Dotted</SelectItem>
          </SelectContent>
        </Select>
      </PropertyRow>

      <PropertyRow v-if="showField('borderColor')" label="Couleur">
        <CompositionColorPicker 
          :is-open="activePicker === 'border'"
          :initial-color="'#' + getHexValue(styles.borderColor)"
          @close="activePicker = null"
          @color-change="(hex) => updateStyle('borderColor', hex)"
        >
          <template #trigger>
            <button @click="activePicker = 'border'" class="w-full h-8 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-xs hover:bg-white/5 transition-colors">
              <div class="w-4 h-4 rounded-sm border border-builder-bar-border" :style="{ backgroundColor: '#' + getHexValue(styles.borderColor) }"></div>
              <span class="text-builder-bar-text font-mono truncate text-[10px]">{{ getRawValue(styles.borderColor) || 'Transparent' }}</span>
            </button>
          </template>
        </CompositionColorPicker>
      </PropertyRow>
    </PropertySection>
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
