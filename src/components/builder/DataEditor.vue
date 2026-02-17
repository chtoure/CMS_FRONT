<script lang="ts" setup>
import { ref, inject, computed, watch } from 'vue';
import type { AnyComponentInstance, CliquableAction } from '../../type/component';
import { ValueSource, type IComponentParams, type IPropsSchemaField } from '../../type/params';
import Label from '../../components/ui/label/Label.vue';
import Input from '../../components/ui/input/Input.vue';
import Select from '../../components/ui/select/Select.vue';
import SelectTrigger from '../../components/ui/select/SelectTrigger.vue';
import SelectValue from '../../components/ui/select/SelectValue.vue';
import SelectContent from '../../components/ui/select/SelectContent.vue';
import SelectItem from '../../components/ui/select/SelectItem.vue';
import { Checkbox } from '../../components/ui/checkbox';
import { Button } from '../../components/ui/button';
import { Plus, Trash2, ChevronDown, Type, Image as ImageIcon, Database } from 'lucide-vue-next';

const props = defineProps<{
  element: AnyComponentInstance;
}>();

const builderState = inject<{
  pageTree: { value: AnyComponentInstance[] };
  selectedId: { value: string | null };
  selectComponent: (id: string | null) => void;
}>('builderState');

// Mapping des sources autorisées par composant
const COMPONENT_SOURCE_MAPPING: Record<string, ValueSource[]> = {
  'TextBuilder': [ValueSource.STATIC],
  'ButtonBuilder': [ValueSource.STATIC],
  'InputBuilder': [ValueSource.STATIC],
  'ImageBuilder': [ValueSource.STATIC, ValueSource.IMAGE],
  'IconBuilder': [ValueSource.STATIC, ValueSource.IMAGE],
  'CardBuilder': [ValueSource.STATIC, ValueSource.IMAGE, ValueSource.CONTENUS],
};

// État pour les paramètres
const expandedParam = ref<string | null>(null);
const showAddForm = ref(false);

// Réinitialisation lors du changement de composant
watch(() => props.element.id, () => {
  showAddForm.value = false;
  expandedParam.value = null;
  console.log(props.element);
});

// Options de base
const sourceOptions = [
  { label: 'Statique', value: ValueSource.STATIC, icon: Type },
  { label: 'Image', value: ValueSource.IMAGE, icon: ImageIcon },
  { label: 'Contenus', value: ValueSource.CONTENUS, icon: Database },
];

// Propriétés calculées pour la dynamisation
const allowedSources = computed(() => COMPONENT_SOURCE_MAPPING[props.element.tag] || []);
const canAddParams = computed(() => allowedSources.value.length > 0);

const filteredSourceOptions = computed(() => {
  return sourceOptions.filter(opt => allowedSources.value.includes(opt.value as ValueSource));
});

const newParam = ref<Partial<IComponentParams>>({
  label: '',
  name: '',
  type: { source: ValueSource.STATIC, value: '' } as IPropsSchemaField,
  required: false
});

// Génération de nom unique
const generateUniqueName = (label: string): string => {
  const slug = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');

  const suffix = Math.random().toString(36).substring(2, 6);
  return `${slug || 'param'}_${suffix}`;
};

const toggleParam = (name: string) => {
  expandedParam.value = expandedParam.value === name ? null : name;
};

const addParameter = () => {
  if (!newParam.value.label || !builderState) return;

  const name = generateUniqueName(newParam.value.label);
  const param: IComponentParams = {
    name,
    label: newParam.value.label,
    type: newParam.value.type as IPropsSchemaField,
    required: !!newParam.value.required
  };

  const updateNode = (nodes: AnyComponentInstance[]): AnyComponentInstance[] => {
    return nodes.map((node) => {
      if (node.id === props.element.id) {
        return {
          ...node,
          params: [...node.params, param],
          data: { ...node.data, [name]: node.data[name] ?? (param.type.source === ValueSource.STATIC ? '' : null) }
        };
      }
      if (node.children) return { ...node, children: updateNode(node.children) };
      return node;
    });
  };

  builderState.pageTree.value = updateNode(builderState.pageTree.value);

  // Reset form
  newParam.value = { label: '', name: '', type: { source: ValueSource.STATIC, value: '' } as IPropsSchemaField, required: false };
  showAddForm.value = false;
  expandedParam.value = name;
};

const removeParameter = (name: string) => {
  if (!builderState) return;

  const updateNode = (nodes: AnyComponentInstance[]): AnyComponentInstance[] => {
    return nodes.map((node) => {
      if (node.id === props.element.id) {
        const newData = { ...node.data };
        delete newData[name];
        return {
          ...node,
          params: node.params.filter(p => p.name !== name),
          data: newData
        };
      }
      if (node.children) return { ...node, children: updateNode(node.children) };
      return node;
    });
  };

  builderState.pageTree.value = updateNode(builderState.pageTree.value);
  if (expandedParam.value === name) expandedParam.value = null;
};

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

  builderState.pageTree.value = updateNode(builderState.pageTree.value);
};

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

    <!-- Section: Gestion des Paramètres -->
    <div v-if="canAddParams" class="space-y-4">
      <div class="flex items-center justify-between border-b border-white/10 pb-2">
        <h4 class="text-xs text-primary font-black">Ajouter un paramètre</h4>
        <Button
          variant="ghost"
          size="icon"
          class="h-6 w-6 hover:bg-primary/20 hover:text-primary"
          @click="showAddForm = !showAddForm"
        >
          <Plus class="h-4 w-4" />
        </Button>
      </div>

      <!-- Formulaire d'ajout de paramètre -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div v-if="showAddForm" class="bg-black/20 border border-border/50 rounded-md p-3 space-y-3">
          <div class="space-y-1.5">
            <Label class="text-[11px] text-gray-400">Label du paramètre</Label>
            <Input
              v-model="newParam.label"
              placeholder="Ex: Titre, Couleur, etc."
              class="h-8 text-xs bg-black/40 border-border/30"
            />
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1.5">
              <Label class="text-[11px] text-gray-400">Type de source</Label>
              <Select v-model="(newParam.type as any).source">
                 <SelectTrigger class="h-8 text-xs bg-black/40 border-border/30">
                    <SelectValue placeholder="Source" />
                 </SelectTrigger>
                 <SelectContent>
                    <SelectItem v-for="opt in filteredSourceOptions" :key="opt.value" :value="opt.value">
                      <div class="flex items-center gap-2">
                        <component :is="opt.icon" class="h-3 w-3" />
                        <span>{{ opt.label }}</span>
                      </div>
                    </SelectItem>
                 </SelectContent>
              </Select>
            </div>
            <div class="flex items-end pb-1.5 px-1">
                <div class="flex items-center space-x-2">
                  <Checkbox id="new-required" :checked="newParam.required" @update:checked="(val) => newParam.required = !!val" />
                  <label for="new-required" class="text-[10px] text-gray-400 cursor-pointer">Requis</label>
                </div>
            </div>
          </div>
          <div class="flex gap-2 pt-1">
            <Button size="sm" class="flex-1 h-7 text-[10px]" @click="addParameter">Ajouter</Button>
            <Button size="sm" variant="ghost" class="flex-1 h-7 text-[10px]" @click="showAddForm = false">Annuler</Button>
          </div>
        </div>
      </transition>

      <!-- Liste des paramètres (Accordéon) -->
      <div v-if="element.params.length > 0" class="space-y-2">
        <div v-for="field in element.params" :key="field.name" class="border border-border/30 rounded-md overflow-hidden bg-black/5">
          <!-- Header Accordéon -->
          <div
            @click="toggleParam(field.name)"
            class="flex items-center justify-between p-2 cursor-pointer hover:bg-white/5 transition-colors"
            :class="{ 'bg-primary/10 border-b border-border/30': expandedParam === field.name }"
          >
            <div class="flex items-center gap-2">
              <Type v-if="field.type.source === 'static'" class="h-3.5 w-3.5 text-gray-500" />
              <ImageIcon v-else-if="field.type.source === 'image'" class="h-3.5 w-3.5 text-gray-500" />
              <Database v-else class="h-3.5 w-3.5 text-gray-500" />
              <span class="text-[11px] font-medium text-gray-300">{{ field.label }}</span>
            </div>
            <div class="flex items-center gap-2">
              <span v-if="field.required" class="text-[9px] px-1 bg-primary/20 text-primary rounded">Requis</span>
              <ChevronDown
                class="h-3.5 w-3.5 text-gray-500 transition-transform duration-200"
                :class="{ 'rotate-180': expandedParam === field.name }"
              />
            </div>
          </div>

          <!-- Content Accordéon -->
          <transition
            enter-active-class="transition-all duration-300 ease-in-out"
            leave-active-class="transition-all duration-200 ease-in-out"
            enter-from-class="max-h-0 opacity-0"
            enter-to-class="max-h-[500px] opacity-100"
            leave-from-class="max-h-[500px] opacity-100"
            leave-to-class="max-h-0 opacity-0"
          >
            <div v-if="expandedParam === field.name" class="p-3 space-y-4 bg-black/40">
              <!-- Édition du Label -->
              <div class="space-y-1.5">
                <div class="space-y-2">
                  <div class="space-y-1">
                    <Label class="text-[11px] text-gray-400">Label d'affichage</Label>
                    <Input
                      v-model="field.label"
                      class="h-8 text-xs bg-black/20 border-border/50"
                    />
                  </div>
                  <!-- <div class="space-y-1">
                    <Label class="text-[11px] text-gray-400">Nom technique (lecture seule)</Label>
                    <Input
                      :model-value="field.name"
                      disabled
                      class="h-8 text-xs bg-black/20 border-border/50 opacity-50 italic"
                    />
                  </div> -->
                </div>
              </div>

              <!-- Édition de la Valeur (Data) -->
              <div class="space-y-1 border-t border-white/5">
                <Label class="text-[10px] text-gray-400">{{ field.label }} (Valeur)</Label>
                <div v-if="field.type.source === 'static'" class="space-y-1.5">
                  <Input
                    :model-value="(element.data[field.name] as string)"
                    @update:model-value="(val) => updateData(field.name, val)"
                    class="h-8 text-xs px-2 bg-black/20 border-border/50"
                    placeholder="Saisir la valeur..."
                  />
                </div>
                <div v-else-if="field.type.source === 'image'" class="space-y-1.5">
                   <Input
                    :model-value="(element.data[field.name] as string)"
                    @update:model-value="(val) => updateData(field.name, val)"
                    class="h-8 text-xs px-2 bg-black/20 border-border/50"
                    placeholder="URL de l'image..."
                  />
                </div>
                <!-- On pourra ajouter d'autres types ici -->
              </div>

              <!-- Footer de l'accordéon -->
              <div class="flex justify-end pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  class="h-7 text-[10px] text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  @click="removeParameter(field.name)"
                >
                  <Trash2 class="h-3.5 w-3.5 mr-1" />
                  Supprimer le paramètre
                </Button>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <!-- Section: Paramètres Spécifiques (ImageBuilder etc.) -->
    <div v-if="element.tag === 'ImageBuilder'" class="space-y-3 pt-4 border-t border-white/10">
      <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">Paramètres Système Image</h4>
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

    <!-- Section: Icône Builder -->
    <div v-if="element.tag === 'IconBuilder'" class="space-y-3 pt-4 border-t border-white/10">
      <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">Paramètres Système Icône</h4>
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
    <div v-if="element.family === 'input'" class="space-y-3 pt-4 border-t border-white/10">
      <h4 class="text-[10px] uppercase tracking-wider text-primary font-black border-b border-white/10 pb-1">Paramètres Système Champ</h4>
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
        <div class="flex items-center space-x-2 pt-5">
          <Checkbox id="required-sys" :checked="(element.data.required as boolean)" @update:checked="(val: boolean | 'indeterminate') => updateData('required', !!val)" />
          <label for="required-sys" class="text-[11px] text-gray-300 cursor-pointer">Requis</label>
        </div>
      </div>
    </div>

    <!-- Section: Actions (Boutons etc.) -->
    <div v-if="element.family === 'interactive'" class="space-y-3 pt-4 border-t border-white/10">
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
       </div>
    </div>

  </div>
</template>
