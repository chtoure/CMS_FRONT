<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { ref, inject, computed, watch, onUnmounted } from 'vue';
import { useQueryClient } from "@tanstack/vue-query";
import type { AnyComponentInstance } from '../../type/component';
import { ValueSource, type IComponentParams, type IContenusField, type IImageField, type IStaticField, type IParentField } from '../../type/params';
import { FieldType } from '../../type/field';

import IterationModeEditor from './parameters/IterationModeEditor.vue';
import CustomParametersEditor from './parameters/CustomParametersEditor.vue';
import ChildrenBindingEditor from './parameters/ChildrenBindingEditor.vue';
import ImageParams from './parameters/ImageParams.vue';
import IconParams from './parameters/IconParams.vue';
import InputParams from './parameters/InputParams.vue';
import InteractiveParams from './parameters/InteractiveParams.vue';
import SliderParams from './parameters/SliderParams.vue';
import AccordionParams from './parameters/AccordionParams.vue';
import LinkParams from './parameters/LinkParams.vue';
import ButtonParams from './parameters/ButtonParams.vue';
import BgImageParam from './parameters/BgImageParam.vue';

import { useGetContentTypes } from '../../hook/content-type';
import { useGetMediaList } from '../../hook/media';
import { Type, Image as ImageIcon, Database } from 'lucide-vue-next';
import api from '../../api/fetchConfig';
import { handleResponse } from '../../api/fetchConfig';

const queryClient = useQueryClient();

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

const { data: contentTypeOptions, refetch: refetchContentTypes } = useGetContentTypes();
const mediaQuery = useGetMediaList({});

const COMPONENT_SOURCE_MAPPING: Record<string, ValueSource[]> = {
  'TextBuilder': [ValueSource.STATIC],
  'InputBuilder': [ValueSource.STATIC],
  'ImageBuilder': [ValueSource.STATIC, ValueSource.IMAGE],
  'CardBuilder': [ValueSource.STATIC, ValueSource.IMAGE, ValueSource.CONTENUS],
};

const sourceOptions = [
  { label: 'Statique', value: ValueSource.STATIC, icon: Type },
  { label: 'Image', value: ValueSource.IMAGE, icon: ImageIcon },
  { label: 'Contenus', value: ValueSource.CONTENUS, icon: Database },
];



const orderOptions = [
  { label: 'Croissant', value: 'asc' },
  { label: 'Décroissant', value: 'desc' },
];

const modeOptions = [
  { label: 'Élément unique', value: 'single' },
  { label: 'Requête (Liste)', value: 'query' },
];

const allowedSources = computed(() => COMPONENT_SOURCE_MAPPING[props.element.tag] || []);
const canAddParams = computed(() => allowedSources.value.length > 0);
const paramDynamic = computed(() => props.element.family === 'container');
const hasLinkedChildren = computed(() => {
  if (!props.element.children) return false;

  // 1. Un container enfant est lié via linkedQueryParamName
  const hasLinkedContainer = props.element.children.some(child => (child.data as any).linkedQueryParamName);

  // 2. Un enfant feuille a un de ses paramètres liés à un param query direct du parent
  const queryParamNames = (props.element.params || [])
    .filter(p => p.type.source === ValueSource.CONTENUS && (p.type as IContenusField).config.mode === 'query')
    .map(p => p.name);

  const hasLinkedLeaf = props.element.children.some(child => {
    if (child.family === 'container') return false; // Déjà géré par hasLinkedContainer

    return (child.params || []).some(p => {
      // Si la feuille a un paramètre qui tire sa source du parent
      if (p.type.source === ValueSource.PARENT) {
        const parentField = p.type as IParentField;
        // Et que ce paramètre parent est un paramètre de type "query" (contenu > liste)
        return queryParamNames.includes(parentField.parentParamName);
      }
      return false;
    });
  });

  return hasLinkedContainer || hasLinkedLeaf;
});

const filteredSourceOptions = computed(() => {
  return sourceOptions.filter(opt => allowedSources.value.includes(opt.value as ValueSource));
});

const blockCMSData = computed({
  get: () => builderState?.cmsCache.value || {},
  set: (val) => {
    if (builderState) builderState.cmsCache.value = val;
  }
});

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

  if (JSON.stringify(blockCMSData.value[id]) !== JSON.stringify(resolvedData)) {
    blockCMSData.value[id] = resolvedData;
  }
};

const fetchBlockCMSData = async () => {
  const params = props.element.params || [];
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

  const queryParams = params.filter(p => p.type.source === ValueSource.CONTENUS && (p.type as IContenusField).config.mode === 'query');

  if (queryParams.length > 0) {
    await Promise.all(queryParams.map(async (p) => {
      const type = p.type as IContenusField;
      const config = type.config as any;

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
            if (entry.id !== undefined && entry.id !== null) {
              rawCMSEntries.value[entry.id] = entry;
            }
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

            if (entry.id !== undefined && entry.id !== null) {
              blockCMSData.value[entry.id] = resolvedData;
            }
            return resolvedData;
          });

          blockCMSData.value[p.name] = resolvedResults;
        }
      } catch (err) {
        console.error(`Failed to fetch query for param ${p.name}`, err);
      }
    }));
  }
};

watch(() => [props.element.id, JSON.stringify(props.element.data), mediaQuery.data.value, contentTypeOptions.value], async () => {
  await fetchBlockCMSData();
}, { immediate: true });

const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
  if (event.type === 'updated' && event.query.queryKey[0] === 'content-entry') {
    const id = event.query.queryKey[1] as number;
    if (rawCMSEntries.value[id]) {
        rawCMSEntries.value[id] = event.query.state.data;
        resolveEntryMedia(id);
    }
  }
});

onUnmounted(() => {
  unsubscribe();
});

const forceAriaHidden = (isOpen: boolean) => {
  if (isOpen) {
    window.document.getElementById('app')?.setAttribute('aria-hidden', 'false');
  }
};

const propagateValueToChildren = (children: AnyComponentInstance[], parentParamName: string, newValue: any): AnyComponentInstance[] => {
  const params = props.element.params || [];
  const parentParam = params.find(p => p.name === parentParamName);
  const isCMS = parentParam?.type.source === ValueSource.CONTENUS;
  const parentIsQuery = isCMS && parentParam != null && (parentParam.type as IContenusField).config.mode === 'query';

  let entryData: any = null;
  if (isCMS && !parentIsQuery && newValue) {
    // Cas single CMS : newValue est un entryId, on récupère les données dans le cache
    entryData = blockCMSData.value[newValue];
  }

  return children.map(child => {
    const newChildData = { ...child.data };
    let hasChanged = false;

    const childParams = child.params || [];
    childParams.forEach(p => {
      if (p.type.source === ValueSource.PARENT && p.type.parentParamName === parentParamName) {
        const pt = p.type as IParentField;

        if (parentParamName === '_inherited_query') {
          // Héritage via container enfant lié : newValue est l'_inherited_item courant
          if (pt.parentKey && newValue) {
            newChildData[p.name] = (newValue as any)[pt.parentKey];
            hasChanged = true;
          }
        } else if (parentIsQuery) {
          // NOUVEAU : param query direct → aperçu avec le 1er item de la liste
          const list = blockCMSData.value[parentParamName];
          const firstItem = Array.isArray(list) ? list[0] : null;
          if (pt.parentKey && firstItem) {
            newChildData[p.name] = (firstItem as any)[pt.parentKey];
            hasChanged = true;
          }
        } else if (isCMS) {
          // Param single CMS
          if (pt.parentKey && entryData) {
            newChildData[p.name] = (entryData as any)[pt.parentKey];
            hasChanged = true;
          }
        } else {
          // Param statique : transmission directe
          newChildData[p.name] = newValue;
          hasChanged = true;
        }
      }
    });

    let updatedChild = hasChanged ? { ...child, data: newChildData } : child;

    // Propagation du bgImage pour les containers enfants liés via linkedBgImageKey
    if (updatedChild.family === 'container') {
      const linkedBgKey = (updatedChild.data as any).linkedBgImageKey;
      const linkedQueryName = (updatedChild.data as any).linkedQueryParamName;
      if (linkedBgKey && linkedQueryName === parentParamName && parentIsQuery) {
        const list = blockCMSData.value[parentParamName];
        const firstItem = Array.isArray(list) ? list[0] : null;
        const rawUrl = firstItem ? firstItem[linkedBgKey] : undefined;
        const newBgImage = rawUrl
          ? ({ type: 'media', url: rawUrl, value: { url: rawUrl } } as any)
          : undefined;
        updatedChild = {
          ...updatedChild,
          styles: { ...updatedChild.styles, bgImage: newBgImage }
        };
      }
    }

    if (updatedChild.children && updatedChild.children.length > 0) {
      updatedChild.children = propagateValueToChildren(updatedChild.children, parentParamName, newValue);
    }

    return updatedChild;
  });
};

const updateData = (key: string, value: string | number | boolean | object) => {
  if (!builderState) return;
  const newData = { ...props.element.data, [key]: value };

  const updateNode = (nodes: AnyComponentInstance[]): AnyComponentInstance[] => {
    return nodes.map((node: AnyComponentInstance): AnyComponentInstance => {
      if (node.id === props.element.id) {
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

const updateDataAndParam = (key: string, value: string) => {
  if (!builderState) return;

  const updateNode = (nodes: AnyComponentInstance[]): AnyComponentInstance[] => {
    return nodes.map((node: AnyComponentInstance): AnyComponentInstance => {
      if (node.id === props.element.id) {
        const newData = { ...node.data, [key]: value };
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

const updateChildParamSource = (childId: string, paramName: string, source: ValueSource, parentParamName?: string, parentKey?: string) => {
  if (!builderState) return;
  if (source === ValueSource.PARENT) refetchContentTypes();

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
              const parentIsQuery = isCMS
                && currentParentName !== '_inherited_query'
                && parentParam?.type.source === ValueSource.CONTENUS
                && (parentParam.type as IContenusField).config.mode === 'query';

              const originalType = p.type.source === ValueSource.PARENT ? (p.type as IParentField).targetType : (p.type.source as any);

              const newType: IParentField = {
                source: ValueSource.PARENT,
                parentParamName: currentParentName,
                parentKey: parentKey || (p.type.source === ValueSource.PARENT ? (p.type as IParentField).parentKey : undefined),
                targetType: originalType
              };

              if (currentParentName) {
                if (!isCMS) {
                  // Param statique : on copie la valeur directement
                  node.data[paramName] = props.element.data[currentParentName];
                } else if (newType.parentKey) {
                  let entryData: any = null;

                  if (currentParentName === '_inherited_query') {
                    // Héritage via container enfant lié
                    entryData = props.element.data._inherited_item;
                  } else if (parentIsQuery) {
                    // NOUVEAU : param query direct → on prend le 1er item pour l'aperçu
                    const list = blockCMSData.value[currentParentName];
                    entryData = Array.isArray(list) ? list[0] : null;
                  } else {
                    // Param single CMS
                    entryData = blockCMSData.value[props.element.data[currentParentName] as any];
                  }

                  if (entryData) {
                    node.data[paramName] = entryData[newType.parentKey];
                  }
                }
              }
              return { ...p, type: newType };
            } else {
              const originalType = p.type.source === ValueSource.PARENT ? (p.type as IParentField).targetType : p.type.source;
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

const updateChildLinkedQuery = (childId: string, queryParamName: string | null) => {
  if (!builderState) return;

  const updateNode = (nodes: AnyComponentInstance[]): AnyComponentInstance[] => {
    return nodes.map((node) => {
      if (node.id === props.element.id && node.children) {
        return {
          ...node,
          children: node.children.map(child => {
            if (child.id === childId) {
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

const updateChildBgImageKey = (childId: string, fieldKey: string | null) => {
  if (!builderState) return;

  const updateNode = (nodes: AnyComponentInstance[]): AnyComponentInstance[] => {
    return nodes.map((node) => {
      if (node.id === props.element.id && node.children) {
        return {
          ...node,
          children: node.children.map(child => {
            if (child.id !== childId) return child;

            const linkedQueryName = (child.data as any).linkedQueryParamName;
            let newBgImage: any = undefined;

            if (fieldKey && linkedQueryName) {
              const list = blockCMSData.value[linkedQueryName];
              const firstItem = Array.isArray(list) ? list[0] : null;
              const rawUrl = firstItem ? firstItem[fieldKey] : undefined;
              if (rawUrl) {
                newBgImage = { type: 'media', url: rawUrl, value: { url: rawUrl } } as any;
              }
            }

            return {
              ...child,
              data: { ...child.data, linkedBgImageKey: fieldKey || undefined },
              styles: {
                ...child.styles,
                bgImage: fieldKey ? newBgImage : undefined
              }
            };
          })
        };
      }
      if (node.children) return { ...node, children: updateNode(node.children) };
      return node;
    });
  };

  builderState.pageTree.value = updateNode(builderState.pageTree.value);
};

const saveParameterEdit = (editingParam: IComponentParams) => {
  if (!editingParam || !builderState) return;

  const updateNode = (nodes: AnyComponentInstance[]): AnyComponentInstance[] => {
    return nodes.map((node) => {
      if (node.id === props.element.id) {
        let newValue: any = null;
        if (editingParam.type.source === ValueSource.STATIC) {
          newValue = editingParam.type.value;
        } else if (editingParam.type.source === ValueSource.IMAGE) {
          newValue = editingParam.type.src;
        } else if (editingParam.type.source === ValueSource.CONTENUS) {
          const type = editingParam.type as IContenusField;
          newValue = type.config.mode === 'single' ? type.config.entryId : type.contentTypeId;
        }

        const params = node.params || [];
        const newNode = {
          ...node,
          params: params.map(p => p.name === editingParam.name ? editingParam : p),
          data: {
            ...node.data,
            [editingParam.name]: newValue
          }
        };

        if (editingParam.name && newNode.children) {
          newNode.children = propagateValueToChildren(newNode.children, editingParam.name, newValue);
        }
        return newNode;
      }
      if (node.children) return { ...node, children: updateNode(node.children) };
      return node;
    });
  };

  builderState.pageTree.value = updateNode(builderState.pageTree.value);
};

const addParameter = (param: IComponentParams, name: string) => {
  if (!builderState) return;

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
};

const getCompatibleParentParams = (childParam: IComponentParams, childElement?: AnyComponentInstance) => {
  const childType = childParam.type.source === ValueSource.PARENT
                    ? (childParam.type as IParentField).targetType
                    : childParam.type.source;

  const params = [...(props.element.params || [])];
  const linkedQuery = (props.element.data as any).linkedQueryParamName;

  // Injection du param virtuel '_inherited_query' (comportement existant)
  if (linkedQuery) {
    params.push({
      name: '_inherited_query',
      label: `Liste: ${linkedQuery}`,
      type: { source: ValueSource.CONTENUS, contentTypeId: 0, config: { mode: 'single' } }
    } as any);
  }

  // Un composant feuille (non-container, y compris AccordionBuilder) peut hériter d'un param query
  const isLeafChild = childElement
    ? childElement.family !== 'container'
    : false;

  return params.filter(p => {
    const isQuery = p.type.source === ValueSource.CONTENUS &&
                    (p.type as IContenusField).config.mode === 'query';

    // Les params query ne sont exposés qu'aux composants feuilles
    if (isQuery && !isLeafChild) return false;

    if (childType === ValueSource.STATIC) {
      return p.type.source === ValueSource.STATIC || p.type.source === ValueSource.CONTENUS;
    }
    if (childType === ValueSource.IMAGE) {
      return p.type.source === ValueSource.IMAGE || p.type.source === ValueSource.CONTENUS;
    }
    return false;
  });
};

</script>

<template>
  <div class="space-y-6 pb-20 p-1">
    <IterationModeEditor
      v-if="paramDynamic && hasLinkedChildren"
      :element="element"
      @update-data="updateData"
    />

    <AccordionParams :element="element" @update-data="updateData" />

    <ButtonParams :element="element" @update-data="updateData" @update-data-param="updateDataAndParam" />

    <CustomParametersEditor
      :element="element"
      :paramDynamic="paramDynamic"
      :canAddParams="canAddParams"
      :filteredSourceOptions="filteredSourceOptions"
      :modeOptions="modeOptions"
      :orderOptions="orderOptions"
      @add-parameter="addParameter"
      @remove-parameter="removeParameter"
      @save-parameter-edit="saveParameterEdit"
    />

    <ChildrenBindingEditor
      :element="element"
      :getCompatibleParentParams="getCompatibleParentParams"
      @update-child-linked-query="updateChildLinkedQuery"
      @update-child-param-source="updateChildParamSource"
      @update-child-bg-image-key="updateChildBgImageKey"
      @force-aria-hidden="forceAriaHidden"
    />

    <ImageParams :element="element" @update-data="updateData" />
    <IconParams :element="element" @update-data="updateData" />
    <InputParams :element="element" @update-data="updateData" />
    <InteractiveParams :element="element" @update-data="updateData" />
    <SliderParams :element="element" @update-data="updateData" />
    <LinkParams :element="element" @update-data="updateData" @update-data-param="updateDataAndParam" />

    <!-- Raccourci Arrière-plan Média pour Card et Slider -->
    <BgImageParam
      v-if="['CardBuilder', 'SliderBuilder'].includes(element.tag)"
      :key="element.id"
      :element="element"
    />
  </div>
</template>
