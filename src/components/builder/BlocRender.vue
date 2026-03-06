<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue';
import { FAMILY_CAPABILITIES, type AnyComponentInstance } from '../../type/component';
import { VueDraggable } from 'vue-draggable-plus';
import { COMPONENT_MAP } from '../../registry/component_registry';
import { buildLayoutStyles, buildLayoutInlineStyles } from '../../lib/styleProcessor';

defineOptions({
  name: 'BlocRender'
});

interface Props {
  element: AnyComponentInstance;
  isClone?: boolean; // Si true, ce bloc est un clone non-éditable (itération)
}

const props = withDefaults(defineProps<Props>(), {
  isClone: false,
});

// On définit un émetteur pour prévenir le parent du changement
const emit = defineEmits(['update:element']);

// Ce computed va servir de "pont" sécurisé pour le v-model
// Utilisation d'une ref locale pour garantir une référence stable à VueDraggable
const localChildren = ref<AnyComponentInstance[]>([...(props.element.children || [])]);

// Synchronisation descendante : si la prop change (ex: undo/redo), on met à jour le local
watch(() => props.element.children, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(localChildren.value)) {
    localChildren.value = [...(newVal || [])];
  }
}, { deep: true });

const childrenModel = computed({
  get: () => localChildren.value,
  set: (newValue) => {
    localChildren.value = newValue;
    // On notifie le parent
    emit('update:element', {
      ...props.element,
      children: newValue
    });
  }
});

const componentToRender = COMPONENT_MAP[props.element.tag];

const builderState = inject<{
  selectedId: { value: string | null },
  selectComponent: (id: string | null) => void,
  cmsCache: { value: Record<string, any> }
}>('builderState');

const isSelected = computed(() => !props.isClone && builderState?.selectedId.value === props.element.id);

const handleSelect = (e: MouseEvent) => {
  if (props.isClone) return; // Les clones ne sont pas sélectionnables
  e.stopPropagation();
  builderState?.selectComponent(props.element.id);
};

const layoutClasses = computed(() => {
  return buildLayoutStyles(props.element.styles as Record<string, unknown>);
});

const layoutInlineStyles = computed(() => {
  return buildLayoutInlineStyles(props.element.styles as Record<string, unknown>);
});

const isSelectedChild = (id: string) => !props.isClone && builderState?.selectedId.value === id;

const formatSize = (value: unknown, defaultValue: string | undefined = undefined) => {
  if (value === undefined || value === null || value === '') return defaultValue;

  let finalValue = value;
  // Handle ResponsiveProp
  if (typeof value === 'object' && value !== null && 'default' in (value as Record<string, unknown>)) {
    finalValue = (value as { default: unknown }).default;
  }

  if (finalValue === 'full') return '100%';
  if (typeof finalValue === 'number') return `${finalValue}px`;
  if (typeof finalValue === 'string' && !isNaN(Number(finalValue)) && finalValue.trim() !== '') return `${finalValue}px`;
  return finalValue as string;
};

import ResizerWrapper from './ResizerWrapper.vue';
import api, { handleResponse } from '../../api/fetchConfig';

const onDragStart = () => {
  // e.stopPropagation(); // Let VueDraggable handle it
};

const onDragEnd = () => {
  // e.stopPropagation();
};

import { useGetMediaList } from '../../hook/media';
import { useGetContentTypes } from '../../hook/content-type';
import { FieldType } from '../../type/field';

// On charge la liste des médias et des types de contenu pour la résolution des URLs
const mediaList = useGetMediaList({});
const contentTypes = useGetContentTypes();

// Si le composant est en mode Itération et que le cache est vide,
// on récupère les données CMS dès le montage pour ne pas dépendre de DataEditor.
// On résout aussi les IDs médias en URLs pour que les images s'affichent correctement.
onMounted(async () => {
  if (!props.element.data?.isIterated || !props.element.children || props.isClone) return;

  for (const child of props.element.children) {
    const paramName = (child.data as any)?.linkedQueryParamName;
    if (!paramName) continue;

    // Déjà dans le cache ? Pas la peine de refetcher.
    if (builderState?.cmsCache.value[paramName]) continue;

    // Trouver le paramètre correspondant sur le parent pour avoir le contentTypeId
    const param = (props.element.params as any[])?.find((p: any) => p.name === paramName);
    if (!param || param.type?.source !== 'contenus' || param.type?.config?.mode !== 'query') continue;

    const contentTypeId = param.type.contentTypeId;
    const config = param.type.config || {};

    try {
      const qp = new URLSearchParams();
      if (config.limit) qp.append('limit', config.limit.toString());
      if (config.sortBy) qp.append('sortBy', config.sortBy);
      if (config.order) qp.append('order', config.order);

      const resp = await api(`/content-entries/id/${contentTypeId}?${qp.toString()}`);
      const data = await handleResponse<any>(resp);
      const results = Array.isArray(data) ? data : data?.results;

      if (results && Array.isArray(results) && builderState) {
        // Récupérer le schéma du content type pour identifier les champs médias
        const ct = contentTypes.data.value?.results?.find((c: any) => c.id === contentTypeId);
        const medias = mediaList.data.value?.results || [];

        const resolvedResults = results.map((entry: any) => {
          const resolvedData = { ...(entry.data_json ?? entry) };

          // Résoudre les IDs médias en URLs
          if (ct?.fields_schema) {
            ct.fields_schema.forEach((f: any) => {
              const isMedia = f.type === FieldType.MEDIA || f.type === 'media';
              const value = resolvedData[f.name];
              if (isMedia && value) {
                const url = medias.find((m: any) => m.id === value)?.file_path;
                if (url) resolvedData[f.name] = url;
              }
            });
          }

          return resolvedData;
        });

        builderState.cmsCache.value[paramName] = resolvedResults;
      }
    } catch (err) {
      console.error(`BlocRender: échec du fetch CMS pour ${paramName}`, err);
    }
  }
});

// Retourne les items de la liste pour un enfant lié à une query
const getIteratedItems = (child: AnyComponentInstance) => {
  const paramName = (child.data as any)?.linkedQueryParamName;
  if (!paramName || !builderState?.cmsCache.value) return [];
  const list = builderState.cmsCache.value[paramName];
  return Array.isArray(list) ? list : [];
};

// Propage récursivement les valeurs de l'item CMS dans les données des sous-composants.
// Nécessaire pour que les clones (Texte, Image...) affichent le bon contenu.
// On parcourt les paramètres de chaque enfant : si un param est
// lié à '_inherited_query', on extrait la valeur via parentKey depuis l'item courant.
const applyItemToChildren = (children: AnyComponentInstance[], item: any): AnyComponentInstance[] => {
  if (!children || !item) return children || [];

  return children.map((child: AnyComponentInstance) => {
    const newData = { ...child.data };
    let changed = false;

    const childParams = (child.params || []) as any[];
    childParams.forEach((p: any) => {
      if (p.type?.source === 'parent' && p.type?.parentKey) {
        const parentParamName = p.type.parentParamName;
        // Le lien vers un objet hérité d'une liste passe par '_inherited_query'
        if (parentParamName === '_inherited_query') {
          const rawValue = item[p.type.parentKey];
          if (rawValue !== undefined) {
            newData[p.name] = rawValue;
            changed = true;
          }
        }
      }
    });

    const updatedChild = changed ? { ...child, data: newData } : child;

    // Récursion : si l'enfant a lui-même des enfants, on propage aussi
    if (updatedChild.children && updatedChild.children.length > 0) {
      return { ...updatedChild, children: applyItemToChildren(updatedChild.children, item) };
    }

    return updatedChild;
  });
};
</script>

<template>
  <component
    v-if="componentToRender"
    :is="componentToRender"
    :styles="element.styles"
    :data="element.data"
    class="relative group/renderer transition-all duration-200"
    :class="{
      'ring-2 ring-gray-400 ring-inset z-10': isSelected,
      'hover:ring-1 hover:ring-gray-300': !isSelected && !isClone
    }"
    @click="handleSelect"
  >
    <div
      v-if="!FAMILY_CAPABILITIES[element.family].canHaveChildren"
      class="absolute inset-0 z-[5] cursor-pointer"
    />

    <div
      v-if="isSelected"
      class="absolute -top-5 left-0 bg-gray-400 text-white text-[9px] px-2 py-0.5 rounded-t-sm font-bold uppercase z-50 shadow-md"
    >
      {{ element.name }}
    </div>

    <template v-if="FAMILY_CAPABILITIES[element.family].canHaveChildren">
      <div class="relative w-full h-full">

        <!-- Mode Clone : pas de drag & drop, rendu simple des enfants -->
        <template v-if="isClone">
          <div
            class="min-h-[50px] w-full h-full"
            :class="layoutClasses"
            :style="layoutInlineStyles"
          >
            <div
              v-for="child in childrenModel"
              :key="child.id"
              class="relative"
              :style="{
                width: formatSize(child.styles?.width, '100%'),
                height: formatSize(child.styles?.height)
              }"
            >
              <BlocRender :element="child" :is-clone="true" />
            </div>
          </div>
        </template>

        <!-- Mode Normal : drag & drop actif, logique d'itération -->
        <template v-else>
          <VueDraggable
            v-model="childrenModel"
            :group="{ name: 'blocks', put: true, pull: true }"
            :animation="150"
            class="min-h-[50px] w-full h-full pb-10"
            :class="layoutClasses"
            :style="layoutInlineStyles"
            @start="onDragStart"
            @end="onDragEnd"
          >
            <div
              v-for="(child, index) in childrenModel"
              :key="child.id"
              @click.stop="builderState?.selectComponent(child.id)"
              class="relative transition-all outline-none"
              :style="{
                width: formatSize(child.styles?.width, '100%'),
                height: formatSize(child.styles?.height)
              }"
            >
              <!-- Mode Itération : On répète la Carte Enfant pour chaque objet de la liste -->
              <template v-if="element.data?.isIterated && (child.data as any)?.linkedQueryParamName">

                <!-- Premier item (index 0) : Éditable + Sélectionnable -->
                <ResizerWrapper
                  :element="child"
                  :active="isSelectedChild(child.id)"
                  @update:element="(newChild: AnyComponentInstance) => {
                    const { _inherited_item, ...cleanData } = newChild.data as any;
                    const newChildren = [...childrenModel];
                    newChildren[index] = { ...newChild, data: cleanData };
                    childrenModel = newChildren;
                  }"
                >
                  <BlocRender
                    :element="{
                      ...child,
                      data: { ...child.data, _inherited_item: getIteratedItems(child)[0] }
                    }"
                    @update:element="(newChild: AnyComponentInstance) => {
                      const { _inherited_item, ...cleanData } = newChild.data as any;
                      const newChildren = [...childrenModel];
                      newChildren[index] = { ...newChild, data: cleanData };
                      childrenModel = newChildren;
                    }"
                  />
                </ResizerWrapper>

                <!-- Clones (index 1..N) : Lecture seule, rendu récursif complet -->
                <!-- On propage l'item dans les sous-composants via applyItemToChildren -->
                <div
                  v-for="(item, cloneIndex) in getIteratedItems(child).slice(1)"
                  :key="`clone-${child.id}-${cloneIndex}`"
                  class="pointer-events-none"
                  :style="{
                    width: formatSize(child.styles?.width, '100%'),
                    height: formatSize(child.styles?.height)
                  }"
                >
                  <BlocRender
                    :element="{
                      ...child,
                      data: { ...child.data, _inherited_item: item },
                      children: applyItemToChildren(child.children || [], item)
                    }"
                    :is-clone="true"
                  />
                </div>

              </template>

              <!-- Mode Standard : Un seul composant, sans itération -->
              <ResizerWrapper
                v-else
                :element="child"
                :active="isSelectedChild(child.id)"
                @update:element="(newChild: AnyComponentInstance) => {
                  const newChildren = [...childrenModel];
                  newChildren[index] = newChild;
                  childrenModel = newChildren;
                }"
              >
                <BlocRender
                  :element="child"
                  @update:element="(newChild: AnyComponentInstance) => {
                    const newChildren = [...childrenModel];
                    newChildren[index] = newChild;
                    childrenModel = newChildren;
                  }"
                />
              </ResizerWrapper>
            </div>
          </VueDraggable>

          <div v-if="childrenModel.length === 0" class="absolute inset-0 flex items-center justify-center pointer-events-none bg-gray-50/50 border border-gray-300 z-0">
            <span class="text-xs text-gray-400">Déposez ici</span>
          </div>
        </template>

      </div>
    </template>
  </component>
</template>
