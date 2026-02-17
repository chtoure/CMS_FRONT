<script lang="ts" setup>
import { ref, inject, computed, watch } from 'vue';
import type { AnyComponentInstance, CliquableAction } from '../../type/component';
import { ValueSource, type IComponentParams, type IContenusField, type IPropsSchemaField } from '../../type/params';
import Label from '../../components/ui/label/Label.vue';
import Input from '../../components/ui/input/Input.vue';
import Select from '../../components/ui/select/Select.vue';
import SelectTrigger from '../../components/ui/select/SelectTrigger.vue';
import SelectValue from '../../components/ui/select/SelectValue.vue';
import SelectContent from '../../components/ui/select/SelectContent.vue';
import SelectItem from '../../components/ui/select/SelectItem.vue';
import { Plus, Trash2, ChevronDown, Type, Image as ImageIcon, Database } from 'lucide-vue-next';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { useGetContentTypes } from '../../hook/content-type';
import { useGetContentEntriesBySlug } from '../../hook/content-entry';
import type { ContentType } from '../../type/content-type';

const props = defineProps<{
  element: AnyComponentInstance;
}>();

const builderState = inject<{
  pageTree: { value: AnyComponentInstance[] };
  selectedId: { value: string | null };
  selectComponent: (id: string | null) => void;
}>('builderState');


const {
  data: contentTypeOptions
} = useGetContentTypes();

// const {
//   data: contentTypeById
// } = useGetContentTypeById(newParam.value.type.contentTypeId);


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

// Initialisation dynamique des champs du type selon la source
watch(() => (newParam.value.type as any)?.source, (newSource) => {
  if (newSource === ValueSource.STATIC) {
    newParam.value.type = { source: ValueSource.STATIC, value: '' };
  } else if (newSource === ValueSource.IMAGE) {
    newParam.value.type = { source: ValueSource.IMAGE };
  } else if (newSource === ValueSource.CONTENUS) {
    newParam.value.type = {
      source: ValueSource.CONTENUS,
      contentTypeId: 0,
      config: { mode: 'single', entryId: 0 }
    } as any;
  }
});

const orderOptions = [
  { label: 'Croissant', value: 'asc' },
  { label: 'Décroissant', value: 'desc' },
];

const modeOptions = [
  { label: 'Élément unique', value: 'single' },
  { label: 'Requête (Liste)', value: 'query' },
];

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

const editingParam = ref<IComponentParams | null>(null);

const toggleParam = (name: string) => {
  if (expandedParam.value === name) {
    expandedParam.value = null;
    editingParam.value = null;
  } else {
    expandedParam.value = name;
    const param = props.element.params.find(p => p.name === name);
    if (param) {
      // Clone profond pour édition temporaire
      editingParam.value = JSON.parse(JSON.stringify(param));
    }
  }
};

const saveParameterEdit = () => {
  if (!editingParam.value || !builderState) return;

  const updateNode = (nodes: AnyComponentInstance[]): AnyComponentInstance[] => {
    return nodes.map((node) => {
      if (node.id === props.element.id) {
        return {
          ...node,
          params: node.params.map(p => p.name === editingParam.value?.name ? (editingParam.value as IComponentParams) : p)
        };
      }
      if (node.children) return { ...node, children: updateNode(node.children) };
      return node;
    });
  };

  builderState.pageTree.value = updateNode(builderState.pageTree.value);
  expandedParam.value = null;
  editingParam.value = null;
};

const cancelParameterEdit = () => {
  expandedParam.value = null;
  editingParam.value = null;
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


const tabChamp = ref<{ label: string; value: string }[]>([]);

//computed pour savoir si un type de contenu est sélectionné (pour le formulaire d'ajout)
const isContentTypeSelected = computed(() => !!(newParam.value.type as any).contentTypeId);

// computed pour récupérer le slug du type de contenu sélectionné (pour l'ajout)
const selectedNewContentTypeSlug = computed(() => {
  const id = (newParam.value.type as any).contentTypeId;
  return contentTypeOptions.value?.results.find((opt: ContentType) => opt.id === id)?.slug;
});

// Récupération des entrées pour le formulaire d'ajout
const { data: newContentEntries } = useGetContentEntriesBySlug(selectedNewContentTypeSlug);

// --- Logique pour l'ÉDITION ---
const isEditingContentTypeSelected = computed(() => !!(editingParam.value?.type as any)?.contentTypeId);

const selectedEditingContentTypeSlug = computed(() => {
  const id = (editingParam.value?.type as any)?.contentTypeId;
  return contentTypeOptions.value?.results.find((opt: ContentType) => opt.id === id)?.slug;
});

const { data: editingContentEntries } = useGetContentEntriesBySlug(selectedEditingContentTypeSlug);

const updateContentTypeId = (contentTypeId: number) => {
  (newParam.value.type as IContenusField).contentTypeId = contentTypeId;
  // Reset entryId and mappingField when type changes
  if ((newParam.value.type as any).config) {
    (newParam.value.type as any).config.entryId = undefined;
    (newParam.value.type as any).config.mappingField = '';
  }

  tabChamp.value = contentTypeOptions.value?.results.find((opt: ContentType) => opt.id === contentTypeId)?.fields_schema.map((field: any) => {
    return {
      label: field.label,
      value: field.name
    };
  }) || [];
};

const handleSelectChange = (val:unknown) => {
  if (val !== null && val !== undefined) {
    updateContentTypeId(Number(val));
  }
};

// Logique de mise à jour pour l'édition (similaire à updateContentTypeId)
const tabChampEditing = computed(() => {
  const id = (editingParam.value?.type as any)?.contentTypeId;
  if (!id) return [];
  return contentTypeOptions.value?.results.find((opt: ContentType) => opt.id === id)?.fields_schema.map(field => ({
    label: field.label,
    value: field.name
  })) || [];
});

const handleEditingTypeChange = (val: unknown) => {
  if (!editingParam.value || val === null || val === undefined) return;
  const id = Number(val);
  (editingParam.value.type as any).contentTypeId = id;
  // Reset entryId and mappingField
  if ((editingParam.value.type as any).config) {
    (editingParam.value.type as any).config.entryId = undefined;
    (editingParam.value.type as any).config.mappingField = '';
  }
};

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
          <!-- Configuration dynamique selon la Source -->
          <div v-if="(newParam.type as any).source === 'static'" class="space-y-1.5">
            <Label class="text-[11px] text-gray-400">Valeur par défaut</Label>
            <Input
              v-model="(newParam.type as any).value"
              placeholder="Valeur initiale..."
              class="h-8 text-xs bg-black/40 border-border/30"
            />
          </div>

          <div v-if="(newParam.type as any).source === 'image'" class="space-y-1.5">
            <Label class="text-[11px] text-gray-400">ID Image par défaut (Optionnel)</Label>
            <Input
              type="number"
              v-model.number="(newParam.type as any).imageId"
              placeholder="ID de l'image..."
              class="h-8 text-xs bg-black/40 border-border/30"
            />
          </div>

          <div v-if="(newParam.type as any).source === 'contenus'" class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <Label class="text-[11px] text-gray-400">Type de contenu</Label>
                <Select :model-value="(newParam.type as any).contentTypeId" @update:model-value="(val) => handleSelectChange(val)">
                  <SelectTrigger class="h-8 text-xs bg-black/40 border-border/30">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="opt in contentTypeOptions?.results" :key="opt.id" :value="opt.id">
                      {{ opt.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-1.5">
                <Label class="text-[11px] text-gray-400">Mode d'affichage</Label>
                <Select :model-value="(newParam.type as any).config.mode" @update:model-value="(val) => (newParam.type as any).config.mode = val">
                  <SelectTrigger class="h-8 text-xs bg-black/40 border-border/30">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="mode in modeOptions" :key="mode.value" :value="mode.value">
                      {{ mode.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <!-- Mode: Single -->
            <div v-if="(newParam.type as any).config.mode === 'single'" class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <Label class="text-[11px] text-gray-400">Choisir une entrée</Label>
                <Select
                  :model-value="(newParam.type as any).config.entryId"
                  @update:model-value="(val) => (newParam.type as any).config.entryId = val"
                  :disabled="!isContentTypeSelected"
                >
                  <SelectTrigger class="h-8 text-xs bg-black/40 border-border/30">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="entry in newContentEntries?.results" :key="entry.id" :value="entry.id">
                      {{ entry.id }} - {{ (entry.data_json as any).title || 'Sans titre' }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-1.5">
                <Label class="text-[11px] text-gray-400">Champ de mapping</Label>
                <Select
                  :model-value="(newParam.type as any).config.mappingField"
                  @update:model-value="(val) => (newParam.type as any).config.mappingField = val"
                  :disabled="!isContentTypeSelected"
                >
                  <SelectTrigger class="h-8 text-xs bg-black/40 border-border/30">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="opt in tabChamp" :key="opt.value" :value="opt.value">
                      {{ opt.label || opt.value }}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <!-- Mode: Query -->
            <div v-if="(newParam.type as any).config.mode === 'query'" class="space-y-3">
              <div class="grid grid-cols-3 gap-2">
                <div class="space-y-1.5">
                  <Label class="text-[11px] text-gray-400">Limite</Label>
                  <Input type="number" v-model.number="(newParam.type as any).config.limit" class="h-8 text-xs bg-black/40 border-border/30" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-[11px] text-gray-400">Trier par</Label>
                  <Input v-model="(newParam.type as any).config.sortBy" placeholder="id" class="h-8 text-xs bg-black/40 border-border/30" />
                </div>
                <div class="space-y-1.5">
                  <Label class="text-[11px] text-gray-400">Ordre</Label>
                  <Select :model-value="(newParam.type as any).config.order" @update:model-value="(val) => (newParam.type as any).config.order = val">
                    <SelectTrigger class="h-8 text-xs bg-black/40 border-border/30">
                      <SelectValue placeholder="Ordre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="ord in orderOptions" :key="ord.value" :value="ord.value">
                        {{ ord.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
            <div class="flex items-center gap-1">
              <span v-if="field.required" class="text-[9px] px-1 bg-primary/20 text-primary rounded">Requis</span>
              <Button
                variant="ghost"
                size="icon"
                class="h-6 w-6 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                @click.stop="removeParameter(field.name)"
              >
                <Trash2 class="h-3 w-3" />
              </Button>
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
            <div v-if="editingParam && expandedParam === field.name" class="p-3 space-y-4 bg-black/40">
              <!-- Édition du Label -->
              <div class="space-y-1.5">
                <div class="space-y-2">
                  <div class="space-y-1">
                    <Label class="text-[11px] text-gray-400">Label d'affichage</Label>
                    <Input
                      v-model="editingParam.label"
                      class="h-8 text-xs bg-black/20 border-border/50"
                    />
                  </div>
                </div>
              </div>

              <!-- Édition de la Configuration (Schema Type) -->
              <div class="space-y-1 border-t border-white/5 pt-2">
                <!-- Static Configuration -->
                <div v-if="editingParam.type.source === 'static'" class="space-y-1.5">
                  <Label class="text-[11px] text-gray-400">Valeur par défaut</Label>
                  <Input
                    v-model="(editingParam.type as any).value"
                    class="h-8 text-xs bg-black/20 border-border/50"
                  />
                </div>

                <!-- Image Configuration -->
                <div v-if="editingParam.type.source === 'image'" class="space-y-1.5">
                  <Label class="text-[11px] text-gray-400">ID Image par défaut</Label>
                  <Input
                    type="number"
                    v-model.number="(editingParam.type as any).imageId"
                    class="h-8 text-xs bg-black/20 border-border/50"
                  />
                </div>

                <!-- Contenus Configuration -->
                <div v-if="editingParam.type.source === 'contenus'" class="space-y-3">
                  <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1.5">
                      <Label class="text-[11px] text-gray-400">Type de contenu</Label>
                      <Select :model-value="(editingParam.type as any).contentTypeId" @update:model-value="handleEditingTypeChange">
                        <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem v-for="opt in contentTypeOptions?.results" :key="opt.id" :value="opt.id">
                            {{ opt.name }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div class="space-y-1.5">
                      <Label class="text-[11px] text-gray-400">Mode d'affichage</Label>
                      <Select :model-value="(editingParam.type as any).config.mode" @update:model-value="(val) => (editingParam.type as any).config.mode = val">
                        <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
                          <SelectValue placeholder="Mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem v-for="mode in modeOptions" :key="mode.value" :value="mode.value">
                            {{ mode.label }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <!-- Mode: Single -->
                  <div v-if="(editingParam.type as any).config.mode === 'single'" class="grid grid-cols-2 gap-3">
                    <div class="space-y-1.5">
                      <Label class="text-[11px] text-gray-400">Choisir une entrée</Label>
                      <Select
                        :model-value="(editingParam.type as any).config.entryId"
                        @update:model-value="(val) => (editingParam.type as any).config.entryId = val"
                        :disabled="!isEditingContentTypeSelected"
                      >
                        <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem v-for="entry in editingContentEntries?.results" :key="entry.id" :value="entry.id">
                            {{ entry.id }} - {{ (entry.data_json as any).title || 'Sans titre' }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div class="space-y-1.5">
                      <Label class="text-[11px] text-gray-400">Champ Mapping</Label>
                      <Select
                        :model-value="(editingParam.type as any).config.mappingField"
                        @update:model-value="(val) => (editingParam.type as any).config.mappingField = val"
                        :disabled="!isEditingContentTypeSelected"
                      >
                        <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem v-for="opt in tabChampEditing" :key="opt.value" :value="opt.value">
                            {{ opt.label || opt.value }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <!-- Mode: Query -->
                  <div v-if="(editingParam.type as any).config.mode === 'query'" class="grid grid-cols-3 gap-2">
                    <div class="space-y-1.5">
                      <Label class="text-[11px] text-gray-400">Limite</Label>
                      <Input type="number" v-model.number="(editingParam.type as any).config.limit" class="h-8 text-xs bg-black/20 border-border/50" />
                    </div>
                    <div class="space-y-1.5">
                      <Label class="text-[11px] text-gray-400">Trier par</Label>
                      <Input v-model="(editingParam.type as any).config.sortBy" class="h-8 text-xs bg-black/20 border-border/50" />
                    </div>
                    <div class="space-y-1.5">
                      <Label class="text-[11px] text-gray-400">Ordre</Label>
                      <Select :model-value="(editingParam.type as any).config.order" @update:model-value="(val) => (editingParam.type as any).config.order = val">
                        <SelectTrigger class="h-8 text-xs bg-black/20 border-border/50">
                          <SelectValue placeholder="Ordre" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem v-for="ord in orderOptions" :key="ord.value" :value="ord.value">
                            {{ ord.label }}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer de l'accordéon -->
              <div class="flex gap-2 pt-2 border-t border-white/5">
                <Button
                  size="sm"
                  variant="ghost"
                  class="flex-1 h-7 text-[10px] order-2"
                  @click="cancelParameterEdit"
                >
                  Annuler
                </Button>
                <Button
                  size="sm"
                  class="flex-1 h-7 text-[10px]"
                  @click="saveParameterEdit"
                >
                  Modifier
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
