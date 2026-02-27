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
  <div class="space-y-6">
    <!-- Mise en page de base -->
    <div v-if="showField('padding') || showField('marginTop') || showField('marginBottom')" class="space-y-3">
      <h4 class="text-[10px] tracking-wider text-primary font-black border-b border-white/10 pb-1">Mise en page</h4>
      <div v-if="showField('padding')" class="space-y-1.5">
        <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Padding</Label>
        <DimensionInput :model-value="getRawValue(styles.padding)" @update:model-value="(val: any) => updateStyle('padding', val)" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div v-if="showField('marginTop')" class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Marge Haut</Label>
          <DimensionInput :model-value="getRawValue(styles.marginTop)" @update:model-value="(val: any) => updateStyle('marginTop', val)" />
        </div>
        <div v-if="showField('marginBottom')" class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Marge Bas</Label>
          <DimensionInput :model-value="getRawValue(styles.marginBottom)" @update:model-value="(val: any) => updateStyle('marginBottom', val)" />
        </div>
      </div>
    </div>

    <!-- Dimensions -->
    <div v-if="showField('width') || showField('height')" class="space-y-3">
      <h4 class="text-[10px] tracking-wider text-primary font-black border-b border-white/10 pb-1">Dimensions</h4>
      <div class="grid grid-cols-2 gap-3">
        <div v-if="showField('width')" class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Largeur</Label>
          <DimensionInput :model-value="getRawValue(styles.width)" @update:model-value="(val: any) => updateStyle('width', val)" />
        </div>
        <div v-if="showField('height')" class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Hauteur</Label>
          <DimensionInput :model-value="getRawValue(styles.height)" @update:model-value="(val: any) => updateStyle('height', val)" />
        </div>
      </div>
    </div>

    <!-- Apparence -->
    <div v-if="showField('bg') || showField('rounded') || showField('shadow') || showField('opacity')" class="space-y-3">
      <h4 class="text-[10px] tracking-wider text-primary font-black border-b border-white/10 pb-1">Apparence</h4>
      
      <div v-if="showField('bg')" class="space-y-2">
        <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Couleur de fond</Label>
        <CompositionColorPicker 
          :is-open="activePicker === 'bg'"
          :initial-color="'#' + getHexValue(styles.bg)"
          @close="activePicker = null"
          @color-change="(hex) => updateStyle('bg', hex)"
        >
          <template #trigger>
            <button @click="activePicker = 'bg'" class="w-full h-8 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-xs hover:bg-white/5 transition-colors">
              <div class="w-4 h-4 rounded-sm border border-builder-bar-border" :style="{ backgroundColor: '#' + getHexValue(styles.bg) }"></div>
              <span class="text-builder-bar-text font-mono truncate">{{ getRawValue(styles.bg) || 'Transparent' }}</span>
            </button>
          </template>
        </CompositionColorPicker>
      </div>

      <div v-if="showField('rounded')" class="space-y-1.5">
        <div class="flex items-center justify-between">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Arrondis</Label>
          <button @click="showIndividualCorners = !showIndividualCorners" class="text-[10px] text-primary hover:text-white transition-colors">
            {{ showIndividualCorners ? 'Global' : 'Individuel' }}
          </button>
        </div>
        <div v-if="!showIndividualCorners">
          <Select :model-value="(getRawValue(styles.rounded) as string)" @update:model-value="(val) => updateStyle('rounded', val)">
            <SelectTrigger class="h-8 input-custom">
              <SelectValue placeholder="Arrondis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in roundedOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div v-else class="grid grid-cols-2 gap-2">
          <div v-for="corner in [
            { label: 'Haut G.', key: 'roundedTopLeft' },
            { label: 'Haut D.', key: 'roundedTopRight' },
            { label: 'Bas G.', key: 'roundedBottomLeft' },
            { label: 'Bas D.', key: 'roundedBottomRight' }
          ]" :key="corner.key" class="space-y-1">
            <Label class="text-[9px] text-builder-bar-text">{{ corner.label }}</Label>
            <Input :model-value="getRawValue(styles[corner.key])" @update:model-value="(val) => updateStyle(corner.key, val)" class="h-7 input-custom" placeholder="0" />
          </div>
        </div>
      </div>

      <div v-if="showField('shadow')" class="space-y-1.5">
        <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Ombre</Label>
        <Select :model-value="(getRawValue(styles.shadow) as string)" @update:model-value="(val) => updateStyle('shadow', val)">
          <SelectTrigger class="h-8 input-custom">
            <SelectValue placeholder="Ombre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="opt in shadowOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div v-if="showField('opacity')" class="space-y-1.5">
        <Label class="text-[11px] text-builder-bar-text font-mono">Opacité ({{ Math.round((Number(getRawValue(styles.opacity)) || 1) * 100) }}%)</Label>
        <input type="range" min="0" max="1" step="0.05" :value="getRawValue(styles.opacity) || 1" @input="(e) => updateStyle('opacity', parseFloat((e.target as HTMLInputElement).value))" class="w-full h-1.5 bg-border appearance-none cursor-pointer accent-primary rounded-lg" />
      </div>
    </div>

    <!-- Bordures -->
    <div v-if="showField('borderWidth')" class="space-y-3">
      <h4 class="text-[10px] tracking-wider text-primary font-black border-b border-white/10 pb-1">Bordures</h4>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Épaisseur</Label>
          <Input type="number" :model-value="getRawValue(styles.borderWidth)" @update:model-value="(val) => updateStyle('borderWidth', parseInt(val.toString()))" class="h-8 input-custom" />
        </div>
        <div v-if="showField('borderStyle')" class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Style</Label>
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
        </div>
      </div>
      <div v-if="showField('borderColor')" class="space-y-2">
        <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Couleur de bordure</Label>
        <CompositionColorPicker 
          :is-open="activePicker === 'border'"
          :initial-color="'#' + getHexValue(styles.borderColor)"
          @close="activePicker = null"
          @color-change="(hex) => updateStyle('borderColor', hex)"
        >
          <template #trigger>
            <button @click="activePicker = 'border'" class="w-full h-8 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-xs hover:bg-white/5 transition-colors">
              <div class="w-4 h-4 rounded-sm border border-builder-bar-border" :style="{ backgroundColor: '#' + getHexValue(styles.borderColor) }"></div>
              <span class="text-builder-bar-text font-mono truncate">{{ getRawValue(styles.borderColor) || 'Transparent' }}</span>
            </button>
          </template>
        </CompositionColorPicker>
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
