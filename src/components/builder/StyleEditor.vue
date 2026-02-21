<script lang="ts" setup>
import { inject, computed, ref } from 'vue';
import type { AnyComponentInstance } from '../../type/component';
import type { AnySectionInstance } from '../../type/section';
import Label from '../../components/ui/label/Label.vue';
import Input from '../../components/ui/input/Input.vue';
import Select from '../../components/ui/select/Select.vue';
import SelectTrigger from '../../components/ui/select/SelectTrigger.vue';
import SelectValue from '../../components/ui/select/SelectValue.vue';
import SelectContent from '../../components/ui/select/SelectContent.vue';
import SelectItem from '../../components/ui/select/SelectItem.vue';
import CompositionColorPicker from '../composition/CompositionColorPicker.vue';
import DimensionInput from './DimensionInput.vue';

const props = defineProps<{
  element: AnyComponentInstance | AnySectionInstance;
}>();

const builderState = inject<{
  pageTree: { value: (AnyComponentInstance | AnySectionInstance)[] };
  selectedId: { value: string | null };
  selectComponent: (id: string | null) => void;
}>('builderState');

// État pour les pickers de couleur
const activePicker = ref<'bg' | 'text' | 'border' | null>(null);
const showIndividualCorners = ref(false);

// Helper pour extraire la valeur brute d'une propriété responsive
const getRawValue = (val: unknown): string | number | undefined => {
  if (val && typeof val === 'object' && 'default' in val) {
    return (val as { default: string | number }).default;
  }
  return (typeof val === 'string' || typeof val === 'number') ? val : undefined;
};

// Helper pour convertir une valeur (Tailwind ou Hex) en Hex pur pour le picker
const getHexValue = (val: unknown): string => {
  const raw = getRawValue(val);
  if (!raw || typeof raw !== 'string') return 'FFFFFF';
  
  // Supprimer le '#' s'il est présent au début
  const cleanRaw = raw.startsWith('#') ? raw.slice(1) : raw;
  
  const jitMatch = cleanRaw.match(/\[#([0-9A-Fa-f]{6})\]/);
  if (jitMatch && jitMatch[1]) return jitMatch[1];
  
  if (/^[0-9A-Fa-f]{6}$/.test(cleanRaw)) return cleanRaw;
  
  const tailwindMap: Record<string, string> = {
    'bg-white': 'FFFFFF', 'text-white': 'FFFFFF',
    'bg-black': '000000', 'text-black': '000000',
    'bg-transparent': '00000000',
    'bg-slate-800': '1e293b'
  };
  
  return tailwindMap[cleanRaw] || 'FFFFFF';
};

const updateStyle = (key: string, value: string | number | boolean | undefined) => {
  if (!builderState) return;
  const newStyles = { ...props.element.styles, [key]: value };
  
  const updateTree = (items: (AnyComponentInstance | AnySectionInstance)[]): (AnyComponentInstance | AnySectionInstance)[] => {
    return items.map((item: any): any => {
      if (item.id === props.element.id) {
        return { ...item, styles: newStyles };
      }
      if (item.children) {
        return { ...item, children: updateTree(item.children) };
      }
      return item;
    });
  };
  
  builderState.pageTree.value = updateTree(builderState.pageTree.value);
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

const displayOptions = [
  { label: 'Bloc', value: 'block' },
  { label: 'Flex', value: 'flex' },
  { label: 'Grille', value: 'grid' },
  { label: 'Masqué', value: 'hidden' },
];

const justifyOptions = [
  { label: 'Début', value: 'start' },
  { label: 'Centre', value: 'center' },
  { label: 'Fin', value: 'end' },
  { label: 'Entre', value: 'between' },
];

const alignOptions = [
  { label: 'Début', value: 'start' },
  { label: 'Centre', value: 'center' },
  { label: 'Fin', value: 'end' },
];

const fontWeightOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Normal', value: 'normal' },
  { label: 'Medium', value: 'medium' },
  { label: 'Semibold', value: 'semibold' },
  { label: 'Bold', value: 'bold' },
];

// Computed pour accès typé
const styles = computed(() => props.element.styles as any);

const isSection = computed(() => props.element.family === 'section');
const hasTypography = computed(() => !isSection.value && ['static', 'interactive', 'input'].includes(props.element.family as string));

// Whitelist par famille pour un filtrage strict
const STYLE_WHITELIST: Record<string, string[]> = {
  section: [
    'padding', 'bg', 'opacity', 'display', 'columns', 'gap', 'direction', 'justify', 'align', 
    'borderWidth', 'borderColor', 'borderStyle'
  ],
  container: [
    'marginTop', 'marginBottom', 'padding', 'bg', 'rounded', 'roundedTopLeft', 'roundedTopRight', 
    'roundedBottomLeft', 'roundedBottomRight', 'shadow', 'opacity', 'display', 'width', 'height',
    'columns', 'gap', 'direction', 'justify', 'align', 'borderWidth', 'borderColor', 'borderStyle'
  ],
  static: [
    'marginTop', 'marginBottom', 'padding', 'bg', 'rounded', 'roundedTopLeft', 'roundedTopRight', 
    'roundedBottomLeft', 'roundedBottomRight', 'shadow', 'opacity', 'width', 'height',
    'fontSize', 'fontWeight', 'textAlign', 'textColor'
  ],
  interactive: [
    'marginTop', 'marginBottom', 'padding', 'bg', 'rounded', 'roundedTopLeft', 'roundedTopRight', 
    'roundedBottomLeft', 'roundedBottomRight', 'shadow', 'opacity', 'width', 'height',
    'fontSize', 'fontWeight', 'textAlign', 'textColor', 'variant', 'size'
  ],
  input: [
    'marginTop', 'marginBottom', 'padding', 'bg', 'rounded', 'roundedTopLeft', 'roundedTopRight', 
    'roundedBottomLeft', 'roundedBottomRight', 'shadow', 'opacity', 'width', 'height',
    'fontSize', 'fontWeight', 'textColor', 'variant'
  ]
};

// Helper de visibilité conditionnelle
const showField = (fieldName: string) => {
  const family = props.element.family;
  const whitelist = STYLE_WHITELIST[family] || [];
  
  // 1. Check whitelist
  if (!whitelist.includes(fieldName)) return false;
  
  // 2. Check conditional display (Flex/Grid)
  if (['gap', 'columns', 'direction', 'justify', 'align'].includes(fieldName)) {
    const display = getRawValue(styles.value.display);
    return display === 'flex' || display === 'grid';
  }
  
  return true;
};
</script>

<template>
  <div class="space-y-6 pb-20 p-1">
    
    <!-- Section: Mise en page -->
    <div v-if="showField('display') || showField('padding')" class="space-y-3">
      <h4 class="text-[10px] tracking-wider text-primary font-black border-b border-white/10 pb-1">Mise en page</h4>
      <div class="grid grid-cols-2 gap-3">
        <div v-if="showField('display')" class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Display</Label>
          <Select :model-value="(getRawValue(styles.display) as string)" @update:model-value="(val) => val && updateStyle('display', val as string)" class="input-custom">
            <SelectTrigger class="h-8 input-custom">
              <SelectValue placeholder="Display" class="select-item-custom" />
            </SelectTrigger>
            <SelectContent class="border-builder-bar-border">
              <SelectItem v-for="opt in displayOptions" :key="opt.value" :value="opt.value" class="select-item-custom">{{ opt.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div v-if="showField('padding')" class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Padding</Label>
          <DimensionInput :model-value="getRawValue(styles.padding)" @update:model-value="(val: any) => updateStyle('padding', val)" />
        </div>
      </div>
      <div v-if="showField('marginTop') || showField('marginBottom')" class="grid grid-cols-4 gap-2">
        <div v-if="showField('marginTop')" class="space-y-1.5 col-span-2">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Marge Haut</Label>
          <DimensionInput :model-value="getRawValue(styles.marginTop)" @update:model-value="(val: any) => updateStyle('marginTop', val)" />
        </div>
        <div v-if="showField('marginBottom')" class="space-y-1.5 col-span-2">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Marge Bas</Label>
          <DimensionInput :model-value="getRawValue(styles.marginBottom)" @update:model-value="(val: any) => updateStyle('marginBottom', val)" />
        </div>
      </div>
    </div>

    <div v-if="showField('width') || showField('height')" class="space-y-3">
      <h4 class="text-[10px] tracking-wider text-primary font-black border-b border-white/10 pb-1">Dimension</h4>
      <div class="grid grid-cols-4 gap-2">
        <div v-if="showField('height')" class="space-y-1.5 col-span-2">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Hauteur</Label>
          <DimensionInput :model-value="getRawValue(styles.height)" @update:model-value="(val: any) => updateStyle('height', val)" />
        </div>
        <div v-if="showField('width')" class="space-y-1.5 col-span-2">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Largeur</Label>
          <DimensionInput :model-value="getRawValue(styles.width)" @update:model-value="(val: any) => updateStyle('width', val)" />
        </div>
      </div>
    </div>

    <!-- Section: Conteneur / Section Settings -->
    <div v-if="showField('columns') || showField('gap') || showField('direction') || showField('justify') || showField('align') || showField('borderWidth')" class="space-y-3">
      <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">
        {{ isSection ? 'Propriétés Section' : 'Configuration Flex/Grid' }}
      </h4>
      <div class="grid grid-cols-2 gap-3">
        <div v-if="showField('columns')" class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Colonnes</Label>
          <Input type="number" :model-value="getRawValue(styles.columns)" @update:model-value="(val) => updateStyle('columns', parseInt(val.toString()))" class="h-8 input-custom" />
        </div>
        <div v-if="showField('gap')" class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Gap</Label>
          <DimensionInput :model-value="getRawValue(styles.gap)" @update:model-value="(val: any) => updateStyle('gap', val)" />
        </div>
      </div>
      <div v-if="showField('direction')" class="space-y-1.5">
        <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Direction</Label>
        <Select :model-value="(getRawValue(styles.direction) as string)" @update:model-value="(val) => val && updateStyle('direction', val as string)">
          <SelectTrigger class="h-8 input-custom">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent class="border-builder-bar-border">
            <SelectItem value="vertical" class="select-item-custom">Vertical</SelectItem>
            <SelectItem value="horizontal" class="select-item-custom">Horizontal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div v-if="showField('justify') || showField('align')" class="grid grid-cols-2 gap-3">
        <div v-if="showField('justify')" class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !mono">Justify</Label>
          <Select :model-value="(getRawValue(styles.justify) as string)" @update:model-value="(val) => updateStyle('justify', val as string)">
            <SelectTrigger class="h-8 input-custom">
              <SelectValue placeholder="Justify" />
            </SelectTrigger>
            <SelectContent class="border-builder-bar-border">
              <SelectItem v-for="opt in justifyOptions" :key="opt.value" :value="opt.value" class="select-item-custom">{{ opt.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div v-if="showField('align')" class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !mono">Align</Label>
          <Select :model-value="(getRawValue(styles.align) as string)" @update:model-value="(val) => updateStyle('align', val as string)">
            <SelectTrigger class="h-8 input-custom">
              <SelectValue placeholder="Align" />
            </SelectTrigger>
            <SelectContent class="border-builder-bar-border">
              <SelectItem v-for="opt in alignOptions" :key="opt.value" :value="opt.value" class="select-item-custom">{{ opt.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <!-- Section: Bordure -->
      <div v-if="showField('borderWidth')" class="space-y-3 pt-3 border-t border-white/10">
         <h4 class="text-[10px] uppercase tracking-wider text-primary font-black pb-1">Bordure</h4>
         <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
               <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Épaisseur</Label>
               <Input type="number" :model-value="getRawValue(styles.borderWidth)" @update:model-value="(val) => updateStyle('borderWidth', parseInt(val.toString()))" class="h-8 input-custom" />
            </div>
             <div v-if="showField('borderStyle')" class="space-y-1.5">
               <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Style</Label>
               <Select :model-value="(getRawValue(styles.borderStyle) as string)" @update:model-value="(val) => val && updateStyle('borderStyle', val as string)">
                  <SelectTrigger class="h-8 input-custom">
                     <SelectValue placeholder="Style" />
                  </SelectTrigger>
                  <SelectContent class="border-builder-bar-border">
                     <SelectItem value="solid" class="select-item-custom">Solid</SelectItem>
                     <SelectItem value="dashed" class="select-item-custom">Dashed</SelectItem>
                     <SelectItem value="dotted" class="select-item-custom">Dotted</SelectItem>
                     <SelectItem value="double" class="select-item-custom">Double</SelectItem>
                     <SelectItem value="hidden" class="select-item-custom">Hidden</SelectItem>
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
               <button @click="activePicker = 'border'" class="w-full h-8 px-2 flex items-center gap-2 bg-black/20 border border-border/50 rounded text-xs hover:bg-white/5 transition-colors">
                  <div class="w-4 h-4 rounded-sm border border-white/20" :style="{ backgroundColor: '#' + getHexValue(styles.borderColor) }"></div>
                  <span class="text-gray-300 font-mono">{{ getRawValue(styles.borderColor) || 'Transparent' }}</span>
               </button>
               </template>
            </CompositionColorPicker>
         </div>
      </div>
    </div>

    <!-- Section: Typographie -->
    <div v-if="hasTypography" class="space-y-3">
      <h4 class="text-[10px] tracking-wider text-primary font-black border-b border-builder-bar-border pb-1">Typographie</h4>
      <div v-if="showField('textColor')" class="space-y-2">
        <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Couleur du texte</Label>
        <CompositionColorPicker 
          :is-open="activePicker === 'text'"
          :initial-color="'#' + getHexValue(styles.textColor)"
          @close="activePicker = null"
          @color-change="(hex) => updateStyle('textColor', hex)"
        >
          <template #trigger>
            <button @click="activePicker = 'text'" class="w-full h-8 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-xs hover:bg-white/5 transition-colors">
              <div class="w-4 h-4 rounded-sm border border-builder-bar-border" :style="{ backgroundColor: '#' + getHexValue(styles.textColor) }"></div>
              <span class="text-gray-300 font-mono">{{ getRawValue(styles.textColor) || 'Inherit' }}</span>
            </button>
          </template>
        </CompositionColorPicker>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div v-if="showField('fontSize')" class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Taille (px)</Label>
          <Input type="number" :model-value="getRawValue(styles.fontSize)" @update:model-value="(val) => updateStyle('fontSize', val)" class="h-8 input-custom" />
        </div>
        <div v-if="showField('fontWeight')" class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Poids</Label>
          <Select :model-value="(getRawValue(styles.fontWeight) as string)" @update:model-value="(val) => updateStyle('fontWeight', val as string)">
            <SelectTrigger class="h-8 input-custom">
              <SelectValue placeholder="Poids" />
            </SelectTrigger>
            <SelectContent class="border-builder-bar-border">
              <SelectItem v-for="opt in fontWeightOptions" :key="opt.value" :value="opt.value" class="select-item-custom">{{ opt.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div v-if="showField('textAlign')" class="space-y-1.5">
        <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Alignement</Label>
        <Select :model-value="(getRawValue(styles.textAlign) as string)" @update:model-value="(val) => updateStyle('textAlign', val as string)">
          <SelectTrigger class="h-8 input-custom">
            <SelectValue placeholder="Align" />
          </SelectTrigger>
          <SelectContent class="border-builder-bar-border">
            <SelectItem value="left" class="select-item-custom">Gauche</SelectItem>
            <SelectItem value="center" class="select-item-custom">Centre</SelectItem>
            <SelectItem value="right" class="select-item-custom">Droite</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Section: Apparence -->
    <div v-if="showField('bg') || showField('rounded') || showField('shadow') || showField('opacity')" class="space-y-3">
      <h4 class="text-[10px] tracking-wider text-primary font-black border-b border-builder-bar-border pb-1">Apparence</h4>
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
              <span class="text-builder-bar-text font-mono">{{ getRawValue(styles.bg) || 'Transparent' }}</span>
            </button>
          </template>
        </CompositionColorPicker>
      </div>
      
      <!-- Arrondis -->
      <div v-if="showField('rounded')" class="space-y-1.5">
        <div class="flex items-center justify-between">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Arrondis</Label>
          <button @click="showIndividualCorners = !showIndividualCorners" class="text-[10px] text-primary hover:text-white transition-colors">
            {{ showIndividualCorners ? 'Global' : 'Individuel' }}
          </button>
        </div>

        <div v-if="!showIndividualCorners">
          <Select :model-value="(getRawValue(styles.rounded) as string)" @update:model-value="(val) => updateStyle('rounded', val as string)">
            <SelectTrigger class="h-8 input-custom">
              <SelectValue placeholder="Arrondis" />
            </SelectTrigger>
            <SelectContent class="border-builder-bar-border">
              <SelectItem v-for="opt in roundedOptions" :key="opt.value" :value="opt.value" class="select-item-custom">{{ opt.label }}</SelectItem>
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
            <Label class="text-[9px] text-builder-bar-text !font-bold !font-mono">{{ corner.label }}</Label>
            <Input :model-value="getRawValue(styles[corner.key])" @update:model-value="(val) => updateStyle(corner.key, val)" class="h-7 input-custom" placeholder="0" />
          </div>
        </div>
      </div>

      <!-- Ombre -->
      <div v-if="showField('shadow')" class="space-y-1.5">
        <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono ">Ombre</Label>
        <Select :model-value="(getRawValue(styles.shadow) as string)" @update:model-value="(val) => updateStyle('shadow', val as string)">
          <SelectTrigger class="h-8 input-custom">
            <SelectValue placeholder="Ombre" />
          </SelectTrigger>
          <SelectContent class="border-builder-bar-border">
            <SelectItem v-for="opt in shadowOptions" :key="opt.value" :value="opt.value" class="select-item-custom">{{ opt.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div v-if="showField('opacity')" class="space-y-1.5">
        <Label class="text-[11px] text-builder-bar-text font-mono">Opacité ({{ Math.round((Number(getRawValue(styles.opacity)) || 1) * 100) }}%)</Label>
        <input type="range" min="0" max="1" step="0.05" :value="getRawValue(styles.opacity) || 1" @input="(e) => updateStyle('opacity', parseFloat((e.target as HTMLInputElement).value))" class="w-full h-1.5 bg-border appearance-none cursor-pointer accent-primary rounded-lg" />
      </div>
    </div>

    <!-- Section: Interactif -->
    <div v-if="showField('variant') || showField('size')" class="space-y-3">
      <h4 class="text-[10px] tracking-wider text-primary font-black border-b border-builder-bar-border pb-1">Interactif</h4>
      <div class="grid grid-cols-2 gap-3">
        <div v-if="showField('variant')" class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Variante</Label>
          <Input :model-value="getRawValue(styles.variant)" @update:model-value="(val) => updateStyle('variant', val)" class="h-8 input-custom" />
        </div>
        <div v-if="showField('size')" class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Taille</Label>
          <Input :model-value="getRawValue(styles.size)" @update:model-value="(val) => updateStyle('size', val)" class="h-8 input-custom" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
} */


.input-custom {
  @apply h-8 w-full !rounded px-3 py-1 text-[11px] shadow-sm transition-all outline-none !font-mono;
  
  background-color: var(--builder-input-bg);
  border: 1px solid var(--builder-input-border);
  color: var(--builder-input-text);
  
  @apply focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:border-transparent;

  --tw-ring-color: #3B82F6;
}

.input-custom::placeholder {
  color: var(--builder-input-placeholder);
}

.select-item-custom {
  @apply cursor-pointer transition-colors px-2 py-1.5 !rounded font-mono;
  color: var(--builder-bar-text);
}

.select-item-custom[data-highlighted] {
  background-color: var(--primary) !important;
  color: #F8FAFC !important;
  outline: none !important;
}
</style>

