<script lang="ts" setup>
import { inject, computed, ref } from 'vue';
import type { AnyComponentInstance, AllStyles, StaticStyles, ContainerStyles, InteractiveStyles } from '../../type/component';
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
const activePicker = ref<'bg' | 'text' | null>(null);

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
  
  // Si c'est déjà un format JIT [#FFFFFF] ou bg-[#FFFFFF]
  const jitMatch = raw.match(/\[#([0-9A-Fa-f]{6})\]/);
  if (jitMatch && jitMatch[1]) return jitMatch[1];

  // Si c'est déjà un hex brut (6 caractères hexadécimaux)
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

// Casts pour accès aux styles spécifiques
const staticStyles = computed(() => props.element.styles as StaticStyles);
const containerStyles = computed(() => props.element.styles as ContainerStyles);
const interactiveStyles = computed(() => props.element.styles as InteractiveStyles);

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
</script>

<template>
  <div class="space-y-6 pb-20 p-1">
    
    <!-- Section: Mise en page (Layout) -->
    <div class="space-y-3">
      <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">Mise en page</h4>
      
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Display</Label>
          <Select :model-value="(getRawValue(element.styles.display) as string)" @update:model-value="(val) => val && updateStyle('display', val as string)">
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
          <Input type="number" :model-value="getRawValue(element.styles.padding)" @update:model-value="(val) => updateStyle('padding', parseInt(val.toString()))" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
      </div>

      <div class="grid grid-cols-4 gap-2">
        <div class="space-y-1.5 col-span-2">
          <Label class="text-[11px] text-gray-400">Marge Haut</Label>
          <Input type="number" :model-value="getRawValue(element.styles.marginTop)" @update:model-value="(val) => updateStyle('marginTop', parseInt(val.toString()))" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
        <div class="space-y-1.5 col-span-2">
          <Label class="text-[11px] text-gray-400">Marge Bas</Label>
          <Input type="number" :model-value="getRawValue(element.styles.marginBottom)" @update:model-value="(val) => updateStyle('marginBottom', parseInt(val.toString()))" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
      </div>
    </div>

    <!-- Section: Conteneur (Spécifique Container) -->
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
            <SelectItem value="vertical">Vertical (Stack)</SelectItem>
            <SelectItem value="horizontal">Horizontal (Row)</SelectItem>
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
    </div>

    <!-- Section: Typographie (Spécifique Static) -->
    <div v-if="element.family === 'static'" class="space-y-3">
      <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">Typographie</h4>
      
      <div class="space-y-2">
        <Label class="text-[11px] text-gray-400">Couleur du texte</Label>
        <CompositionColorPicker 
          :is-open="activePicker === 'text'"
          :initial-color="'#' + getHexValue(staticStyles.textColor)"
          @close="activePicker = null"
          @color-change="(hex) => updateStyle('textColor', hex)"
        >
          <template #trigger>
            <button @click="activePicker = 'text'" class="w-full h-8 px-2 flex items-center gap-2 bg-black/20 border border-border/50 rounded text-xs hover:bg-white/5">
              <div class="w-4 h-4 rounded-sm border border-white/20" :style="{ backgroundColor: '#' + getHexValue(staticStyles.textColor) }"></div>
              <span class="text-gray-300 font-mono">{{ getRawValue(staticStyles.textColor) || 'Inherit' }}</span>
            </button>
          </template>
        </CompositionColorPicker>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Taille</Label>
          <Input :model-value="getRawValue(staticStyles.fontSize)" @update:model-value="(val) => updateStyle('fontSize', val)" class="h-8 text-xs bg-black/20 border-border/50" placeholder="ex: lg" />
        </div>
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Épaisseur</Label>
          <Select :model-value="(getRawValue(staticStyles.fontWeight) as string)" @update:model-value="(val) => updateStyle('fontWeight', val as string)">
            <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
              <SelectValue placeholder="Poids" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in fontWeightOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">Alignement</Label>
        <Select :model-value="(getRawValue(staticStyles.textAlign) as string)" @update:model-value="(val) => updateStyle('textAlign', val as string)">
          <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
            <SelectValue placeholder="Alignement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Gauche</SelectItem>
            <SelectItem value="center">Centre</SelectItem>
            <SelectItem value="right">Droite</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Section: Apparence (Appearance) -->
    <div class="space-y-3">
      <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">Apparence</h4>
      
      <div class="space-y-2">
        <Label class="text-[11px] text-gray-400">Couleur de fond</Label>
        <CompositionColorPicker 
          :is-open="activePicker === 'bg'"
          :initial-color="'#' + getHexValue(element.styles.bg)"
          @close="activePicker = null"
          @color-change="(hex) => updateStyle('bg', hex)"
        >
          <template #trigger>
            <button @click="activePicker = 'bg'" class="w-full h-8 px-2 flex items-center gap-2 bg-black/20 border border-border/50 rounded text-xs hover:bg-white/5">
              <div class="w-4 h-4 rounded-sm border border-white/20" :style="{ backgroundColor: '#' + getHexValue(element.styles.bg) }"></div>
              <span class="text-gray-300 font-mono">{{ getRawValue(element.styles.bg) || 'Transparent' }}</span>
            </button>
          </template>
        </CompositionColorPicker>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Arrondis</Label>
          <Select :model-value="(getRawValue(element.styles.rounded) as string)" @update:model-value="(val) => updateStyle('rounded', val as string)">
            <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
              <SelectValue placeholder="Arrondis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in roundedOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Ombre</Label>
          <Select :model-value="(getRawValue(element.styles.shadow) as string)" @update:model-value="(val) => updateStyle('shadow', val as string)">
            <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
              <SelectValue placeholder="Ombre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in shadowOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">Opacité ({{ Math.round((Number(getRawValue(element.styles.opacity)) || 1) * 100) }}%)</Label>
        <input type="range" min="0" max="1" step="0.05" :value="getRawValue(element.styles.opacity) || 1" @input="(e) => updateStyle('opacity', parseFloat((e.target as HTMLInputElement).value))" class="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary" />
      </div>
    </div>

    <!-- Section: Interactif (Spécifique Interactive) -->
    <div v-if="element.family === 'interactive'" class="space-y-3">
      <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">Réglages Interactifs</h4>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Variante</Label>
          <Input :model-value="getRawValue(interactiveStyles.variant)" @update:model-value="(val) => updateStyle('variant', val)" class="h-8 text-xs bg-black/20 border-border/50" placeholder="ex: outline" />
        </div>
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Taille</Label>
          <Input :model-value="getRawValue(interactiveStyles.size)" @update:model-value="(val) => updateStyle('size', val)" class="h-8 text-xs bg-black/20 border-border/50" placeholder="ex: sm, lg" />
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
