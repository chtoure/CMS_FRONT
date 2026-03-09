<script lang="ts" setup>
import { inject } from 'vue';
import type { AnyComponentInstance, CliquableAction } from '../../type/component';
import Label from '../../components/ui/label/Label.vue';
import Input from '../../components/ui/input/Input.vue';
import Select from '../../components/ui/select/Select.vue';
import SelectTrigger from '../../components/ui/select/SelectTrigger.vue';
import SelectValue from '../../components/ui/select/SelectValue.vue';
import SelectContent from '../../components/ui/select/SelectContent.vue';
import SelectItem from '../../components/ui/select/SelectItem.vue';
import { Checkbox } from '../../components/ui/checkbox';

const props = defineProps<{
  element: AnyComponentInstance;
}>();

const builderState = inject<{
  pageTree: { value: AnyComponentInstance[] };
  libraryTree: { value: AnyComponentInstance[] };
  selectedId: { value: string | null };
  builderMode: { value: 'page' | 'library' };
  selectComponent: (id: string | null) => void;
}>('builderState');

const updateData = (key: string, value: string | number | boolean | object) => {
  if (!builderState) return;
  
  const newData = { ...props.element.data, [key]: value };
  
  const updateNode = (nodes: AnyComponentInstance[]): AnyComponentInstance[] => {
    return nodes.map((node: AnyComponentInstance): AnyComponentInstance => {
      if (node.id === props.element.id) {
        return { ...node, data: newData };
      }
      if (node.children) {
        return { ...node, children: updateNode(node.children) };
      }
      return node;
    });
  };

  if (builderState.builderMode.value === 'page') {
    builderState.pageTree.value = updateNode(builderState.pageTree.value);
  } else {
    builderState.libraryTree.value = updateNode(builderState.libraryTree.value);
  }
};

// Options
const tagOptions = [
  { label: 'Paragraphe (p)', value: 'p' },
  { label: 'Titre 1 (h1)', value: 'h1' },
  { label: 'Titre 2 (h2)', value: 'h2' },
  { label: 'Titre 3 (h3)', value: 'h3' },
  { label: 'Span', value: 'span' },
  { label: 'Div', value: 'div' },
];

const objectFitOptions = [
  { label: 'Cover', value: 'cover' },
  { label: 'Contain', value: 'contain' },
  { label: 'Fill', value: 'fill' },
  { label: 'Scale Down', value: 'scale-down' },
  { label: 'None', value: 'none' },
];

const inputTypeOptions = [
  { label: 'Texte', value: 'text' },
  { label: 'Email', value: 'email' },
  { label: 'Mot de passe', value: 'password' },
  { label: 'Nombre', value: 'number' },
  { label: 'Téléphone', value: 'tel' },
  { label: 'URL', value: 'url' },
];
</script>

<template>
  <div class="space-y-6 pb-20 p-1">
    
    <!-- Section: Contenu Commun -->
    <div v-if="'content' in element.data" class="space-y-3">
      <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">Contenu</h4>
      <div class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">Texte affiché</Label>
        <Input 
          :model-value="(element.data.content as string)" 
          @update:model-value="(val) => updateData('content', val)"
          class="h-20 text-xs px-2 py-1 align-top bg-black/20 border-border/50"
        />
      </div>
      <div v-if="element.tag === 'TextBuilder'" class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">Balise HTML</Label>
        <Select :model-value="(element.data.tag as string)" @update:model-value="(val) => val && updateData('tag', val as string)">
          <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="opt in tagOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Section: Image -->
    <div v-if="element.tag === 'ImageBuilder'" class="space-y-3">
      <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">Paramètres Image</h4>
      <div class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">URL Source (src)</Label>
        <Input :model-value="(element.data.src as string)" @update:model-value="(val) => updateData('src', val)" class="h-8 text-xs bg-black/20 border-border/50" />
      </div>
      <div class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">Texte alternatif (alt)</Label>
        <Input :model-value="(element.data.alt as string)" @update:model-value="(val) => updateData('alt', val)" class="h-8 text-xs bg-black/20 border-border/50" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Largeur</Label>
          <Input :model-value="(element.data.width as string | number)" @update:model-value="(val) => updateData('width', val)" class="h-8 text-xs bg-black/20 border-border/50" placeholder="ex: 100% ou 300" />
        </div>
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Hauteur</Label>
          <Input :model-value="(element.data.height as string | number)" @update:model-value="(val) => updateData('height', val)" class="h-8 text-xs bg-black/20 border-border/50" placeholder="ex: auto ou 300" />
        </div>
      </div>
      <div class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">Ajustement (Object Fit)</Label>
        <Select :model-value="(element.data.objectFit as string)" @update:model-value="(val) => val && updateData('objectFit', val as string)">
          <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
            <SelectValue placeholder="Fit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="opt in objectFitOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Section: Icône -->
    <div v-if="element.tag === 'IconBuilder'" class="space-y-3">
      <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">Paramètres Icône</h4>
      <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Nom Lucide (ex: Star)</Label>
          <Input :model-value="(element.data.icon as string)" @update:model-value="(val) => updateData('icon', val)" class="h-8 text-xs bg-black/20 border-border/50" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Taille (px)</Label>
          <Input type="number" :model-value="(element.data.size as number)" @update:model-value="(val) => updateData('size', parseInt(val.toString()))" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Épaisseur trait</Label>
          <Input type="number" :model-value="(element.data.strokeWidth as number)" @update:model-value="(val) => updateData('strokeWidth', parseInt(val.toString()))" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
      </div>
    </div>

    <!-- Section: Formulaire (Saisie) -->
    <div v-if="element.family === 'input'" class="space-y-3">
      <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">Paramètres Champ</h4>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Label</Label>
          <Input :model-value="(element.data.label as string)" @update:model-value="(val) => updateData('label', val)" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Placeholder</Label>
          <Input :model-value="(element.data.placeholder as string)" @update:model-value="(val) => updateData('placeholder', val)" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Type de saisie</Label>
          <Select :model-value="(element.data.type as string)" @update:model-value="(val) => val && updateData('type', val as string)">
            <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in inputTypeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Nom technique (name)</Label>
          <Input :model-value="(element.data.name as string)" @update:model-value="(val) => updateData('name', val)" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
      </div>
      <div class="flex items-center space-x-2 pt-1">
        <Checkbox id="required" :checked="(element.data.required as boolean)" @update:checked="(val: boolean | 'indeterminate') => updateData('required', !!val)" />
        <label for="required" class="text-[11px] text-gray-300 cursor-pointer">Requis pour soumission</label>
      </div>
    </div>

    <!-- Section: Actions (Boutons etc.) -->
    <div v-if="element.family === 'interactive'" class="space-y-3">
       <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">Actions & Liens</h4>
       <div v-if="element.data.cliquable && typeof element.data.cliquable === 'object'" class="space-y-4">
         <div class="space-y-1.5">
            <Label class="text-[11px] text-gray-400">Action au clic</Label>
            <Select :model-value="((element.data.cliquable as CliquableAction).action)" @update:model-value="(val) => val && updateData('cliquable', { ...(element.data.cliquable as object), action: val as CliquableAction['action'] })">
              <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NAVIGATE_TO">Naviguer vers URL</SelectItem>
                <SelectItem value="SHOW_ALERT">Afficher Alerte</SelectItem>
                <SelectItem value="OPEN_MODAL">Ouvrir Modal</SelectItem>
                <SelectItem value="TOGGLE_VISIBILITY">Toggle Visibilité</SelectItem>
              </SelectContent>
            </Select>
         </div>
         <div v-if="(element.data.cliquable as CliquableAction).action === 'NAVIGATE_TO'" class="space-y-1.5">
            <Label class="text-[11px] text-gray-400">URL de destination</Label>
            <Input :model-value="((element.data.cliquable as Extract<CliquableAction, { action: 'NAVIGATE_TO' }>).action_params?.url)" @update:model-value="(val) => updateData('cliquable', { ...(element.data.cliquable as object), action_params: { url: val } })" class="h-8 text-xs bg-black/20 border-border/50" />
         </div>
          <div v-if="(element.data.cliquable as CliquableAction).action === 'SHOW_ALERT'" class="space-y-1.5">
            <Label class="text-[11px] text-gray-400">Message d'alerte</Label>
            <Input :model-value="((element.data.cliquable as Extract<CliquableAction, { action: 'SHOW_ALERT' }>).action_params?.message)" @update:model-value="(val) => updateData('cliquable', { ...(element.data.cliquable as object), action_params: { message: val } })" class="h-8 text-xs bg-black/20 border-border/50" />
         </div>
         <div v-if="(element.data.cliquable as CliquableAction).action === 'TOGGLE_VISIBILITY'" class="space-y-1.5">
            <Label class="text-[11px] text-gray-400">ID de la cible (Auto-toggle)</Label>
            <Input :model-value="((element.data.cliquable as Extract<CliquableAction, { action: 'TOGGLE_VISIBILITY' }>).action_params?.targetId)" @update:model-value="(val) => updateData('cliquable', { ...(element.data.cliquable as object), action_params: { targetId: val } })" class="h-8 text-xs bg-black/20 border-border/50" placeholder="ex: Card-12345" />
            <p class="text-[9px] text-gray-500 italic">L'ID se trouve en haut du composant quand il est sélectionné.</p>
         </div>
       </div>
    </div>

    <!-- Section: Slider -->
    <div v-if="element.tag === 'SliderBuilder'" class="space-y-4">
      <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">Paramètres Slider</h4>
      
      <div class="grid grid-cols-2 gap-4">
        <div class="flex items-center space-x-2">
          <Checkbox id="autoPlay" :checked="(element.data.autoPlay as boolean)" @update:checked="(val: boolean | 'indeterminate') => updateData('autoPlay', !!val)" />
          <Label for="autoPlay" class="text-[11px] text-gray-300">Auto-play</Label>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox id="loop" :checked="(element.data.loop as boolean)" @update:checked="(val: boolean | 'indeterminate') => updateData('loop', !!val)" />
          <Label for="loop" class="text-[11px] text-gray-300">Boucle</Label>
        </div>
      </div>

      <div class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">Vitesse (ms)</Label>
        <Input 
          type="number" 
          :model-value="(element.data.speed as number)" 
          @update:model-value="(val: string | number) => updateData('speed', parseInt(val.toString()))"
          class="h-8 text-xs bg-black/20 border-border/50"
        />
      </div>

      <div class="grid grid-cols-2 gap-4 pt-1">
        <div class="flex items-center space-x-2">
          <Checkbox id="showPagination" :checked="(element.data.showPagination as boolean)" @update:checked="(val: boolean | 'indeterminate') => updateData('showPagination', !!val)" />
          <Label for="showPagination" class="text-[11px] text-gray-300">Pagination</Label>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox id="showArrows" :checked="(element.data.showArrows as boolean)" @update:checked="(val: boolean | 'indeterminate') => updateData('showArrows', !!val)" />
          <Label for="showArrows" class="text-[11px] text-gray-300">Flèches</Label>
        </div>
      </div>
    </div>

    <!-- Section: Accordion / FAQ -->
    <div v-if="element.tag === 'AccordionBuilder'" class="space-y-4">
      <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">Paramètres Accordéon</h4>
      
      <div class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">Question / Titre</Label>
        <Input 
          :model-value="(element.data.title as string)" 
          @update:model-value="(val: string | number) => updateData('title', val.toString())"
          class="h-8 text-xs bg-black/20 border-border/50"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="flex items-center space-x-2">
          <Checkbox id="isOpen" :checked="(element.data.isOpen as boolean)" @update:checked="(val: boolean | 'indeterminate') => updateData('isOpen', !!val)" />
          <Label for="isOpen" class="text-[11px] text-gray-300">Ouvert par défaut</Label>
        </div>
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Vitesse Anim (ms)</Label>
          <Input 
            type="number" 
            :model-value="(element.data.transitionSpeed as number)" 
            @update:model-value="(val: string | number) => updateData('transitionSpeed', parseInt(val.toString()))"
            class="h-8 text-xs bg-black/20 border-border/50"
          />
        </div>
      </div>
    </div>

    <!-- Section: Lien -->
    <div v-if="element.tag === 'LinkBuilder'" class="space-y-4">
      <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">Paramètres Lien</h4>
      <div class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">Texte du lien</Label>
        <Input 
          :model-value="(element.data.text as string)" 
          @update:model-value="(val) => updateData('text', val)"
          class="h-8 text-xs bg-black/20 border-border/50"
        />
      </div>
      <div class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">URL de destination</Label>
        <Input 
          :model-value="(element.data.url as string)" 
          @update:model-value="(val) => updateData('url', val)"
          class="h-8 text-xs bg-black/20 border-border/50"
          placeholder="https://..."
        />
      </div>
      <div class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">Cible (Target)</Label>
        <Select :model-value="(element.data.target as string)" @update:model-value="(val) => val && updateData('target', val as string)">
          <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
            <SelectValue placeholder="Cible" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_self">Même fenêtre (_self)</SelectItem>
            <SelectItem value="_blank">Nouvelle fenêtre (_blank)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

  </div>
</template>
