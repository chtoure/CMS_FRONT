<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { ref, inject, computed, watch } from 'vue';
import type { AnyComponentInstance, CliquableAction } from '../../type/component';
import { ValueSource, type IComponentParams, type IContenusField, type IImageField, type IPropsSchemaField, type IParentField, type IStaticField } from '../../type/params';
import Label from '../../components/ui/label/Label.vue';
import Input from '../../components/ui/input/Input.vue';
import Select from '../../components/ui/select/Select.vue';
import SelectTrigger from '../../components/ui/select/SelectTrigger.vue';
import SelectValue from '../../components/ui/select/SelectValue.vue';
import SelectContent from '../../components/ui/select/SelectContent.vue';
import SelectItem from '../../components/ui/select/SelectItem.vue';
import * as Icons from 'lucide-vue-next';
import { Plus, Trash2, ChevronDown, Type, Image as ImageIcon, Database, Link as LinkIcon } from 'lucide-vue-next';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { useGetContentTypes } from '../../hook/content-type';
import { useGetContentEntriesBySlug } from '../../hook/content-entry';
import type { ContentType } from '../../type/content-type';
import CompositionMediaPicker from '../composition/CompositionMediaPicker.vue';
import { useGetMediaList } from '../../hook/media';
import { FieldType, TypesMedia } from '../../type/field';

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
const paramDynamic = computed(() => props.element.tag === 'CardBuilder');

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
    newParam.value.type = { source: ValueSource.IMAGE, src: '' };
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
        let newValue: any = null;
        if (editingParam.value?.type.source === ValueSource.STATIC) {
          newValue = editingParam.value.type.value;
        } else if (editingParam.value?.type.source === ValueSource.IMAGE) {
          newValue = editingParam.value.type.src;
        } else if (editingParam.value?.type.source === ValueSource.CONTENUS) {
          const type = editingParam.value.type as IContenusField;
          newValue = type.config.mode === 'single' ? type.config.entryId : type.contentTypeId;
        }

        const newNode = {
          ...node,
          params: node.params.map(p => p.name === editingParam.value?.name ? (editingParam.value as IComponentParams) : p),
          data: {
            ...node.data,
            [editingParam.value?.name as string]: newValue
          }
        };

        // Propager la nouvelle valeur aux enfants liés si nécessaire
        if (editingParam.value?.name && newNode.children) {
          newNode.children = propagateValueToChildren(newNode.children, editingParam.value.name, newValue);
        }

        return newNode;
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
          data: { ...node.data, [name]: node.data[name] ?? (
               param.type.source === ValueSource.STATIC ? (param.type as IStaticField).value
             : param.type.source === ValueSource.IMAGE ? (param.type as IImageField).src
             : param.type.source === ValueSource.CONTENUS ? ((param.type as any).config?.mode === 'single' ? (param.type as any).config.entryId : (param.type as any).contentTypeId)
             : null
          ) }
        };
      }
      if (node.children) return { ...node, children: updateNode(node.children) };
      return node;
    });
  };

  builderState.pageTree.value = updateNode(builderState.pageTree.value);

  console.log("Ajout",builderState);


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
        // En plus de mettre à jour le parent, on propage aux enfants liés
        const nodeWithNewData = { ...node, data: newData };
        if (nodeWithNewData.children) {
          nodeWithNewData.children = propagateValueToChildren(nodeWithNewData.children, key, value);
        }
        return nodeWithNewData;
      }
      if (node.children) {
        return { ...node, children: updateNode(node.children) };
      }
      return node;
    });
  };

  builderState.pageTree.value = updateNode(builderState.pageTree.value);
};

// Fonction récursive pour propager une valeur aux enfants liés
const propagateValueToChildren = (children: AnyComponentInstance[], parentParamName: string, newValue: any): AnyComponentInstance[] => {
  // On récupère le type du paramètre parent pour savoir s'il s'agit d'un contenu CMS
  const parentParam = props.element.params.find(p => p.name === parentParamName);
  const isCMS = parentParam?.type.source === ValueSource.CONTENUS;

  // Si c'est du CMS, on essaie de trouver l'entrée correspondante pour avoir le data_json
  let entryData: any = null;
  if (isCMS && newValue) {
    // On cherche dans les entrées chargées (celles de l'édition en cours)
    const entry = editingContentEntries.value?.results?.find((e: any) => e.id === newValue);
    if (entry) {
      entryData = entry.data_json;
    }
  }

  return children.map(child => {
    const newChildData = { ...child.data };
    let hasChanged = false;

    // On parcourt les paramètres de l'enfant pour voir s'il y a une liaison
    child.params.forEach(p => {
      if (p.type.source === ValueSource.PARENT && p.type.parentParamName === parentParamName) {
        const pt = p.type as IParentField;

        if (isCMS) {
          // Liaison CMS : on utilise la parentKey pour extraire la valeur brute
          if (pt.parentKey && entryData) {
            const rawValue = entryData[pt.parentKey];

            // Si l'enfant est une image, on s'attend à un objet ou une URL
            if (p.type.source === ValueSource.PARENT && child.params.find(param => param.name === p.name)?.type.source === ValueSource.IMAGE) {
               // On pourrait avoir besoin d'extraire le src si c'est un objet Media
               newChildData[p.name] = typeof rawValue === 'object' ? (rawValue as any)?.url : rawValue;
            } else {
               newChildData[p.name] = rawValue;
            }
            hasChanged = true;
          }
        } else {
          // Liaison directe (Static/Image)
          newChildData[p.name] = newValue;
          hasChanged = true;
        }
      }
    });

    const updatedChild = hasChanged ? { ...child, data: newChildData } : child;

    // Propagation récursive si l'enfant a lui-même des enfants
    if (updatedChild.children && updatedChild.children.length > 0) {
      updatedChild.children = propagateValueToChildren(updatedChild.children, parentParamName, newValue);
    }

    return updatedChild;
  });
};

// Fonction pour mettre à jour la liaison d'un paramètre enfant
const updateChildParamSource = (childId: string, paramName: string, source: ValueSource, parentParamName?: string, parentKey?: string) => {
  if (!builderState) return;

  const updateNode = (nodes: AnyComponentInstance[]): AnyComponentInstance[] => {
    return nodes.map((node) => {
      if (node.id === childId) {
        const newParams = node.params.map(p => {
          if (p.name === paramName) {
            if (source === ValueSource.PARENT) {
              const currentParentName = parentParamName || (p.type.source === ValueSource.PARENT ? (p.type as IParentField).parentParamName : '');
              const parentParam = props.element.params.find(pp => pp.name === currentParentName);
              const isCMS = parentParam?.type.source === ValueSource.CONTENUS;

              // Détermination du type cible (Static ou Image)
              // Si on vient d'un type original, on le stocke
              const originalType = p.type.source === ValueSource.PARENT ? (p.type as IParentField).targetType
                                  : (p.type.source as any);

              const newType: IParentField = {
                source: ValueSource.PARENT,
                parentParamName: currentParentName,
                parentKey: parentKey || (p.type.source === ValueSource.PARENT ? (p.type as IParentField).parentKey : undefined),
                targetType: originalType
              };

              // Synchronisation immédiate si mapping complet et nom sélectionné
              if (currentParentName) {
                if (!isCMS) {
                  node.data[paramName] = props.element.data[currentParentName];
                } else if (newType.parentKey) {
                  const entryId = props.element.data[currentParentName];
                  const entry = editingContentEntries.value?.results?.find((e: any) => e.id === entryId);
                  if (entry?.data_json) {
                    const rawValue = entry.data_json[newType.parentKey];
                    if (originalType === ValueSource.IMAGE) {
                      node.data[paramName] = typeof rawValue === 'object' ? (rawValue as any)?.url : rawValue;
                    } else {
                      node.data[paramName] = rawValue;
                    }
                  }
                }
              }

              return { ...p, type: newType };
            } else {
              return { ...p, type: { source: ValueSource.STATIC, value: node.data[paramName] || '' } as IStaticField };
            }
          }
          return p;
        });

        return { ...node, params: newParams };
      }
      if (node.children) return { ...node, children: updateNode(node.children) };
      return node;
    });
  };

  builderState.pageTree.value = updateNode(builderState.pageTree.value);
};

// Récupère les paramètres parents compatibles avec un type de paramètre enfant
const getCompatibleParentParams = (childParam: IComponentParams) => {
  // Utilise targetType si déjà lié, sinon le type direct
  const childType = childParam.type.source === ValueSource.PARENT
                    ? (childParam.type as IParentField).targetType
                    : childParam.type.source;

  return props.element.params.filter(p => {
    // Si l'enfant est statique, il peut se lier à un parent statique OR à un parent CMS (qui fournira des champs texte)
    if (childType === ValueSource.STATIC) {
      return p.type.source === ValueSource.STATIC || p.type.source === ValueSource.CONTENUS;
    }
    // Si l'enfant est image, il peut se lier à un parent image OR à un parent CMS (qui fournira des champs Media)
    if (childType === ValueSource.IMAGE) {
      return p.type.source === ValueSource.IMAGE || p.type.source === ValueSource.CONTENUS;
    }
    return false;
  });
};

// Récupère les champs du CMS compatibles avec un type de paramètre enfant
const getCompatibleCMSFields = (parentParamName: string, childParam: IComponentParams) => {
  const parentParam = props.element.params.find(p => p.name === parentParamName);
  if (parentParam?.type.source !== ValueSource.CONTENUS) return [];

  const contentTypeId = parentParam.type.contentTypeId;
  const contentType = contentTypeOptions.value?.results?.find((ct: any) => ct.id === contentTypeId);
  if (!contentType) return [];

  const childType = childParam.type.source === ValueSource.PARENT
                    ? (childParam.type as IParentField).targetType
                    : childParam.type.source;

  return contentType.fields_schema.filter((f: any) => {
    if (childType === ValueSource.STATIC) {
      // Types simples supportés pour le texte
      return [FieldType.TEXT, 'text', 'string', FieldType.NUMBER, 'number', FieldType.RICH_TEXT, 'richtext', FieldType.BOOLEAN, 'boolean'].includes(f.type);
    }
    if (childType === ValueSource.IMAGE) {
      // Type Media pour les images - on vérifie si allowedTypes contient image et UNIQUEMENT image si possible
      const isMedia = f.type === FieldType.MEDIA || f.type === 'media';
      const allowed = f.allowedTypes || [];
      const hasImage = allowed.includes(TypesMedia.IMAGE) || allowed.includes('image');
      // On accepte si c'est un media qui contient des images
      return isMedia && hasImage;
    }
    return false;
  }).map((f: any) => ({ label: f.label || f.name, value: f.name }));
};

const getIcon = (name: string) => {
  if (name in Icons) {
    const maybeIcon = (Icons as any)[name];
    if (typeof maybeIcon === 'function' || typeof maybeIcon === 'object') {
      return maybeIcon;
    }
  }
  return Icons.HelpCircle;
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

const handleSelectChange = (val:unknown) => {
  if (val !== null && val !== undefined) {
    const contentTypeId = Number(val);
    (newParam.value.type as IContenusField).contentTypeId = contentTypeId;
    // Reset entryId and mappingField when type changes
    if ((newParam.value.type as any).config) {
      (newParam.value.type as any).config.entryId = undefined;
      (newParam.value.type as any).config.mappingField = '';
    }
  }
};

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

const previewImage = ref('')


const mediaQuery = useGetMediaList({});
const changeMediaEditor = (id: number) => {
  if (!editingParam.value || id === null || id === undefined) return;

  previewImage.value = mediaQuery?.data.value?.results?.find((m) => m.id === id)?.file_path || '';
  (editingParam.value.type as IImageField).src = previewImage.value;
  (editingParam.value.type as IImageField).id = id;

}


const changeMediaAdd = (id: number) => {
  if (!newParam.value || id === null || id === undefined) return;

  previewImage.value = mediaQuery?.data.value?.results?.find((m) => m.id === id)?.file_path || '';
  (newParam.value.type as IImageField).src = previewImage.value;
  (newParam.value.type as IImageField).id = id
}

// Hack pour l'accessibilité Radix UI
const forceAriaHidden = (isOpen: boolean) => {
  if (isOpen) {
    window.document.getElementById('app')?.setAttribute('aria-hidden', 'false');
  }
};


</script>

<template>
  <div class="space-y-6 pb-20 p-1">

    <!-- Section: Gestion des Paramètres -->
    <div v-if="canAddParams" class="space-y-4">
      <div v-if="paramDynamic" class="flex items-center justify-between border-b border-white/10 pb-2">
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
              <Select v-model="(newParam.type as any).source" :modal="false">
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
                  <Checkbox id="new-required" :checked="newParam.required" @update:checked="(val: any) => newParam.required = !!val" />
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
            <Label class="text-[11px] text-gray-400">Choisir une image</Label>
            <div class="flex flex-row items-end gap-6">
              <CompositionMediaPicker
                :model-value="(newParam.type as any).id"
                :allowed-types="['image']"
                @update:model-value="changeMediaAdd($event)"
              />
            </div>
          </div>

          <div v-if="(newParam.type as any).source === 'contenus'" class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-1.5">
                <Label class="text-[11px] text-gray-400">Type de contenu</Label>
                <Select :model-value="(newParam.type as any).contentTypeId" :modal="false" @update:model-value="(val) => handleSelectChange(val)">
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
                <Select :model-value="(newParam.type as any).config.mode" :modal="false" @update:model-value="(val) => (newParam.type as any).config.mode = val">
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
            <div v-if="(newParam.type as any).config.mode === 'single'" class="space-y-1.5">
              <Label class="text-[11px] text-gray-400">Choisir une entrée</Label>
              <Select
                :model-value="(newParam.type as any).config.entryId"
                :modal="false"
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
                  <Select :model-value="(newParam.type as any).config.order" :modal="false" @update:model-value="(val) => (newParam.type as any).config.order = val">
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
                v-if="paramDynamic"
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
                  <Label class="text-[11px] text-gray-400">Choisir une image</Label>
                  <div class="flex flex-row items-end gap-6">
                    <CompositionMediaPicker
                      :model-value="(editingParam.type as any).id"
                      :allowed-types="['image']"
                      @update:model-value="changeMediaEditor($event)"
                    />
                  </div>
                  <!-- <Input
                    type="number"
                    v-model.number="(editingParam.type as any).imageId"
                    class="h-8 text-xs bg-black/20 border-border/50"
                  /> -->
                </div>

                <!-- Contenus Configuration -->
                <div v-if="editingParam.type.source === 'contenus'" class="space-y-3">
                  <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1.5">
                      <Label class="text-[11px] text-gray-400">Type de contenu</Label>
                      <Select :model-value="(editingParam.type as any).contentTypeId" :modal="false" @update:model-value="handleEditingTypeChange">
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
                      <Select :model-value="(editingParam.type as any).config.mode" :modal="false" @update:model-value="(val) => (editingParam?.type as any).config.mode = val">
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
                  <div v-if="(editingParam.type as any).config.mode === 'single'" class="space-y-1.5">
                    <Label class="text-[11px] text-gray-400">Choisir une entrée</Label>
                    <Select
                      :model-value="(editingParam.type as any).config.entryId"
                      :modal="false"
                      @update:model-value="(val) => {
                        (editingParam!.type as any).config.entryId = val;
                        updateData(editingParam!.name, val as any);
                      }"
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
                      <Select :model-value="(editingParam.type as any).config.order" :modal="false" @update:model-value="(val) => (editingParam?.type as any).config.order = val">
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

    <!-- Section: Liaison Parent-Enfant (Uniquement pour CardBuilder ou conteneurs) -->
    <div v-if="element.tag === 'CardBuilder' && element.children && element.children.length > 0" class="space-y-4 pt-4 border-t border-white/10">
      <div class="flex items-center gap-2 border-b border-white/10 pb-2">
        <LinkIcon class="h-4 w-4 text-primary" />
        <h4 class="text-xs text-primary font-black uppercase tracking-wider">Liaison Enfants</h4>
      </div>

      <div v-for="child in element.children" :key="child.id" class="space-y-3 p-2 bg-white/5 rounded-md border border-white/5">
        <div class="flex items-center gap-2 border-b border-white/5 pb-1 mb-2">
          <component :is="getIcon(child.icon)" class="h-3 w-3 text-gray-400" />
          <span class="text-[10px] font-bold text-gray-300">{{ child.name }}</span>
        </div>

        <div v-for="p in child.params" :key="p.name" class="space-y-2">
          <div class="flex items-center justify-between">
            <Label class="text-[10px] text-gray-400">{{ p.label }}</Label>
            <div class="flex gap-1">
               <Button
                size="sm"
                variant="ghost"
                class="h-6 text-[9px] px-2 focus:ring-0"
                :class="{ 'bg-primary/20 text-primary': p.type.source === 'parent' }"
                @click="(e: MouseEvent) => {
                  updateChildParamSource(child.id, p.name, p.type.source === 'parent' ? ValueSource.STATIC : ValueSource.PARENT);
                  (e.currentTarget as HTMLElement)?.blur();
                }"
              >
                {{ p.type.source === 'parent' ? 'Lié' : 'Lier' }}
              </Button>
            </div>
          </div>

            <div v-if="p.type.source === 'parent'" :key="`link-${child.id}-${p.name}`" class="pl-2 border-l-2 border-primary/30 space-y-2">
             <div class="space-y-1">
               <Label class="text-[9px] text-gray-500">Paramètre Parent</Label>
               <Select
                   :model-value="(p.type as IParentField).parentParamName"
                   :modal="false"
                   @update:model-value="(val) => updateChildParamSource(child.id, p.name, ValueSource.PARENT, val as string)"
                   @update:open="forceAriaHidden"
                >
                  <SelectTrigger class="h-7 text-[10px] bg-black/40 border-border/30" @click.stop>
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="pp in getCompatibleParentParams(p)" :key="pp.name" :value="pp.name">
                      {{ pp.label }}
                    </SelectItem>
                  </SelectContent>
               </Select>
             </div>

             <!-- Si le paramètre parent est choisi ET de type CONTENUS, on demande le champ source (parentKey) -->
             <div v-if="(p.type as IParentField).parentParamName && element.params.find(pp => pp.name === (p.type as IParentField).parentParamName)?.type.source === ValueSource.CONTENUS" class="space-y-1">
                <Label class="text-[9px] text-gray-500">Champ Source (CMS)</Label>
                 <Select
                  :model-value="(p.type as IParentField).parentKey"
                  :modal="false"
                  @update:model-value="(val) => updateChildParamSource(child.id, p.name, ValueSource.PARENT, (p.type as IParentField).parentParamName, val as string)"
                  @update:open="forceAriaHidden"
                >
                  <SelectTrigger
                    class="h-7 text-[10px] bg-black/40 border-border/30 focus:ring-0"
                    :class="{ 'border-red-500/50': !(p.type as IParentField).parentKey }"
                    @click.stop
                  >
                    <SelectValue placeholder="Choisir le champ..." />
                  </SelectTrigger>
                  <SelectContent :modal="false">
                    <SelectItem v-for="cf in getCompatibleCMSFields((p.type as IParentField).parentParamName, p)" :key="cf.value" :value="cf.value">
                      {{ cf.label }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="!(p.type as IParentField).parentKey" class="text-[8px] text-red-400 italic">Sélectionnez un champ pour activer la liaison</p>
             </div>
          </div>
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
        <Select :model-value="(element.data.objectFit as string)" :modal="false" @update:model-value="(val) => val && updateData('objectFit', val as string)">
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
          <Select :model-value="(element.data.type as string)" :modal="false" @update:model-value="(val) => val && updateData('type', val as string)">
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
            <Select :model-value="((element.data.cliquable as CliquableAction).action)" :modal="false" @update:model-value="(val) => val && updateData('cliquable', { ...(element.data.cliquable as object), action: val as CliquableAction['action'] })">
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
