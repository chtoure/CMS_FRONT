<script lang="ts" setup>
import { inject, computed, ref } from 'vue';
import type { AnyComponentInstance, AllStyles, ContainerStyles, InteractiveStyles } from '../../type/component';
import Label from '../../components/ui/label/Label.vue';
import Input from '../../components/ui/input/Input.vue';
import Select from '../../components/ui/select/Select.vue';
import SelectTrigger from '../../components/ui/select/SelectTrigger.vue';
import SelectValue from '../../components/ui/select/SelectValue.vue';
import SelectContent from '../../components/ui/select/SelectContent.vue';
import SelectItem from '../../components/ui/select/SelectItem.vue';
import CompositionColorPicker from '../composition/CompositionColorPicker.vue';

const props = defineProps<{
  element: AnyComponentInstance;
}>();

const builderState = inject<{
  pageTree: { value: AnyComponentInstance[] };
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
  
  const jitMatch = raw.match(/\[#([0-9A-Fa-f]{6})\]/);
  if (jitMatch && jitMatch[1]) return jitMatch[1];
  if (/^[0-9A-Fa-f]{6}$/.test(raw)) return raw;
  
  const tailwindMap: Record<string, string> = {
    'bg-white': 'FFFFFF', 'text-white': 'FFFFFF',
    'bg-black': '000000', 'text-black': '000000',
    'bg-transparent': '00000000',
    'bg-slate-800': '1e293b'
  };
  
  return tailwindMap[raw] || 'FFFFFF';
};

const updateStyle = (key: string, value: string | number | boolean | undefined) => {
  if (!builderState) return;
  const newStyles = { ...props.element.styles, [key]: value };
  const updateNode = (nodes: AnyComponentInstance[]): AnyComponentInstance[] => {
    return nodes.map((node: AnyComponentInstance): AnyComponentInstance => {
      if (node.id === props.element.id) {
        return { ...node, styles: newStyles as AllStyles };
      }
      if (node.children) {
        return { ...node, children: updateNode(node.children) };
      }
      return node;
    });
  };
  builderState.pageTree.value = updateNode(builderState.pageTree.value);
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
const containerStyles = computed(() => props.element.styles as ContainerStyles);
const interactiveStyles = computed(() => props.element.styles as InteractiveStyles);

const hasTypography = computed(() => ['static', 'interactive', 'input'].includes(props.element.family));
</script>

<template>
  <div class="space-y-6 pb-20 p-1">
    
    <!-- Section: Mise en page -->
    <div class="space-y-3">
      <h4 class="text-[10px] tracking-wider text-primary font-black border-b border-white/10 pb-1">Mise en page</h4>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Display</Label>
          <Select :model-value="(getRawValue(styles.display) as string)" @update:model-value="(val) => val && updateStyle('display', val as string)">
            <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
              <SelectValue placeholder="Display" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in displayOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Padding</Label>
          <Input type="number" :model-value="getRawValue(styles.padding)" @update:model-value="(val) => updateStyle('padding', parseInt(val.toString()))" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
      </div>
      <div class="grid grid-cols-4 gap-2">
        <div class="space-y-1.5 col-span-2">
          <Label class="text-[11px] text-gray-400">Marge Haut</Label>
          <Input type="number" :model-value="getRawValue(styles.marginTop)" @update:model-value="(val) => updateStyle('marginTop', parseInt(val.toString()))" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
        <div class="space-y-1.5 col-span-2">
          <Label class="text-[11px] text-gray-400">Marge Bas</Label>
          <Input type="number" :model-value="getRawValue(styles.marginBottom)" @update:model-value="(val) => updateStyle('marginBottom', parseInt(val.toString()))" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
      </div>
    </div>

    <div class="space-y-3">
      <h4 class="text-[10px] tracking-wider text-primary font-black border-b border-white/10 pb-1">Dimension</h4>
      <div class="grid grid-cols-4 gap-2">
        <div class="space-y-1.5 col-span-2">
          <Label class="text-[11px] text-gray-400">Hauteur</Label>
          <Input type="number" :model-value="getRawValue(styles.height)" @update:model-value="(val) => updateStyle('height', parseInt(val.toString()))" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
        <div class="space-y-1.5 col-span-2">
          <Label class="text-[11px] text-gray-400">Largeur</Label>
          <Input type="number" :model-value="getRawValue(styles.width)" @update:model-value="(val) => updateStyle('width', parseInt(val.toString()))" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
      </div>
    </div>

    <!-- Section: Conteneur -->
    <div v-if="element.family === 'container'" class="space-y-3">
      <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">Réglages Conteneur</h4>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Colonnes</Label>
          <Input type="number" :model-value="getRawValue(containerStyles.columns)" @update:model-value="(val) => updateStyle('columns', parseInt(val.toString()))" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Gap</Label>
          <Input type="number" :model-value="getRawValue(containerStyles.gap)" @update:model-value="(val) => updateStyle('gap', parseInt(val.toString()))" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
      </div>
      <div class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">Direction</Label>
        <Select :model-value="(getRawValue(containerStyles.direction) as string)" @update:model-value="(val) => val && updateStyle('direction', val as string)">
          <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
            <SelectValue placeholder="Direction" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vertical">Vertical</SelectItem>
            <SelectItem value="horizontal">Horizontal</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Justify</Label>
          <Select :model-value="(getRawValue(containerStyles.justify) as string)" @update:model-value="(val) => updateStyle('justify', val as string)">
            <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
              <SelectValue placeholder="Justify" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in justifyOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Align</Label>
          <Select :model-value="(getRawValue(containerStyles.align) as string)" @update:model-value="(val) => updateStyle('align', val as string)">
            <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
              <SelectValue placeholder="Align" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in alignOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <!-- Section: Bordure (Container) -->
      <div class="space-y-3 pt-3 border-t border-white/10">
         <h4 class="text-[10px] uppercase tracking-wider text-primary font-black pb-1">Bordure</h4>
         <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
               <Label class="text-[11px] text-gray-400">Épaisseur</Label>
               <Input type="number" :model-value="getRawValue(containerStyles.borderWidth)" @update:model-value="(val) => updateStyle('borderWidth', parseInt(val.toString()))" class="h-8 text-xs bg-black/20 border-border/50" />
            </div>
             <div class="space-y-1.5">
               <Label class="text-[11px] text-gray-400">Style</Label>
               <Select :model-value="(getRawValue(containerStyles.borderStyle) as string)" @update:model-value="(val) => val && updateStyle('borderStyle', val as string)">
                  <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
                     <SelectValue placeholder="Style" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="solid">Solid</SelectItem>
                     <SelectItem value="dashed">Dashed</SelectItem>
                     <SelectItem value="dotted">Dotted</SelectItem>
                     <SelectItem value="double">Double</SelectItem>
                     <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
               </Select>
            </div>
         </div>
         <div class="space-y-2">
            <Label class="text-[11px] text-gray-400">Couleur</Label>
            <CompositionColorPicker 
               :is-open="activePicker === 'border'"
               :initial-color="'#' + getHexValue(containerStyles.borderColor)"
               @close="activePicker = null"
               @color-change="(hex) => updateStyle('borderColor', hex)"
            >
               <template #trigger>
               <button @click="activePicker = 'border'" class="w-full h-8 px-2 flex items-center gap-2 bg-black/20 border border-border/50 rounded text-xs hover:bg-white/5 transition-colors">
                  <div class="w-4 h-4 rounded-sm border border-white/20" :style="{ backgroundColor: '#' + getHexValue(containerStyles.borderColor) }"></div>
                  <span class="text-gray-300 font-mono">{{ getRawValue(containerStyles.borderColor) || 'Transparent' }}</span>
               </button>
               </template>
            </CompositionColorPicker>
         </div>
      </div>
    </div>

    <!-- Section: Typographie -->
    <div v-if="hasTypography" class="space-y-3">
      <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">Typographie</h4>
      <div class="space-y-2">
        <Label class="text-[11px] text-gray-400">Couleur du texte</Label>
        <CompositionColorPicker 
          :is-open="activePicker === 'text'"
          :initial-color="'#' + getHexValue(styles.textColor)"
          @close="activePicker = null"
          @color-change="(hex) => updateStyle('textColor', hex)"
        >
          <template #trigger>
            <button @click="activePicker = 'text'" class="w-full h-8 px-2 flex items-center gap-2 bg-black/20 border border-border/50 rounded text-xs hover:bg-white/5 transition-colors">
              <div class="w-4 h-4 rounded-sm border border-white/20" :style="{ backgroundColor: '#' + getHexValue(styles.textColor) }"></div>
              <span class="text-gray-300 font-mono">{{ getRawValue(styles.textColor) || 'Inherit' }}</span>
            </button>
          </template>
        </CompositionColorPicker>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Taille (px)</Label>
          <Input :model-value="getRawValue(styles.fontSize)" @update:model-value="(val) => updateStyle('fontSize', val)" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Poids</Label>
          <Select :model-value="(getRawValue(styles.fontWeight) as string)" @update:model-value="(val) => updateStyle('fontWeight', val as string)">
            <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
              <SelectValue placeholder="Poids" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in fontWeightOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div v-if="element.family !== 'input'" class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">Alignement</Label>
        <Select :model-value="(getRawValue(styles.textAlign) as string)" @update:model-value="(val) => updateStyle('textAlign', val as string)">
          <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
            <SelectValue placeholder="Align" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Gauche</SelectItem>
            <SelectItem value="center">Centre</SelectItem>
            <SelectItem value="right">Droite</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Section: Apparence -->
    <div class="space-y-3">
      <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">Apparence</h4>
      <div class="space-y-2">
        <Label class="text-[11px] text-gray-400">Fond</Label>
        <CompositionColorPicker 
          :is-open="activePicker === 'bg'"
          :initial-color="'#' + getHexValue(styles.bg)"
          @close="activePicker = null"
          @color-change="(hex) => updateStyle('bg', hex)"
        >
          <template #trigger>
            <button @click="activePicker = 'bg'" class="w-full h-8 px-2 flex items-center gap-2 bg-black/20 border border-border/50 rounded text-xs hover:bg-white/5 transition-colors">
              <div class="w-4 h-4 rounded-sm border border-white/20" :style="{ backgroundColor: '#' + getHexValue(styles.bg) }"></div>
              <span class="text-gray-300 font-mono">{{ getRawValue(styles.bg) || 'Transparent' }}</span>
            </button>
          </template>
        </CompositionColorPicker>
      </div>
      
      <!-- Arrondis -->
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <Label class="text-[11px] text-gray-400">Arrondis</Label>
          <button @click="showIndividualCorners = !showIndividualCorners" class="text-[10px] text-primary hover:text-white transition-colors">
            {{ showIndividualCorners ? 'Global' : 'Individuel' }}
          </button>
        </div>

        <div v-if="!showIndividualCorners">
          <Select :model-value="(getRawValue(styles.rounded) as string)" @update:model-value="(val) => updateStyle('rounded', val as string)">
            <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
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
            <Label class="text-[9px] text-gray-500">{{ corner.label }}</Label>
            <Input :model-value="getRawValue(styles[corner.key])" @update:model-value="(val) => updateStyle(corner.key, val)" class="h-7 text-[10px] bg-black/20 border-border/50 px-2" placeholder="0" />
          </div>
        </div>
      </div>

      <!-- Ombre -->
      <div class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">Ombre</Label>
        <Select :model-value="(getRawValue(styles.shadow) as string)" @update:model-value="(val) => updateStyle('shadow', val as string)">
          <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
            <SelectValue placeholder="Ombre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="opt in shadowOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">Opacité ({{ Math.round((Number(getRawValue(styles.opacity)) || 1) * 100) }}%)</Label>
        <input type="range" min="0" max="1" step="0.05" :value="getRawValue(styles.opacity) || 1" @input="(e) => updateStyle('opacity', parseFloat((e.target as HTMLInputElement).value))" class="w-full h-1.5 bg-border appearance-none cursor-pointer accent-primary rounded-lg" />
      </div>
    </div>

    <!-- Section: Interactif -->
    <div v-if="element.family === 'interactive'" class="space-y-3">
      <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">Interactif</h4>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Variante</Label>
          <Input :model-value="getRawValue(interactiveStyles.variant)" @update:model-value="(val) => updateStyle('variant', val)" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Taille</Label>
          <Input :model-value="getRawValue(interactiveStyles.size)" @update:model-value="(val) => updateStyle('size', val)" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 12px;
  width: 12px;
  border-radius: 50%;
  background: var(--primary);
  cursor: pointer;
}
</style>
