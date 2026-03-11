<script lang="ts" setup>
import { inject } from 'vue';
import type { AnyComponentInstance, CliquableAction } from '../../type/component';
import type { AnySectionInstance } from '../../type/section';
import Label from '../../components/ui/label/Label.vue';
import Input from '../../components/ui/input/Input.vue';
import Select from '../../components/ui/select/Select.vue';
import SelectTrigger from '../../components/ui/select/SelectTrigger.vue';
import SelectValue from '../../components/ui/select/SelectValue.vue';
import SelectContent from '../../components/ui/select/SelectContent.vue';
import SelectItem from '../../components/ui/select/SelectItem.vue';
import { computed } from 'vue';
import BaseSwitch from '../base/BaseSwitch.vue';

const easeOptions = [
  { label: 'Ease', value: 'ease-in-out' },
  { label: 'Linear', value: 'linear' },
  { label: 'In', value: 'ease-in' },
  { label: 'Out', value: 'ease-out' },
];

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

const updateData = (key: string, value: any) => {
  if (!builderState) return;
  
  const currentVal = props.element.data[key];
  let finalValue = value;

  // Si la donnée actuelle est un objet avec 'type' et 'value', on préserve cette structure
  if (currentVal && typeof currentVal === 'object' && 'type' in currentVal && 'value' in currentVal) {
    finalValue = { ...currentVal, value };
  } else {
    // Sinon on force la structure réactive par défaut
    finalValue = { type: 'static', value };
  }
  
  const newData = { ...props.element.data, [key]: finalValue };
  
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

const getDataValue = (val: any): any => {
  if (val && typeof val === 'object' && 'value' in val) {
    return val.value;
  }
  return val;
};

// Extraire tous les composants avec leurs noms et IDs (backend en priorité)
const allComponents = computed(() => {
  const tree = builderState?.pageTree.value || [];
  const list: { label: string; value: string }[] = [];

  const traverse = (nodes: (AnyComponentInstance | AnySectionInstance)[]) => {
    nodes.forEach(node => {
      if ('tag' in node) {
        const id = (node as AnyComponentInstance).blocTemplateId?.toString() || node.id;
        list.push({
          label: `${node.name} (${id})`,
          value: id
        });
      }
      if (node.children) traverse(node.children as (AnyComponentInstance | AnySectionInstance)[]);
    });
  };

  traverse(tree);
  return list;
});

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
          :model-value="getDataValue(element.data.content)" 
          @update:model-value="(val) => updateData('content', val)"
          class="h-20 text-xs px-2 py-1 align-top bg-black/20 border-border/50"
        />
      </div>
      <div v-if="element.tag === 'TextBuilder'" class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">Balise HTML</Label>
        <Select :model-value="getDataValue(element.data.tag)" @update:model-value="(val) => val && updateData('tag', val as string)">
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
        <Input :model-value="getDataValue(element.data.src)" @update:model-value="(val) => updateData('src', val)" class="h-8 text-xs bg-black/20 border-border/50" />
      </div>
      <div class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">Texte alternatif (alt)</Label>
        <Input :model-value="getDataValue(element.data.alt)" @update:model-value="(val) => updateData('alt', val)" class="h-8 text-xs bg-black/20 border-border/50" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Largeur</Label>
          <Input :model-value="getDataValue(element.data.width)" @update:model-value="(val) => updateData('width', val)" class="h-8 text-xs bg-black/20 border-border/50" placeholder="ex: 100% ou 300" />
        </div>
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Hauteur</Label>
          <Input :model-value="getDataValue(element.data.height)" @update:model-value="(val) => updateData('height', val)" class="h-8 text-xs bg-black/20 border-border/50" placeholder="ex: auto ou 300" />
        </div>
      </div>
      <div class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">Ajustement (Object Fit)</Label>
        <Select :model-value="getDataValue(element.data.objectFit)" @update:model-value="(val) => val && updateData('objectFit', val as string)">
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
          <Input :model-value="getDataValue(element.data.icon)" @update:model-value="(val) => updateData('icon', val)" class="h-8 text-xs bg-black/20 border-border/50" />
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Taille (px)</Label>
          <Input type="number" :model-value="getDataValue(element.data.size) || ''" @update:model-value="(val) => updateData('size', parseInt(val.toString()) || 0)" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Épaisseur trait</Label>
          <Input type="number" :model-value="getDataValue(element.data.strokeWidth) || ''" @update:model-value="(val) => updateData('strokeWidth', parseInt(val.toString()) || 0)" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
      </div>
    </div>

    <!-- Section: Formulaire (Saisie) -->
    <div v-if="element.family === 'input'" class="space-y-3">
      <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">Paramètres Champ</h4>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Label</Label>
          <Input :model-value="getDataValue(element.data.label)" @update:model-value="(val) => updateData('label', val)" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Placeholder</Label>
          <Input :model-value="getDataValue(element.data.placeholder)" @update:model-value="(val) => updateData('placeholder', val)" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Type de saisie</Label>
          <Select :model-value="getDataValue(element.data.type)" @update:model-value="(val) => val && updateData('type', val as string)">
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
          <Input :model-value="getDataValue(element.data.name)" @update:model-value="(val) => updateData('name', val)" class="h-8 text-xs bg-black/20 border-border/50" />
        </div>
      </div>
      <div class="flex items-center justify-between pt-1">
        <label for="required" class="text-[11px] text-gray-300 cursor-pointer">Requis pour soumission</label>
        <BaseSwitch id="required" :model-value="!!getDataValue(element.data.required)" @update:model-value="(val) => updateData('required', val)" />
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
            <Label class="text-[11px] text-gray-400">Cible (Composant à basculer)</Label>
            <Select 
              :model-value="((element.data.cliquable as Extract<CliquableAction, { action: 'TOGGLE_VISIBILITY' }>).action_params?.targetId)" 
              @update:model-value="(val) => val && updateData('cliquable', { ...(element.data.cliquable as object), action_params: { targetId: val } })"
            >
              <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
                <SelectValue placeholder="Choisir un composant..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="comp in allComponents" :key="comp.value" :value="comp.value">
                  {{ comp.label }}
                </SelectItem>
                <SelectItem v-if="allComponents.length === 0" disabled value="none">
                  Aucun composant trouvé
                </SelectItem>
              </SelectContent>
            </Select>
            <p class="text-[9px] text-gray-500 italic">Sélectionnez le composant qui doit apparaître ou disparaître au clic.</p>
         </div>
       </div>
    </div>

    <!-- Section: Slider -->
    <div v-if="element.tag === 'SliderBuilder'" class="space-y-4">
      <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">Paramètres Slider</h4>
      
      <div class="grid grid-cols-1 gap-4">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Duration (ms)</Label>
          <Input 
            type="number" 
            :model-value="getDataValue(element.data.transitionDuration)" 
            @update:model-value="(val) => updateData('transitionDuration', parseInt(val.toString()) || 500)"
            placeholder="500"
            class="h-8 text-xs bg-black/20 border-border/50"
          />
        </div>
      </div>

      <div class="space-y-1.5 pt-1">
        <Label class="text-[11px] text-gray-400">Animation Ease</Label>
        <Select :model-value="getDataValue(element.data.transitionEase) || 'ease-in-out'" @update:model-value="(val) => val && updateData('transitionEase', val as string)">
          <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
            <SelectValue placeholder="Ease" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="opt in easeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
        <div class="flex items-center justify-between col-span-1">
          <Label for="autoPlay" class="text-[11px] text-gray-300">Auto-play</Label>
          <BaseSwitch id="autoPlay" :model-value="!!getDataValue(element.data.autoPlay)" @update:model-value="(val) => updateData('autoPlay', val)" />
        </div>
        <div class="flex items-center justify-between col-span-1">
          <Label for="loop" class="text-[11px] text-gray-300">Boucle</Label>
          <BaseSwitch id="loop" :model-value="!!getDataValue(element.data.loop)" @update:model-value="(val) => updateData('loop', val)" />
        </div>
      </div>

      <div class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">Vitesse (ms)</Label>
        <Input 
          type="number" 
          :model-value="getDataValue(element.data.speed)" 
          @update:model-value="(val: string | number) => updateData('speed', parseInt(val.toString()))"
          class="h-8 text-xs bg-black/20 border-border/50"
        />
      </div>

      <div class="grid grid-cols-2 gap-4 pt-1">
        <div class="flex items-center justify-between col-span-1">
          <Label for="showPagination" class="text-[11px] text-gray-300">Pagination</Label>
          <BaseSwitch id="showPagination" :model-value="getDataValue(element.data.showPagination) !== false" @update:model-value="(val) => updateData('showPagination', val)" />
        </div>
        <div class="flex items-center justify-between col-span-1">
          <Label for="showArrows" class="text-[11px] text-gray-300">Flèches</Label>
          <BaseSwitch id="showArrows" :model-value="getDataValue(element.data.showArrows) !== false" @update:model-value="(val) => updateData('showArrows', val)" />
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

      <div class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">Réponse / Contenu</Label>
        <textarea
          :value="getDataValue(element.data.content) || ''"
          @input="(e: Event) => updateData('content', (e.target as HTMLTextAreaElement).value)"
          rows="4"
          class="w-full text-xs px-2 py-1.5 bg-black/20 border border-border/50 rounded text-white/80 placeholder-white/30 resize-none focus:outline-none focus:border-primary/50 leading-relaxed"
          placeholder="Entrez la réponse ici..."
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
      <div class="flex items-center justify-between pt-1">
        <Label for="isOpen" class="text-[11px] text-gray-300">Ouvert par défaut</Label>
        <BaseSwitch id="isOpen" :model-value="!!getDataValue(element.data.isOpen)" @update:model-value="(val) => updateData('isOpen', val)" />
      </div>
        <div class="space-y-1.5">
          <Label class="text-[11px] text-gray-400">Vitesse Anim (ms)</Label>
          <Input 
            type="number" 
            :model-value="getDataValue(element.data.transitionSpeed)" 
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
          :model-value="getDataValue(element.data.text)" 
          class="h-8 text-xs bg-black/20 border-border/50"
        />
      </div>
      <div class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">URL de destination</Label>
        <Input 
          :model-value="getDataValue(element.data.url)" 
          class="h-8 text-xs bg-black/20 border-border/50"
          placeholder="https://..."
        />
      </div>
      <div class="space-y-1.5">
        <Label class="text-[11px] text-gray-400">Cible (Target)</Label>
        <Select :model-value="getDataValue(element.data.target)" @update:model-value="(val) => val && updateData('target', val as string)">
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
