<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { ref, inject, computed, watch } from 'vue';
import { useQueryClient } from "@tanstack/vue-query";
import type { AnyComponentInstance, CliquableAction } from '../../type/component';
import { ValueSource, type IComponentParams, type IContenusField, type IImageField, type IPropsSchemaField, type IParentField, type IStaticField } from '../../type/params';
// Les composants Label et Input sont remplacés par PropertyInput ou des balises standard
import Select from '../../components/ui/select/Select.vue';
import SelectTrigger from '../../components/ui/select/SelectTrigger.vue';
import SelectValue from '../../components/ui/select/SelectValue.vue';
import SelectContent from '../../components/ui/select/SelectContent.vue';
import SelectItem from '../../components/ui/select/SelectItem.vue';
import * as Icons from 'lucide-vue-next';
import { Plus, Trash2, ChevronDown, Type, Image as ImageIcon, Database, Link as LinkIcon, Check, ChevronsUpDown } from 'lucide-vue-next';

const queryClient = useQueryClient();
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { useGetContentTypes } from '../../hook/content-type';
import { useGetContentEntriesBySlug } from '../../hook/content-entry';
import type { ContentType } from '../../type/content-type';
import CompositionMediaPicker from '../composition/CompositionMediaPicker.vue';
import { useGetMediaList } from '../../hook/media';
import { FieldType, TypesMedia } from '../../type/field';
// BaseSwitch est remplacé par Checkbox pour la cohérence
import PropertyGroup from './ui/PropertyGroup.vue';
import PropertyInput from './ui/PropertyInput.vue';
import Popover from '../../components/ui/popover/Popover.vue';
import PopoverTrigger from '../../components/ui/popover/PopoverTrigger.vue';
import PopoverContent from '../../components/ui/popover/PopoverContent.vue';
import Command from '../../components/ui/command/Command.vue';
import CommandInput from '../../components/ui/command/CommandInput.vue';
import CommandEmpty from '../../components/ui/command/CommandEmpty.vue';
import CommandList from '../../components/ui/command/CommandList.vue';
import CommandGroup from '../../components/ui/command/CommandGroup.vue';
import CommandItem from '../../components/ui/command/CommandItem.vue';
import CommandSeparator from '../../components/ui/command/CommandSeparator.vue';
import { useGetNavItems } from '../../hook/page';
import { useElementSize } from '@vueuse/core';
import { cn } from '../../lib/utils';


const props = defineProps<{
  element: AnyComponentInstance;
}>();

const builderState = inject<{
  pageTree: { value: AnyComponentInstance[] };
  selectedId: { value: string | null };
  builderMode: { value: 'page' | 'library' };
  selectComponent: (id: string | null) => void;
  cmsCache: { value: Record<string, any> };
}>('builderState');


const {
  data: contentTypeOptions,
  refetch: refetchContentTypes
} = useGetContentTypes();


const easeOptions = [
  { label: 'Ease', value: 'ease-in-out' },
  { label: 'Linear', value: 'linear' },
  { label: 'In', value: 'ease-in' },
  { label: 'Out', value: 'ease-out' },
];


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
const paramDynamic = computed(() => props.element.family === 'container');
const hasLinkedChildren = computed(() => {
  if (!props.element.children) return false;
  return props.element.children.some(child => (child.data as any).linkedQueryParamName);
});

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

const mediaQuery = useGetMediaList({});
const editingParam = ref<IComponentParams | null>(null);

// --- Sélection d'URL ---
const { data: navItems } = useGetNavItems();
const urlSearchOpen = ref(false);
const urlSearchRef = ref(null);
const { width: urlSearchWidth } = useElementSize(urlSearchRef);
const navItemsResults = computed(() => navItems.value || []);

// --- Composants cibles pour TOGGLE_VISIBILITY ---
// On utilise blocTemplateId (ID backend stable) comme valeur, pour que la sélection persiste après rechargement.
const allComponents = computed(() => {
  const list: { stableId: string; name: string; tag: string }[] = [];
  const traverse = (elements: AnyComponentInstance[]) => {
    for (const el of elements) {
      // Ne pas s'inclure soi-même
      if (el.id !== props.element.id) {
        // blocTemplateId est l'ID backend persistant. S'il n'existe pas encore (composant non sauvegardé),
        // on se rabat sur l'UUID local mais la sélection ne persistera pas dans ce cas.
        const stableId = el.blocTemplateId ? el.blocTemplateId.toString() : el.id;
        list.push({ stableId, name: el.name, tag: el.tag });
      }
      if (el.children) {
        traverse(el.children);
      }
    }
  };
  if (builderState?.pageTree.value) {
    traverse(builderState.pageTree.value);
  }
  return list;
});

// Cache global pour les entrées CMS du bloc (ID -> data_json OU ParamName -> Liste d'objets)
const blockCMSData = computed({
  get: () => builderState?.cmsCache.value || {},
  set: (val) => {
    if (builderState) builderState.cmsCache.value = val;
  }
});

// Stockage des entrées brutes pour permettre une re-résolution propre
const rawCMSEntries = ref<Record<number, any>>({});

const resolveEntryMedia = (id: number | string) => {
  if (id === undefined || id === null) return;
  const entry = typeof id === 'number' ? rawCMSEntries.value[id] : null;
  if (!entry?.data_json) return;

  const resolvedData = { ...entry.data_json };
  const ctId = entry.contentTypeId;
  const ct = contentTypeOptions.value?.results?.find((c: any) => c.id === ctId);

  if (ct?.fields_schema) {
    ct.fields_schema.forEach((f: any) => {
      const isMedia = f.type === FieldType.MEDIA || f.type === 'media';
      const value = resolvedData[f.name];
      if (isMedia && value) {
        const url = mediaQuery?.data.value?.results?.find((m: any) => m.id === value)?.file_path;
        if (url) {
          resolvedData[f.name] = url;
        }
      }
    });
  }

  // Si on a une URL ou que la data a changé, on met à jour le cache réactif
  if (JSON.stringify(blockCMSData.value[id]) !== JSON.stringify(resolvedData)) {
    blockCMSData.value[id] = resolvedData;
  }
};

// Fonction pour charger les données CMS manquantes pour tout le bloc
import api from '../../api/fetchConfig';
import { handleResponse } from '../../api/fetchConfig';

const fetchBlockCMSData = async () => {
  const params = props.element.params || [];

  // 1. Gérer les entrées uniques (Single)
  const usedEntryIds = params
    .filter(p => p.type.source === ValueSource.CONTENUS && (p.type as IContenusField).config.mode === 'single')
    .map(p => {
       const id = props.element.data[p.name];
       return typeof id === 'number' ? id : null;
    })
    .filter((id): id is number => id !== null);

  if (usedEntryIds.length > 0) {
    const idsToFetch = usedEntryIds.filter(id => !rawCMSEntries.value[id]);
    if (idsToFetch.length > 0) {
      await Promise.all(idsToFetch.map(async (id) => {
        try {
          const entry = await queryClient.fetchQuery({
            queryKey: ["content-entry", id],
            queryFn: async () => {
              const resp = await api(`/content-entries/${id}`);
              return await handleResponse<any>(resp);
            },
            staleTime: 1000 * 60 * 5,
          });
          if (entry) {
            rawCMSEntries.value[id] = entry;
            resolveEntryMedia(id);
          }
        } catch (err) {
          console.error(`Failed to fetch CMS entry ${id}`, err);
        }
      }));
    }
    usedEntryIds.forEach(id => resolveEntryMedia(id));
  }

  // 2. Gérer les requêtes (Query)
  const queryParams = params.filter(p => p.type.source === ValueSource.CONTENUS && (p.type as IContenusField).config.mode === 'query');

  if (queryParams.length > 0) {
    await Promise.all(queryParams.map(async (p) => {
      const type = p.type as IContenusField;
      const config = type.config as any; // IContenusQuery

      try {
        const queryParams = new URLSearchParams();
        if (config.limit) queryParams.append('limit', config.limit.toString());
        if (config.sortBy) queryParams.append('sortBy', config.sortBy);
        if (config.order) queryParams.append('order', config.order);

        const resp = await api(`/content-entries/id/${type.contentTypeId}?${queryParams.toString()}`);
        const data = await handleResponse<any>(resp);

        const results = Array.isArray(data) ? data : data?.results;

        if (results && Array.isArray(results)) {
          const resolvedResults = results.map((entry: any) => {
            // Stockage individuel dans le cache brut pour réutilisation
            if (entry.id !== undefined && entry.id !== null) {
              rawCMSEntries.value[entry.id] = entry;
            }

            // Résolution des médias
            const ct = contentTypeOptions.value?.results?.find((c: any) => c.id === type.contentTypeId);
            const resolvedData = { ...entry.data_json };

            if (ct?.fields_schema) {
              ct.fields_schema.forEach((f: any) => {
                const isMedia = f.type === FieldType.MEDIA || f.type === 'media';
                const value = resolvedData[f.name];
                if (isMedia && value) {
                  const url = mediaQuery?.data.value?.results?.find((m: any) => m.id === value)?.file_path;
                  if (url) resolvedData[f.name] = url;
                }
              });
            }

            // On met aussi à jour le cache individuel par ID
            if (entry.id !== undefined && entry.id !== null) {
              blockCMSData.value[entry.id] = resolvedData;
            }
            return resolvedData;
          });

          // Stockage de la liste complète sous le nom du paramètre
          blockCMSData.value[p.name] = resolvedResults;
        }
      } catch (err) {
        console.error(`Failed to fetch query for param ${p.name}`, err);
      }
    }));
  }
};

// On recharge le cache quand le composant change, quand les données changent, quand les types ou les médias reviennent
watch(() => [props.element.id, JSON.stringify(props.element.data), mediaQuery.data.value, contentTypeOptions.value], async () => {
  await fetchBlockCMSData();
  console.log("blockCMSData", blockCMSData.value);
}, { immediate: true });

// Surveillance du cache global pour réagir aux updates externes d'entrées CMS
import { onUnmounted } from 'vue';
// import type { AnySectionInstance } from '../../type/section';
const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
  if (event.type === 'updated' && event.query.queryKey[0] === 'content-entry') {
    const id = event.query.queryKey[1] as number;
    // Si cette entrée est utilisée dans notre bloc, on la met à jour
    if (rawCMSEntries.value[id]) {
        rawCMSEntries.value[id] = event.query.state.data;
        resolveEntryMedia(id);
    }
  }
});

onUnmounted(() => {
  unsubscribe();
});

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

        const params = node.params || [];
        const newNode = {
          ...node,
          params: params.map(p => p.name === editingParam.value?.name ? (editingParam.value as IComponentParams) : p),
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
        const params = node.params || [];
        return {
          ...node,
          params: [...params, param],
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
        const params = node.params || [];
        return {
          ...node,
          params: params.filter(p => p.name !== name),
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

  // Cas spécial : si on change un paramètre qui est une Query, on propage aussi (si besoin)
  // Mais ici on propage via props.element.data
};

/**
 * Met à jour data[key] ET le param STATIC correspondant si il existe.
 * Nécessaire parce que le backend (hydrateParams) écrase data avec params.type.value
 * lors du rendu. Garder les deux en sync garantit la persistance des modifications.
 */
const updateDataAndParam = (key: string, value: string) => {
  if (!builderState) return;

  const updateNode = (nodes: AnyComponentInstance[]): AnyComponentInstance[] => {
    return nodes.map((node: AnyComponentInstance): AnyComponentInstance => {
      if (node.id === props.element.id) {
        const newData = { ...node.data, [key]: value };
        // Synchronise aussi le param STATIC correspondant (type.source === 'static')
        const newParams = (node.params || []).map(p => {
          if (p.name === key && (p.type as any).source === 'static') {
            return { ...p, type: { ...(p.type as any), value } };
          }
          return p;
        });
        return { ...node, data: newData, params: newParams };
      }
      if (node.children) {
        return { ...node, children: updateNode(node.children) };
      }
      return node;
    });
  };

  builderState.pageTree.value = updateNode(builderState.pageTree.value);
};

// Fonction pour mettre à jour la liaison Query d'un container enfant
const updateChildLinkedQuery = (childId: string, queryParamName: string | null) => {
  if (!builderState) return;

  const updateNode = (nodes: AnyComponentInstance[]): AnyComponentInstance[] => {
    return nodes.map((node) => {
      if (node.id === props.element.id && node.children) {
        return {
          ...node,
          children: node.children.map(child => {
            if (child.id === childId) {
               // On cherche le contentTypeId correspondant au paramètre choisi
               const parentParam = props.element.params.find(p => p.name === queryParamName);
               const contentTypeId = parentParam?.type.source === ValueSource.CONTENUS ? parentParam.type.contentTypeId : undefined;

               const updated = {
                 ...child,
                 data: {
                   ...child.data,
                   linkedQueryParamName: queryParamName || undefined,
                   linkedQueryContentTypeId: contentTypeId
                 }
               };

               // Si on lie, on essaie d'injecter le premier item de la liste pour l'aperçu
               if (queryParamName && blockCMSData.value[queryParamName]?.length > 0) {
                 (updated.data as any)._inherited_item = blockCMSData.value[queryParamName][0];
               }
               return updated;
            }
            return child;
          })
        };
      }
      if (node.children) return { ...node, children: updateNode(node.children) };
      return node;
    });
  };

  builderState.pageTree.value = updateNode(builderState.pageTree.value);
};

// Fonction récursive pour propager une valeur aux enfants liés
const propagateValueToChildren = (children: AnyComponentInstance[], parentParamName: string, newValue: any): AnyComponentInstance[] => {
  // On récupère le type du paramètre parent pour savoir s'il s'agit d'un contenu CMS
  const params = props.element.params || [];
  const parentParam = params.find(p => p.name === parentParamName);
  const isCMS = parentParam?.type.source === ValueSource.CONTENUS;

  // Si c'est du CMS, on essaie de trouver l'entrée correspondante dans le cache global
  let entryData: any = null;
  if (isCMS && newValue) {
    entryData = blockCMSData.value[newValue];
  }

  return children.map(child => {
    const newChildData = { ...child.data };
    let hasChanged = false;

    // On parcourt les paramètres de l'enfant pour voir s'il y a une liaison
    const childParams = child.params || [];
    childParams.forEach(p => {
      if (p.type.source === ValueSource.PARENT && p.type.parentParamName === parentParamName) {
        const pt = p.type as IParentField;

        if (isCMS || parentParamName === '_inherited_query') {
          // Liaison CMS ou Héritage de Liste : on utilise la parentKey pour extraire la valeur
          const sourceData = isCMS ? entryData : newValue;
          if (pt.parentKey && sourceData) {
            const rawValue = (sourceData as any)[pt.parentKey];
            newChildData[p.name] = rawValue;
            hasChanged = true;
          }
        } else if (parentParamName !== '_inherited_query') {
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

  // Si on ouvre une liaison, on rafraîchit les types de contenu pour avoir les derniers schémas
  if (source === ValueSource.PARENT) {
    refetchContentTypes();
  }

  const updateNode = (nodes: AnyComponentInstance[]): AnyComponentInstance[] => {
    return nodes.map((node) => {
      if (node.id === childId) {
        const params = node.params || [];
        const newParams = params.map(p => {
          if (p.name === paramName) {
            if (source === ValueSource.PARENT) {
              const currentParentName = parentParamName || (p.type.source === ValueSource.PARENT ? (p.type as IParentField).parentParamName : '');
              const elementParams = props.element.params || [];
              const parentParam = elementParams.find(pp => pp.name === currentParentName);
              const isCMS = currentParentName === '_inherited_query' || parentParam?.type.source === ValueSource.CONTENUS;

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
                  const entryData = currentParentName === '_inherited_query'
                                    ? props.element.data._inherited_item
                                    : blockCMSData.value[props.element.data[currentParentName] as any];
                  if (entryData) {
                    const rawValue = entryData[newType.parentKey];
                    // On utilise directement la valeur du cache (qui contient les URLs résolues)
                    node.data[paramName] = rawValue;
                    console.log("blockCMSData : ",blockCMSData.value);

                  }
                }
              }

              return { ...p, type: newType };
            } else {
              // Récupération du type original (IMAGE ou STATIC)
              const originalType = p.type.source === ValueSource.PARENT ? (p.type as IParentField).targetType
                                  : p.type.source;

              if (originalType === ValueSource.IMAGE) {
                return { ...p, type: { source: ValueSource.IMAGE, src: node.data[paramName] || '' } as IImageField };
              } else {
                return { ...p, type: { source: ValueSource.STATIC, value: node.data[paramName] || '' } as IStaticField };
              }
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
  const childType = childParam.type.source === ValueSource.PARENT
                    ? (childParam.type as IParentField).targetType
                    : childParam.type.source;

  const params = [...(props.element.params || [])];

  // VIRTUAL PARAM : Si le composant ACTUEL est lui-même lié à une Query
  const linkedQuery = (props.element.data as any).linkedQueryParamName;

  if (linkedQuery) {
    params.push({
      name: '_inherited_query',
      label: `Liste: ${linkedQuery}`,
      type: { source: ValueSource.CONTENUS, contentTypeId: 0, config: { mode: 'single' } }
    } as any);
  }

  return params.filter(p => {
    // EXCLUSION : On ne propose jamais un paramètre de type 'query' pour un héritage de paramètre individuel
    if (p.type.source === ValueSource.CONTENUS && (p.type as IContenusField).config.mode === 'query') {
      return false;
    }

    if (childType === ValueSource.STATIC) {
      return p.type.source === ValueSource.STATIC || p.type.source === ValueSource.CONTENUS;
    }
    if (childType === ValueSource.IMAGE) {
      return p.type.source === ValueSource.IMAGE || p.type.source === ValueSource.CONTENUS;
    }
    return false;
  });
};

// Récupère les champs du CMS compatibles avec un type de paramètre enfant
const getCompatibleCMSFields = (parentParamName: string | undefined, childParam: IComponentParams, childId: string) => {
  const params = props.element.params || [];

  let contentTypeId: number | undefined;

  if (parentParamName === '_inherited_query') {
    contentTypeId = (props.element.data as any).linkedQueryContentTypeId;
  } else if (parentParamName) {
    const parentParam = params.find(p => p.name === parentParamName);
    if (parentParam?.type.source === ValueSource.CONTENUS) {
      contentTypeId = parentParam.type.contentTypeId;
    }
  } else {
    // Si pas de parentParamName, on regarde si le composant enfant lui-même est lié à une Query
    const findChild = (nodes: AnyComponentInstance[]): AnyComponentInstance | null => {
      for (const node of nodes) {
        if (node.id === childId) return node;
        if (node.children) {
          const found = findChild(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    const childNode = findChild(props.element.children || []);
    const linkedQuery = (childNode?.data as any)?.linkedQueryParamName;
    if (linkedQuery) {
      const parentParam = params.find(p => p.name === linkedQuery);
      if (parentParam?.type.source === ValueSource.CONTENUS) {
        contentTypeId = parentParam.type.contentTypeId;
      }
    }
  }

  if (!contentTypeId) return [];
  const contentType = contentTypeOptions.value?.results?.find((ct: any) => ct.id === contentTypeId);
  if (!contentType) return [];

  const childType = childParam.type.source === ValueSource.PARENT
                    ? (childParam.type as IParentField).targetType
                    : childParam.type.source;

  return contentType.fields_schema.filter((f: any) => {
    if (childType === ValueSource.STATIC) {
      // Types simples supportés pour le texte (Strict : pas de Media ici pour éviter les erreurs de type)
      return [FieldType.TEXT, 'text', 'string', FieldType.NUMBER, 'number', FieldType.RICH_TEXT, 'richtext', FieldType.BOOLEAN, 'boolean'].includes(f.type);
    }
    if (childType === ValueSource.IMAGE) {
      // Strict : Que du média de type image
      const isMedia = f.type === FieldType.MEDIA || f.type === 'media';
      if (!isMedia) return false;

      const allowed = f.allowedTypes || [];
      return allowed.includes(TypesMedia.IMAGE) || allowed.includes('image');
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


const changeMediaEditor = (id: number) => {
  if (!editingParam.value || id === null || id === undefined) return;

  const url = mediaQuery?.data.value?.results?.find((m) => m.id === id)?.file_path || '';
  (editingParam.value.type as IImageField).src = url;
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


const getDataValue = (val: any): any => {
  if (val && typeof val === 'object' && 'value' in val) {
    return val.value;
  }
  return val;
};

</script>

<template>
  <div class="space-y-6 pb-20 p-1">
    <!-- Section: Itération Automatique -->
    <div v-if="paramDynamic && hasLinkedChildren" class="flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg p-3 mb-6 shadow-sm">
      <div class="flex items-center gap-2">
        <div class="p-1.5 bg-primary/20 rounded-md">
          <Icons.Repeat class="h-4 w-4 text-primary" />
        </div>
        <div>
          <p class="text-[10px] font-mono font-bold text-primary uppercase tracking-tighter">Mode Itération</p>
          <p class="text-[10px] text-primary/70 font-medium">Répéter ce bloc pour chaque item de la liste</p>
        </div>
      </div>
      <Button
        size="sm"
        :variant="element.data.isIterated ? 'default' : 'outline'"
        class="h-7 text-[10px] px-4 font-bold transition-all"
        :class="{ 'bg-primary text-black hover:bg-primary/90': element.data.isIterated }"
        @click="updateData('isIterated', !element.data.isIterated)"
      >
        {{ element.data.isIterated ? 'ACTIVÉ' : 'DÉSACTIVÉ' }}
      </Button>
    </div>

    <!-- Section: Gestion des Paramètres -->
    <div v-if="canAddParams" class="space-y-2">
      <div v-if="paramDynamic" class="mb-2">
        <button
          @click="showAddForm = !showAddForm"
          class="w-full flex items-center justify-between px-3 py-2 rounded bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all transition-colors group"
        >
          <div class="flex items-center gap-2">
            <Plus class="w-3.5 h-3.5" />
            <span class="text-[10px] font-mono font-bold uppercase tracking-tighter">Ajouter un paramètre</span>
          </div>
          <ChevronDown
            class="w-3 h-3 transition-transform duration-200"
            :class="{ 'rotate-180': showAddForm }"
          />
        </button>
      </div>

      <!-- Formulaire d'ajout de paramètre -->
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="max-h-0 opacity-0 overflow-hidden"
        enter-to-class="max-h-[1000px] opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="max-h-[1000px] opacity-100"
        leave-to-class="max-h-0 opacity-0 overflow-hidden"
      >
        <div v-if="showAddForm" class="bg-builder-bar-background/50 border border-builder-bar-border rounded-md p-3 space-y-4 mb-4 shadow-inner">
          <div class="space-y-3">
            <PropertyInput
              label="Label"
              v-model="newParam.label"
              placeholder="Ex: Titre, Couleur..."
            />

            <div class="grid grid-cols-2 gap-2">
              <div class="space-y-1.5 flex flex-col">
                <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Source</label>
                <Select v-model="(newParam.type as any).source" :modal="false">
                   <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
                      <SelectValue placeholder="Source" />
                   </SelectTrigger>
                   <SelectContent>
                      <SelectItem v-for="opt in filteredSourceOptions" :key="opt.value" :value="opt.value">
                        <div class="flex items-center gap-2">
                          <component :is="opt.icon" class="h-3 w-3" />
                          <span class="text-[10px]">{{ opt.label }}</span>
                        </div>
                      </SelectItem>
                   </SelectContent>
                </Select>
              </div>

              <div class="flex items-end pb-0.5 justify-center bg-builder-input-bg border border-builder-bar-border rounded h-7 mt-auto">
                  <div class="flex items-center space-x-2">
                    <Checkbox id="new-required" :checked="newParam.required" @update:checked="(val: any) => newParam.required = !!val" />
                    <label for="new-required" class="text-[10px] font-mono font-bold text-builder-bar-text/60 uppercase tracking-tighter cursor-pointer">Requis</label>
                  </div>
              </div>
            </div>
          </div>
          <!-- Configuration dynamique selon la Source -->
          <div v-if="(newParam.type as any).source === 'static'" class="space-y-1.5">
            <PropertyInput
              label="Valeur"
              v-model="(newParam.type as any).value"
              placeholder="Valeur initiale..."
            />
          </div>

          <div v-if="(newParam.type as any).source === 'image'" class="space-y-1.5">
            <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Choisir une image</label>
            <div class="flex flex-row items-end gap-6 bg-builder-input-bg border border-builder-bar-border rounded p-2">
              <CompositionMediaPicker
                :model-value="(newParam.type as any).id"
                :allowed-types="['image']"
                @update:model-value="changeMediaAdd($event)"
              />
            </div>
          </div>

          <div v-if="(newParam.type as any).source === 'contenus'" class="space-y-4">
            <div class="grid grid-cols-2 gap-2">
              <div class="space-y-1 flex flex-col">
                <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Contenu</label>
                <Select :model-value="(newParam.type as any).contentTypeId" :modal="false" @update:model-value="(val) => handleSelectChange(val)">
                  <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
                    <SelectValue placeholder="Choisir..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="opt in contentTypeOptions?.results" :key="opt.id" :value="opt.id">
                      <span class="text-[10px]">{{ opt.name }}</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div class="space-y-1 flex flex-col">
                <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Mode</label>
                <Select :model-value="(newParam.type as any).config.mode" :modal="false" @update:model-value="(val) => (newParam.type as any).config.mode = val">
                  <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
                    <SelectValue placeholder="Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="mode in modeOptions" :key="mode.value" :value="mode.value">
                      <span class="text-[10px]">{{ mode.label }}</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <!-- Mode: Single -->
            <div v-if="(newParam.type as any).config.mode === 'single'" class="space-y-1 flex flex-col">
              <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Entrée</label>
              <Select
                :model-value="(newParam.type as any).config.entryId"
                :modal="false"
                @update:model-value="(val) => (newParam.type as any).config.entryId = val"
                :disabled="!isContentTypeSelected"
              >
                <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="entry in newContentEntries?.results" :key="entry.id" :value="entry.id">
                    <span class="text-[10px]">{{ entry.id }} - {{ (entry.data_json as any).title || 'Sans titre' }}</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Mode: Query -->
            <div v-if="(newParam.type as any).config.mode === 'query'" class="space-y-3">
              <PropertyInput
                label="Limite"
                v-model.number="(newParam.type as any).config.limit"
                type="number"
                placeholder="Illimité"
              />
              <div class="grid grid-cols-2 gap-2">
                <PropertyInput
                  label="Tri"
                  v-model="(newParam.type as any).config.sortBy"
                  placeholder="Champ"
                />
                <div class="space-y-1 flex flex-col">
                  <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Ordre</label>
                  <Select
                    v-model="(newParam.type as any).config.order"
                    :modal="false"
                  >
                    <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
                      <SelectValue placeholder="Ordre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem v-for="opt in orderOptions" :key="opt.value" :value="opt.value">
                        <span class="text-[10px]">{{ opt.label }}</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div class="flex gap-2 pt-2 border-t border-builder-bar-border/30">
              <Button size="sm" class="flex-1 h-7 text-[10px] bg-primary text-black hover:bg-primary/90 font-bold" @click="addParameter">Ajouter</Button>
              <Button size="sm" variant="ghost" class="flex-1 h-7 text-[10px] hover:bg-white/5" @click="showAddForm = false">Annuler</Button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Liste des paramètres (Accordéon) -->
      <div v-if="element.params && element.params.length > 0" class="space-y-1">
        <div v-for="field in element.params" :key="field.name">
          <PropertyGroup
            :title="field.label"
            :open="expandedParam === field.name"
            @update:open="(val) => { if (val) toggleParam(field.name); else expandedParam = null; }"
          >
            <template #icon>
              <Type v-if="field.type.source === 'static'" class="h-3.5 w-3.5" />
              <ImageIcon v-else-if="field.type.source === 'image'" class="h-3.5 w-3.5" />
              <Database v-else class="h-3.5 w-3.5" />
            </template>

            <div v-if="editingParam && expandedParam === field.name" class="p-2 space-y-4 bg-builder-bar-background/30 rounded border border-builder-bar-border/50">
              <!-- Édition du Label -->
              <PropertyInput
                label="Label"
                v-model="editingParam.label"
              />

              <!-- Édition de la Configuration (Schema Type) -->
              <div class="space-y-3 pt-2 border-t border-builder-bar-border/30">
                <!-- Static Configuration -->
                <div v-if="editingParam.type.source === 'static'" class="space-y-1.5">
                  <PropertyInput
                    label="Valeur"
                    v-model="(editingParam.type as any).value"
                  />
                </div>

                <!-- Image Configuration -->
                <div v-if="editingParam.type.source === 'image'" class="space-y-2">
                  <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Image</label>
                  <div class="flex flex-row items-end gap-6 bg-builder-input-bg border border-builder-bar-border rounded p-2">
                    <CompositionMediaPicker
                      :model-value="(editingParam.type as any).id"
                      :allowed-types="['image']"
                      @update:model-value="changeMediaEditor($event)"
                    />
                  </div>
                </div>

                <!-- Contenus Configuration -->
                <div v-if="editingParam.type.source === 'contenus'" class="space-y-3">
                  <div class="grid grid-cols-2 gap-2">
                    <div class="space-y-1 flex flex-col">
                      <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Contenu</label>
                      <Select :model-value="(editingParam.type as any).contentTypeId" :modal="false" @update:model-value="handleEditingTypeChange">
                        <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem v-for="opt in contentTypeOptions?.results" :key="opt.id" :value="opt.id">
                            <span class="text-[10px]">{{ opt.name }}</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div class="space-y-1 flex flex-col">
                      <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Mode</label>
                      <Select :model-value="(editingParam.type as any).config.mode" :modal="false" @update:model-value="(val) => (editingParam!.type as any).config.mode = val">
                        <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
                          <SelectValue placeholder="Mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem v-for="mode in modeOptions" :key="mode.value" :value="mode.value">
                            <span class="text-[10px]">{{ mode.label }}</span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <!-- Mode: Single -->
                  <div v-if="(editingParam.type as any).config.mode === 'single'" class="space-y-1 flex flex-col">
                    <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Entrée</label>
                    <Select
                      :model-value="(editingParam.type as any).config.entryId"
                      :modal="false"
                      @update:model-value="(val) => {
                        (editingParam!.type as any).config.entryId = val;
                      }"
                      :disabled="!isEditingContentTypeSelected"
                    >
                      <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem v-for="entry in editingContentEntries?.results" :key="entry.id" :value="entry.id">
                          <span class="text-[10px]">{{ entry.id }} - {{ (entry.data_json as any).title || 'Sans titre' }}</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <!-- Mode: Query -->
                  <div v-if="(editingParam.type as any).config.mode === 'query'" class="space-y-3">
                    <PropertyInput
                      label="Limite"
                      v-model.number="(editingParam.type as any).config.limit"
                      type="number"
                      placeholder="Illimité"
                    />
                    <div class="grid grid-cols-2 gap-2">
                      <PropertyInput
                        label="Tri"
                        v-model="(editingParam.type as any).config.sortBy"
                        placeholder="Champ"
                      />
                      <div class="space-y-1 flex flex-col">
                        <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Ordre</label>
                        <Select
                          v-model="(editingParam.type as any).config.order"
                          :modal="false"
                        >
                          <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
                            <SelectValue placeholder="Ordre" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem v-for="opt in orderOptions" :key="opt.value" :value="opt.value">
                              <span class="text-[10px]">{{ opt.label }}</span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Footer de l'accordéon -->
              <div class="flex gap-2 pt-3 border-t border-builder-bar-border/30">
                <Button
                  size="sm"
                  variant="ghost"
                  class="flex-1 h-7 text-[10px] order-2 hover:bg-white/5"
                  @click="cancelParameterEdit"
                >
                  Annuler
                </Button>
                <Button
                  size="sm"
                  class="flex-1 h-7 text-[10px] bg-primary text-black hover:bg-primary/90 font-bold"
                  @click="saveParameterEdit"
                >
                  Modifier
                </Button>
                <Button
                  v-if="paramDynamic"
                  variant="ghost"
                  size="icon"
                  class="h-7 w-7 text-red-500 hover:bg-red-500/10 hover:text-red-400 shrink-0"
                  @click.stop="removeParameter(field.name)"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </PropertyGroup>
        </div>
      </div>
      <div v-else class="p-4 text-center border border-dashed border-builder-bar-border rounded text-builder-bar-text/40">
        <p class="text-[10px] font-mono uppercase tracking-widest">Aucun paramètre</p>
      </div>
    </div>

    <!-- Section: Liaison Parent-Enfant (Uniquement pour les conteneurs avec enfants) -->
    <div v-if="(element.family === 'container' || element.tag === 'AccordionBuilder') && element.children && element.children.length > 0" class="pt-4 border-t border-builder-bar-border/30">
      <PropertyGroup title="Liaison Enfants" :icon="LinkIcon" :open="true">
        <div class="space-y-4">
          <div v-for="child in element.children" :key="child.id" class="p-3 bg-builder-bar-background/30 rounded border border-builder-bar-border/50 space-y-3 mb-2">
            <div class="flex items-center justify-between border-b border-builder-bar-border/30 pb-2">
              <div class="flex items-center gap-2">
                <component :is="getIcon(child.icon)" class="h-3.5 w-3.5 text-primary/70" />
                <span class="text-[10px] font-mono font-bold text-builder-bar-text/80 uppercase tracking-tighter">{{ child.name }}</span>
              </div>
              <div v-if="child.family === 'container' || child.tag === 'AccordionBuilder'" class="flex items-center gap-2">
                 <Select
                    :model-value="(child.data as any).linkedQueryParamName"
                    :modal="false"
                    @update:model-value="(val) => updateChildLinkedQuery(child.id, val as string)"
                    @update:open="forceAriaHidden"
                 >
                    <SelectTrigger class="h-6 text-[9px] bg-builder-input-bg border-builder-bar-border w-28">
                      <SelectValue placeholder="Lier liste..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem :value="null">
                        <span class="text-[9px]">Aucune</span>
                      </SelectItem>
                      <SelectItem
                        v-for="p in element.params.filter(p => p.type.source === ValueSource.CONTENUS && (p.type as IContenusField).config.mode === 'query')"
                        :key="p.name"
                        :value="p.name"
                      >
                        <span class="text-[9px]">{{ p.label }}</span>
                      </SelectItem>
                    </SelectContent>
                 </Select>
              </div>
            </div>

            <div v-for="p in child.params" :key="p.name" class="space-y-2">
              <div class="flex items-center justify-between">
                <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">{{ p.label }}</label>
                <Button
                  size="sm"
                  variant="ghost"
                  class="h-6 text-[9px] px-2 font-bold transition-all"
                  :class="p.type.source === 'parent' ? 'bg-primary/20 text-primary hover:bg-primary/30' : 'hover:bg-white/5 opacity-50'"
                  @click="(e: MouseEvent) => {
                    updateChildParamSource(child.id, p.name, p.type.source === 'parent' ? ValueSource.STATIC : ValueSource.PARENT);
                    (e.currentTarget as HTMLElement)?.blur();
                  }"
                >
                  {{ p.type.source === 'parent' ? 'LIÉ' : 'LIER' }}
                </Button>
              </div>

              <div v-if="p.type.source === 'parent'" :key="`link-${child.id}-${p.name}`" class="pl-2 border-l border-primary/30 space-y-3 pt-1">
                <div class="space-y-1 flex flex-col">
                  <label class="text-[8px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Paramètre Parent</label>
                  <Select
                      :model-value="(p.type as IParentField).parentParamName"
                      :modal="false"
                      @update:model-value="(val) => updateChildParamSource(child.id, p.name, ValueSource.PARENT, val as string)"
                      @update:open="forceAriaHidden"
                   >
                      <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem v-for="pp in getCompatibleParentParams(p)" :key="pp.name" :value="pp.name">
                          <span class="text-[10px]">{{ pp.label }}</span>
                        </SelectItem>
                      </SelectContent>
                  </Select>
                </div>

                <!-- Si le paramètre parent est choisi ET de type CONTENUS, on demande le champ source (parentKey) -->
                <div v-if="(p.type as IParentField).parentParamName && ((p.type as IParentField).parentParamName === '_inherited_query' || element.params.find(pp => pp.name === (p.type as IParentField).parentParamName)?.type.source === ValueSource.CONTENUS)" class="space-y-1 flex flex-col">
                  <label class="text-[8px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Champ Source (CMS)</label>
                   <Select
                    :model-value="(p.type as IParentField).parentKey"
                    :modal="false"
                    @update:model-value="(val) => updateChildParamSource(child.id, p.name, ValueSource.PARENT, (p.type as IParentField).parentParamName, val as string)"
                    @update:open="forceAriaHidden"
                  >
                    <SelectTrigger
                      class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border"
                      :class="{ 'border-red-500/50': !(p.type as IParentField).parentKey }"
                    >
                      <SelectValue placeholder="Choisir le champ..." />
                    </SelectTrigger>
                    <SelectContent :modal="false">
                      <SelectItem v-for="cf in getCompatibleCMSFields((p.type as IParentField).parentParamName, p, child.id)" :key="cf.value" :value="cf.value">
                        <span class="text-[10px]">{{ cf.label }}</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p v-if="!(p.type as IParentField).parentKey" class="text-[8px] text-red-400 italic font-medium">Sélectionnez un champ pour activer la liaison</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PropertyGroup>
    </div>

    <!-- Section: Paramètres Spécifiques (ImageBuilder etc.) -->
    <div v-if="element.tag === 'ImageBuilder'" class="pt-4 border-t border-builder-bar-border/30">
      <PropertyGroup title="Système Image" :icon="Icons.Image" :open="true">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-2">
            <PropertyInput
              label="Largeur"
              :model-value="(element.data.width as string | number)"
              @update:model-value="(val) => updateData('width', val)"
              placeholder="ex: 100% ou 300"
            />
            <PropertyInput
              label="Hauteur"
              :model-value="(element.data.height as string | number)"
              @update:model-value="(val) => updateData('height', val)"
              placeholder="ex: auto ou 300"
            />
          </div>
          <div class="space-y-1 flex flex-col">
            <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Ajustement</label>
            <Select :model-value="(element.data.objectFit as string)" :modal="false" @update:model-value="(val) => val && updateData('objectFit', val as string)">
              <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
                <SelectValue placeholder="Fit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="opt in objectFitOptions" :key="opt.value" :value="opt.value">
                   <span class="text-[10px]">{{ opt.label }}</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PropertyGroup>
    </div>

    <!-- Section: Icône Builder -->
    <div v-if="element.tag === 'IconBuilder'" class="pt-4 border-t border-builder-bar-border/30">
      <PropertyGroup title="Système Icône" :icon="Icons.Type" :open="true">
        <div class="grid grid-cols-2 gap-2">
          <PropertyInput
            type="number"
            label="Taille (px)"
            :model-value="(element.data.size as number)"
            @update:model-value="(val) => updateData('size', parseInt(val.toString()))"
          />
          <PropertyInput
            type="number"
            label="Épaisseur"
            :model-value="(element.data.strokeWidth as number)"
            @update:model-value="(val) => updateData('strokeWidth', parseInt(val.toString()))"
          />
        </div>
      </PropertyGroup>
    </div>

    <!-- Section: Formulaire (Saisie) -->
    <div v-if="element.family === 'input'" class="pt-4 border-t border-builder-bar-border/30">
      <PropertyGroup title="Système Champ" :icon="Icons.MousePointer2" :open="true">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1 flex flex-col">
              <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Type de saisie</label>
              <Select :model-value="(element.data.type as string)" :modal="false" @update:model-value="(val) => val && updateData('type', val as string)">
                <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="opt in inputTypeOptions" :key="opt.value" :value="opt.value">
                    <span class="text-[10px]">{{ opt.label }}</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="flex items-center space-x-2 pt-4">
              <Checkbox id="required-sys" :checked="(element.data.required as boolean)" @update:checked="(val: boolean | 'indeterminate') => updateData('required', !!val)" />
              <label for="required-sys" class="text-[10px] font-mono font-bold text-builder-bar-text/60 uppercase tracking-tighter cursor-pointer">Requis</label>
            </div>
          </div>
        </div>
      </PropertyGroup>
    </div>

    <!-- Section: Actions (Boutons etc.) -->
    <div v-if="element.family === 'interactive'" class="pt-4 border-t border-builder-bar-border/30">
      <PropertyGroup title="Actions & Liens" :icon="Icons.MousePointer2" :open="true">
        <div v-if="element.data.cliquable && typeof element.data.cliquable === 'object'" class="space-y-4">
          <div class="space-y-1 flex flex-col">
            <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Action au clic</label>
            <Select :model-value="((element.data.cliquable as CliquableAction).action)" @update:model-value="(val) => val && updateData('cliquable', { ...(element.data.cliquable as object), action: val as CliquableAction['action'] })">
              <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NAVIGATE_TO">
                  <span class="text-[10px]">Naviguer vers URL</span>
                </SelectItem>
                <SelectItem value="SHOW_ALERT">
                  <span class="text-[10px]">Afficher Alerte</span>
                </SelectItem>
                <SelectItem value="TOGGLE_VISIBILITY">
                  <span class="text-[10px]">Toggle Visibilité</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div v-if="(element.data.cliquable as CliquableAction).action === 'NAVIGATE_TO'" class="space-y-1">
            <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">URL de destination</label>
            <div class="relative">
              <Popover v-model:open="urlSearchOpen">
                <PopoverTrigger as-child>
                  <Button
                    ref="urlSearchRef"
                    variant="outline"
                    role="combobox"
                    class="input-custom justify-between w-full font-normal h-8 text-[10px] bg-builder-input-bg border-builder-bar-border"
                  >
                    <span class="truncate">
                      {{ (element.data.cliquable as any).action_params?.url || "Saisir ou choisir une page..." }}
                    </span>
                    <ChevronsUpDown class="ml-2 h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent :style="{ width: `${urlSearchWidth}px` }" class="p-0 border-builder-bar-border bg-builder-bar-background shadow-2xl">
                  <Command class="bg-builder-bar-background">
                    <CommandInput placeholder="Rechercher une page..." class="h-8 text-[10px] text-builder-bar-text" />
                    <CommandEmpty class="py-2 text-[10px] text-center text-builder-bar-text/40">Aucune page trouvée.</CommandEmpty>
                    <CommandList class="custom-scrollbar max-h-[200px] overflow-y-auto">
                      <CommandGroup heading="Pages existantes" class="text-[9px] text-primary uppercase font-bold px-2 py-1">
                        <CommandItem
                          v-for="item in navItemsResults"
                          :key="item.value"
                          :value="item.label"
                          class="text-[10px] text-builder-bar-text hover:bg-primary hover:text-white cursor-pointer px-2 py-1.5 flex items-center gap-2"
                          @select="() => {
                            updateData('cliquable', { ...(element.data.cliquable as object), action_params: { url: item.value } });
                            urlSearchOpen = false;
                          }"
                        >
                          <Check
                            :class="cn(
                              'h-3 w-3',
                              (element.data.cliquable as any).action_params?.url === item.value ? 'opacity-100' : 'opacity-0'
                            )"
                          />
                          {{ item.label }}
                          <span class="text-[8px] opacity-40 italic ml-auto">{{ item.value }}</span>
                        </CommandItem>
                      </CommandGroup>

                      <CommandSeparator class="bg-builder-bar-border/30" />

                      <CommandGroup heading="Saisie personnalisée" class="text-[9px] text-primary uppercase font-bold px-2 py-1">
                         <div class="p-2">
                           <input
                             type="text"
                             :value="(element.data.cliquable as any).action_params?.url"
                             @input="(e) => updateData('cliquable', { ...(element.data.cliquable as object), action_params: { url: (e.target as HTMLInputElement).value } })"
                             @keydown.enter="urlSearchOpen = false"
                             placeholder="Ex: https://google.com"
                             class="w-full bg-builder-bar-background border border-builder-bar-border rounded px-2 py-1 text-[10px] focus:outline-none focus:border-primary"
                           />
                         </div>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div v-if="(element.data.cliquable as CliquableAction).action === 'SHOW_ALERT'" class="space-y-1">
            <PropertyInput
              label="Message"
              :model-value="((element.data.cliquable as Extract<CliquableAction, { action: 'SHOW_ALERT' }>).action_params?.message)"
              @update:model-value="(val) => updateData('cliquable', { ...(element.data.cliquable as object), action_params: { message: val } })"
              placeholder="Message d'alerte..."
            />
          </div>

          <div v-if="(element.data.cliquable as CliquableAction).action === 'TOGGLE_VISIBILITY'" class="space-y-1 flex flex-col">
            <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Composant cible</label>
            <Select
              :model-value="((element.data.cliquable as Extract<CliquableAction, { action: 'TOGGLE_VISIBILITY' }>).action_params?.targetId)"
              @update:model-value="(val) => val && updateData('cliquable', { ...(element.data.cliquable as object), action_params: { targetId: val } })"
            >
              <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
                <SelectValue placeholder="Choisir un composant..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-if="allComponents.length === 0" disabled value="none">
                  <span class="text-[10px]">Aucun trouvé</span>
                </SelectItem>
                <SelectItem
                  v-for="comp in allComponents"
                  :key="comp.stableId"
                  :value="comp.stableId"
                >
                  <div class="flex flex-col gap-0.5">
                    <span class="text-[10px] font-medium">{{ comp.name || comp.tag }}</span>
                    <!-- <span class="text-[8px] text-builder-bar-text/50 font-mono">id: {{ comp.stableId }}</span> -->
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PropertyGroup>
    </div>

    <!-- Section: Slider -->
    <div v-if="element.tag === 'SliderBuilder'" class="pt-4 border-t border-builder-bar-border/30">
      <PropertyGroup title="Système Slider" :icon="Icons.Layout" :open="true">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-2">
            <PropertyInput
              type="number"
              label="Vitesse (ms)"
              :model-value="getDataValue(element.data.speed)"
              @update:model-value="(val) => updateData('speed', parseInt(val.toString()))"
            />
            <div class="space-y-1 flex flex-col">
              <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Lissage</label>
              <Select :model-value="getDataValue(element.data.transitionEase) || 'ease-in-out'" @update:model-value="(val) => val && updateData('transitionEase', val as string)">
                <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
                  <SelectValue placeholder="Ease" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="opt in easeOptions" :key="opt.value" :value="opt.value">
                    <span class="text-[10px]">{{ opt.label }}</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
             <div class="flex items-center space-x-2">
                <Checkbox id="slider-autoplay" :checked="!!getDataValue(element.data.autoPlay)" @update:checked="(val: any) => updateData('autoPlay', !!val)" />
                <label for="slider-autoplay" class="text-[10px] font-mono font-bold text-builder-bar-text/60 uppercase tracking-tighter cursor-pointer">Autoplay</label>
             </div>
             <div class="flex items-center space-x-2">
                <Checkbox id="slider-loop" :checked="!!getDataValue(element.data.loop)" @update:checked="(val: any) => updateData('loop', !!val)" />
                <label for="slider-loop" class="text-[10px] font-mono font-bold text-builder-bar-text/60 uppercase tracking-tighter cursor-pointer">Boucle</label>
             </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
             <div class="flex items-center space-x-2">
                <Checkbox id="slider-pagination" :checked="getDataValue(element.data.showPagination) !== false" @update:checked="(val: any) => updateData('showPagination', !!val)" />
                <label for="slider-pagination" class="text-[10px] font-mono font-bold text-builder-bar-text/60 uppercase tracking-tighter cursor-pointer">Pagination</label>
             </div>
             <div class="flex items-center space-x-2">
                <Checkbox id="slider-arrows" :checked="getDataValue(element.data.showArrows) !== false" @update:checked="(val: any) => updateData('showArrows', !!val)" />
                <label for="slider-arrows" class="text-[10px] font-mono font-bold text-builder-bar-text/60 uppercase tracking-tighter cursor-pointer">Flèches</label>
             </div>
          </div>
        </div>
      </PropertyGroup>
    </div>

    <!-- Section: Accordion / FAQ -->
    <div v-if="element.tag === 'AccordionBuilder'" class="pt-4 border-t border-builder-bar-border/30">
      <PropertyGroup title="Système Accordéon" :icon="Icons.List" :open="true">
        <div class="space-y-4">
          <PropertyInput
            label="Titre / Question"
            :model-value="(element.data.title as string)"
            @update:model-value="(val) => updateData('title', val.toString())"
          />
          <div class="space-y-1 flex flex-col">
            <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Contenu / Réponse</label>
            <textarea
              :value="getDataValue(element.data.content) || ''"
              @input="(e: Event) => updateData('content', (e.target as HTMLTextAreaElement).value)"
              rows="4"
              class="w-full text-[10px] px-2 py-1.5 bg-builder-input-bg border border-builder-bar-border rounded text-builder-bar-text/80 placeholder-builder-bar-text/30 resize-none focus:outline-none focus:border-primary/50 leading-relaxed font-medium"
              placeholder="Entrez le contenu ici..."
            />
          </div>
          <div class="grid grid-cols-2 gap-2 items-end">
            <PropertyInput
              type="number"
              label="Transition (ms)"
              :model-value="getDataValue(element.data.transitionSpeed)"
              @update:model-value="(val) => updateData('transitionSpeed', parseInt(val.toString()))"
            />
            <div class="flex items-center space-x-2 pb-1.5">
              <Checkbox id="accordion-open" :checked="!!getDataValue(element.data.isOpen)" @update:checked="(val: any) => updateData('isOpen', !!val)" />
              <label for="accordion-open" class="text-[10px] font-mono font-bold text-builder-bar-text/60 uppercase tracking-tighter cursor-pointer">Ouvert</label>
            </div>
          </div>
        </div>
      </PropertyGroup>
    </div>

    <!-- Section: Lien -->
    <div v-if="element.tag === 'LinkBuilder'" class="pt-4 border-t border-builder-bar-border/30">
      <PropertyGroup title="Système Lien" :icon="Icons.ExternalLink" :open="true">
        <div class="space-y-4">
          <PropertyInput
            label="Texte"
            :model-value="getDataValue(element.data.text)"
            @update:model-value="(val) => updateDataAndParam('text', String(val))"
          />
          <div class="space-y-1">
            <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">URL de destination</label>
            <div class="relative">
              <Popover v-model:open="urlSearchOpen">
                <PopoverTrigger as-child>
                  <Button
                    ref="urlSearchRef"
                    variant="outline"
                    role="combobox"
                    class="input-custom justify-between w-full font-normal h-8 text-[10px] bg-builder-input-bg border-builder-bar-border"
                  >
                    <span class="truncate">
                      {{ (element.data.url as string) || "Saisir ou choisir une page..." }}
                    </span>
                    <ChevronsUpDown class="ml-2 h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent :style="{ width: `${urlSearchWidth}px` }" class="p-0 border-builder-bar-border bg-builder-bar-background shadow-2xl">
                  <Command class="bg-builder-bar-background">
                    <CommandInput placeholder="Rechercher une page..." class="h-8 text-[10px] text-builder-bar-text" />
                    <CommandEmpty class="py-2 text-[10px] text-center text-builder-bar-text/40">Aucune page trouvée.</CommandEmpty>
                    <CommandList class="custom-scrollbar max-h-[200px] overflow-y-auto">
                      <CommandGroup heading="Pages existantes" class="text-[9px] text-primary uppercase font-bold px-2 py-1">
                        <CommandItem
                          v-for="item in navItemsResults"
                          :key="item.value"
                          :value="item.label"
                          class="text-[10px] text-builder-bar-text hover:bg-primary hover:text-white cursor-pointer px-2 py-1.5 flex items-center gap-2"
                          @select="() => {
                            updateDataAndParam('url', item.value);
                            urlSearchOpen = false;
                          }"
                        >
                          <Check
                            :class="cn(
                              'h-3 w-3',
                              element.data.url === item.value ? 'opacity-100' : 'opacity-0'
                            )"
                          />
                          {{ item.label }}
                          <span class="text-[8px] opacity-40 italic ml-auto">{{ item.value }}</span>
                        </CommandItem>
                      </CommandGroup>

                      <CommandSeparator class="bg-builder-bar-border/30" />

                      <CommandGroup heading="Saisie personnalisée" class="text-[9px] text-primary uppercase font-bold px-2 py-1">
                         <div class="p-2">
                           <input
                             type="text"
                             :value="(element.data.url as string)"
                             @input="(e) => updateDataAndParam('url', (e.target as HTMLInputElement).value)"
                             @keydown.enter="urlSearchOpen = false"
                             placeholder="Ex: https://google.com"
                             class="w-full bg-builder-bar-background border border-builder-bar-border rounded px-2 py-1 text-[10px] focus:outline-none focus:border-primary"
                           />
                         </div>
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div class="space-y-1 flex flex-col">
            <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Cible</label>
            <Select :model-value="getDataValue(element.data.target)" @update:model-value="(val) => val && updateData('target', val as string)">
              <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
                <SelectValue placeholder="Choisir..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_self">
                  <span class="text-[10px]">Même fenêtre</span>
                </SelectItem>
                <SelectItem value="_blank">
                  <span class="text-[10px]">Nouvelle fenêtre</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PropertyGroup>
    </div>

  </div>
</template>
