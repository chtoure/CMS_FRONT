<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, inject, onMounted, ref, watch } from 'vue';
import { FAMILY_CAPABILITIES, type AnyComponentInstance } from '../../type/component';
import { VueDraggable } from 'vue-draggable-plus';
import { COMPONENT_MAP } from '../../registry/component_registry';
import { buildBlocLayoutStyles, buildBlocLayoutInlineStyles } from '../../lib/style/blocProcessor';
import { formatSize, resolveValueForBreakpoint, filterResponsiveClasses } from '../../lib/style/core';
import { useVariableResolver } from '../../hook/variable';
import { getWrapperPositionStyles } from '../../lib/style/common';
import ResizerWrapper from './ResizerWrapper.vue';
import api, { handleResponse } from '../../api/fetchConfig';
import { useGetMediaList } from '../../hook/media';
import { useGetContentTypes } from '../../hook/content-type';
import { FieldType } from '../../type/field';

defineOptions({
  name: 'BlocRender'
});

interface Props {
  element: AnyComponentInstance;
  isClone?: boolean; // Si true, ce bloc est un clone non-éditable (itération)
  depth?: number;    // Profondeur dans l'arbre pour le mode Blueprint
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:element': [value: AnyComponentInstance]
}>();

const componentToRender = COMPONENT_MAP[props.element.tag];

const builderState = inject<{
  selectedId: { value: string | null }
  selectComponent: (id: string | null) => void
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' }
  isDragging: { value: boolean }
  setIsDragging: (val: boolean) => void
  xRayMode: { value: boolean }
  toggleStates: { value: Record<string, boolean> }
  isVisible: (id: string, backendId?: number | null) => boolean
  cmsCache: { value: Record<string, any> }
}>('builderState');

const { resolveValue } = useVariableResolver();

// Computed réactifs
const isSelected = computed(() => builderState?.selectedId.value === props.element.id);
const isDraggingOver = computed(() => builderState?.isDragging?.value ?? false);
const isXRayMode = computed(() => builderState?.xRayMode?.value ?? false);
const canHaveChildren = computed(() => {
  // Le bouton ne doit plus être un conteneur
  if (props.element.tag === 'ButtonBuilder') return false;
  // Le slider est un conteneur
  if (props.element.tag === 'SliderBuilder') return true;
  return FAMILY_CAPABILITIES[props.element.family]?.canHaveChildren || false;
});

const layoutClasses = computed(() => {
  return filterResponsiveClasses(
    buildBlocLayoutStyles(props.element.styles as Record<string, unknown>, resolveValue),
    builderState?.currentBreakpoint.value || 'default'
  );
});

const layoutInlineStyles = computed(() => {
  const bp = builderState?.currentBreakpoint.value || 'default';
  return buildBlocLayoutInlineStyles(props.element.styles as Record<string, unknown>, bp, resolveValue, true);
});

// Calcul dynamique du layout (classes) uniquement pour la <div> de boucle si on a des clones
const iteratedWrapperLayoutClasses = computed(() => {
  return (child: any) => {
    // CONDITION STRICTE : Si ce n'est pas un enfant en mode itération avec des clones, on ne fait rien
    const isIteratedChild = props.element.data?.isIterated &&
      ((child.data as any)?.linkedQueryParamName || getLeafQueryItems(child).length > 0);

    if (!isIteratedChild) return '';

    // oxlint-disable-next-line no-useless-fallback-in-spread
    const stylesObj = { ...((props.element.styles as Record<string, unknown>) || {}) };
    delete stylesObj.padding; // Ne pas hériter le padding du parent

    const classes = filterResponsiveClasses(
      buildBlocLayoutStyles(stylesObj, resolveValue),
      builderState?.currentBreakpoint.value || 'default'
    );

    // Reproduction de la structure CSS du parent
    if (classes.includes('grid')) {
      return `w-full ${classes}`;
    } else if (classes.includes('flex')) {
      return `w-full ${classes} ${stylesObj.direction === 'horizontal' ? 'flex-wrap' : ''}`;
    } else if (stylesObj.direction) {
      return `w-full flex ${classes} ${stylesObj.direction === 'horizontal' ? 'flex-wrap' : ''}`;
    }

    // Aucun réglage : comportement naturel en block
    return 'w-full block';
  };
});

// Pareil pour les styles inline (marge etc)
const iteratedWrapperInlineStyles = computed(() => {
  return (child: any) => {
    const isIteratedChild = props.element.data?.isIterated &&
      ((child.data as any)?.linkedQueryParamName || getLeafQueryItems(child).length > 0);

    if (!isIteratedChild) return {};

    const bp = builderState?.currentBreakpoint.value || 'default';
    // oxlint-disable-next-line no-useless-fallback-in-spread
    const stylesObj = { ...((props.element.styles as Record<string, unknown>) || {}) };
    delete stylesObj.padding;

    return buildBlocLayoutInlineStyles(stylesObj, bp, resolveValue, true);
  };
});

// Helper pour extraire l'URL depuis la propriété bgVideo (qui est enveloppée en { type:'static', value: {...} })
const bgVideoUrl = computed((): string | null => {
  const raw = (props.element.styles as any)?.bgVideo;
  if (!raw) return null;
  // Décompresse { type: 'static', value: { url: ..., ... } }
  const inner = (raw && typeof raw === 'object' && 'value' in raw) ? raw.value : raw;
  if (inner && typeof inner === 'object' && 'url' in inner) return inner.url as string;
  if (typeof inner === 'string') return inner;
  return null;
});

const isVisible = computed(() => {
  return builderState?.isVisible(props.element.id, props.element.blocTemplateId) ?? true;
});

// Handlers
const handleSelect = (e?: MouseEvent) => {
  if (props.isClone) return;
  if (e) e.stopPropagation();
  builderState?.selectComponent(props.element.id);
};

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

const isResizingItem = ref<boolean>(false);

const isSticky = (element: any) => {
  const bp = builderState?.currentBreakpoint.value || 'default';
  const pos = element.styles?.position;
  return resolveValueForBreakpoint<string>(pos, bp, resolveValue) === 'sticky';
};

const handleChildrenChange = (newChildren: AnyComponentInstance[]) => {
  childrenModel.value = newChildren;
};

const handleChildUpdate = (index: number, newChild: AnyComponentInstance) => {
  if (!childrenModel.value) return;
  const newChildren = [...childrenModel.value];
  newChildren[index] = newChild;
  handleChildrenChange(newChildren);
};

// On charge la liste des médias et des types de contenu pour la résolution des URLs
const mediaList = useGetMediaList({});
const contentTypes = useGetContentTypes();

// Si le composant est en mode Itération et que le cache est vide,
// on récupère les données CMS dès le montage pour ne pas dépendre de DataEditor.
// On résout aussi les IDs médias en URLs pour que les images s'affichent correctement.
onMounted(async () => {
  if (!props.element.data?.isIterated || !props.element.children || props.isClone) return;

  const queryParams = (props.element.params || []).filter(
    (p: any) => p.type?.source === 'contenus' && p.type?.config?.mode === 'query'
  );

  for (const param of queryParams) {
    const paramName = param.name;

    // Déjà dans le cache ? Pas la peine de refetcher.
    if (builderState?.cmsCache.value[paramName]) continue;

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

// Applique l'image de fond depuis l'item hérité au container
const applyBgImageToContainer = (child: AnyComponentInstance, item: any): AnyComponentInstance => {
  const linkedBgKey = (child.data as any)?.linkedBgImageKey;
  if (!linkedBgKey || !item) return child;
  const rawUrl = item[linkedBgKey];
  if (!rawUrl) return child;
  return {
    ...child,
    styles: {
      ...child.styles,
      bgImage: { type: 'media', url: rawUrl, value: { url: rawUrl } } as any
    }
  };
};


// Pour un enfant FEUILLE avec isIterated:true, trouve les items CMS
// en cherchant dans ses params lequel pointe vers un query param du parent
const getLeafQueryItems = (child: AnyComponentInstance): any[] => {
  if (!builderState?.cmsCache.value) return [];
  const parentQueryParamNames = (props.element.params || []).filter(
    (p: any) => p.type?.source === 'contenus' && p.type?.config?.mode === 'query'
  ).map((p: any) => p.name);

  for (const p of (child.params || []) as any[]) {
    if (p.type?.source === 'parent' && parentQueryParamNames.includes(p.type?.parentParamName)) {
      const list = builderState.cmsCache.value[p.type.parentParamName];
      if (Array.isArray(list)) return list;
    }
  }
  return [];
};

// Applique les valeurs d'un item CMS sur les données d'une feuille (ses params PARENT)
const applyQueryItemToLeaf = (child: AnyComponentInstance, item: any): Record<string, any> => {
  const newData = { ...child.data };
  for (const p of (child.params || []) as any[]) {
    if (p.type?.source === 'parent' && p.type?.parentKey) {
      const rawValue = item[p.type.parentKey];
      if (rawValue !== undefined) newData[p.name] = rawValue;
    }
  }
  return newData;
};

// Propage récursivement les valeurs de l'item CMS dans les données des sous-composants.
// parentQueryParamNames : noms des params query du parent direct (pour les feuilles liées directement)
const applyItemToChildren = (
  children: AnyComponentInstance[],
  item: any,
  parentQueryParamNames: string[] = []
): AnyComponentInstance[] => {
  if (!children || !item) return children || [];

  return children.map((child: AnyComponentInstance) => {
    const newData = { ...child.data };
    let changed = false;

    const childParams = (child.params || []) as any[];
    childParams.forEach((p: any) => {
      if (p.type?.source === 'parent' && p.type?.parentKey) {
        const parentParamName = p.type.parentParamName;
        // Liaison via _inherited_query (container enfant lié) OU liaison directe vers un param query
        if (
          parentParamName === '_inherited_query' ||
          parentQueryParamNames.includes(parentParamName)
        ) {
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
      return {
        ...updatedChild,
        children: applyItemToChildren(updatedChild.children, item, parentQueryParamNames)
      };
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
    :element="element"
    :children="element.children"
    class="relative isolate h-full group/renderer transition-all duration-200"
    :class="{
      'ring-1 ring-blue-500 ring-inset z-10': isSelected,
      'drop-zone-potential': isDraggingOver && canHaveChildren && !isClone,
      'opacity-20 grayscale-[0.8] border-2 border-dashed border-red-500/50': !isVisible && !isClone,
    }"
    :style="isXRayMode && element.tag === 'SliderBuilder' && !isSelected ? { outline: '1px dashed rgba(139, 92, 246, 0.6)', outlineOffset: '-3px', backgroundColor: 'rgba(139, 92, 246, 0.04)' } : {}"
    v-show="isVisible || isSelected"
    @click="handleSelect"
    @update:element="(newVal: AnyComponentInstance) => emit('update:element', newVal)"
  >
    <!-- Background Video -->
    <video
      v-if="bgVideoUrl"
      :src="bgVideoUrl"
      autoplay
      loop
      muted
      playsinline
      class="absolute inset-0 w-full h-full object-cover -z-10 pointer-events-none"
    ></video>

    <!-- Overlay interactif pour composants sans enfants (Sélection) -->
    <!-- On le désactive pour les types interactifs (boutons) pour qu'ils reçoivent le clic direct -->
    <div
      v-if="!canHaveChildren && !isSelected && element.family !== 'interactive' && !isClone"
      class="absolute inset-0 z-[5] cursor-pointer shadow-none"
      @click.stop="handleSelect"
    ></div>

    <!-- Badge Caché -->
    <div
      v-if="!isVisible && !isClone"
      class="absolute top-0 right-0 bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded-bl-sm z-[60] font-black uppercase pointer-events-none shadow-sm"
    >
      Caché
    </div>

    <!-- Zone de drop pour conteneurs -->
    <template v-if="canHaveChildren">
      <div class="relative w-full h-full">
        <!-- Mode Clone : pas de drag & drop, rendu simple des enfants -->
        <template v-if="isClone">
          <div
            class="w-full h-full"
            :class="element.tag !== 'SliderBuilder' ? [layoutClasses, 'pb-10'] : ''"
            :style="element.tag !== 'SliderBuilder' ? layoutInlineStyles : {}"
          >
            <div
              v-for="child in childrenModel"
              :key="child.id"
              class="relative"
              :style="{
                width: formatSize(child.styles?.width, builderState?.currentBreakpoint.value, resolveValue),
                height: formatSize(child.styles?.height, builderState?.currentBreakpoint.value, resolveValue),
                ...(isSticky(child) ? getWrapperPositionStyles(child.styles as Record<string, unknown>, builderState?.currentBreakpoint.value || 'default', resolveValue) : {})
              }"
            >
              <BlocRender :element="child" :is-clone="true" :style="!isSticky(child) ? getWrapperPositionStyles(child.styles as Record<string, unknown>, builderState?.currentBreakpoint.value || 'default', resolveValue) : {}" />
            </div>
          </div>
        </template>

        <!-- Mode Normal : drag & drop actif, logique d'itération -->
        <template v-else>
          <VueDraggable
            :model-value="childrenModel"
            :group="{ name: 'blocks', put: true, pull: true }"
            :animation="100"
            :delay="0"
            :fallbackOnBody="true"
            :swapThreshold="0.65"
            ghost-class="ghost-item"
            class="w-full h-full transition-all duration-300"
            :class="[
              element.tag !== 'SliderBuilder' ? layoutClasses : '',
              {
                'drop-zone-active': isDraggingOver && element.tag !== 'SliderBuilder',
                'p-4 min-h-[60px]': !childrenModel || childrenModel.length === 0,
                'blueprint-target': true,
                'blueprint-mode': (isDraggingOver || isXRayMode) && element.tag !== 'SliderBuilder',
                'blueprint-mode-slider': isXRayMode && element.tag === 'SliderBuilder',
              }
            ]"
            :style="element.tag !== 'SliderBuilder' ? layoutInlineStyles : {}"
            @update:model-value="handleChildrenChange"
            @start="builderState?.setIsDragging(true)"
            @end="builderState?.setIsDragging(false)"
          >
            <div
              v-for="(child, index) in childrenModel"
              :key="child.id"
              class="relative transition-all"
              :class="iteratedWrapperLayoutClasses(child)"
              :style="{
                width: formatSize(child.styles?.width, builderState?.currentBreakpoint.value, resolveValue),
                height: formatSize(child.styles?.height, builderState?.currentBreakpoint.value, resolveValue),
                ...(isSticky(child) ? getWrapperPositionStyles(child.styles as Record<string, unknown>, builderState?.currentBreakpoint.value || 'default', resolveValue) : {}),
                ...iteratedWrapperInlineStyles(child)
              }"
              @click.stop="builderState?.selectComponent(child.id)"
            >
              <!-- Mode Itération CONTAINER : répète le container enfant pour chaque item de la liste -->
              <template v-if="element.data?.isIterated && (child.data as any)?.linkedQueryParamName">

                <!-- Premier item (index 0) : Éditable + Sélectionnable -->
                <ResizerWrapper
                  :element="child"
                  :active="builderState?.selectedId.value === child.id"
                  :depth="(props.depth ?? 0) + 1"
                  @update:element="(newChild: AnyComponentInstance) => {
                    const { _inherited_item, ...cleanData } = newChild.data as any;
                    handleChildUpdate(index, { ...newChild, data: cleanData });
                  }"
                  @resizing="isResizingItem = $event"
                  :style="!isSticky(child) ? getWrapperPositionStyles(child.styles as Record<string, unknown>, builderState?.currentBreakpoint.value || 'default', resolveValue) : {}"
                >
                  <BlocRender
                    :element="applyBgImageToContainer({
                      ...child,
                      data: { ...child.data, _inherited_item: getIteratedItems(child)[0] },
                      children: applyItemToChildren(
                        child.children || [],
                        getIteratedItems(child)[0],
                        (element.params || []).filter((p: any) =>
                          p.type?.source === 'contenus' && p.type?.config?.mode === 'query'
                        ).map((p: any) => p.name)
                      )
                    }, getIteratedItems(child)[0])"
                    @update:element="(newChild: AnyComponentInstance) => {
                      const { _inherited_item, ...cleanData } = newChild.data as any;
                      handleChildUpdate(index, { ...newChild, data: cleanData });
                    }"
                  />
                </ResizerWrapper>

                <!-- Clones (index 1..N) : Lecture seule, rendu récursif complet -->
                <div
                  v-for="(item, cloneIndex) in getIteratedItems(child).slice(1)"
                  :key="`clone-${child.id}-${cloneIndex}`"
                  class="pointer-events-none"
                  :style="{
                    width: formatSize(child.styles?.width, builderState?.currentBreakpoint.value, resolveValue),
                    height: formatSize(child.styles?.height, builderState?.currentBreakpoint.value, resolveValue)
                  }"
                >
                  <BlocRender
                    :element="applyBgImageToContainer({
                      ...child,
                      data: { ...child.data, _inherited_item: item },
                      children: applyItemToChildren(
                        child.children || [],
                        item,
                        (element.params || []).filter((p: any) =>
                          p.type?.source === 'contenus' && p.type?.config?.mode === 'query'
                        ).map((p: any) => p.name)
                      )
                    }, item)"
                    :is-clone="true"
                  />
                </div>
              </template>

              <!-- Mode Itération FEUILLE : répète le composant feuille pour chaque item de la liste -->
              <template v-else-if="element.data?.isIterated && getLeafQueryItems(child).length > 0">

                <!-- Premier item : éditable -->
                <ResizerWrapper
                  :element="child"
                  :active="builderState?.selectedId.value === child.id"
                  @update:element="(newChild: AnyComponentInstance) => handleChildUpdate(index, newChild)"
                >
                  <BlocRender
                    :element="{ ...child, data: applyQueryItemToLeaf(child, getLeafQueryItems(child)[0]) }"
                    @update:element="(newChild: AnyComponentInstance) => handleChildUpdate(index, newChild)"
                  />
                </ResizerWrapper>

                <!-- Clones (index 1..N) : lecture seule -->
                <div
                  v-for="(item, cloneIndex) in getLeafQueryItems(child).slice(1)"
                  :key="`leaf-clone-${child.id}-${cloneIndex}`"
                  class="pointer-events-none"
                  :style="{
                    width: formatSize(child.styles?.width, builderState?.currentBreakpoint.value, resolveValue),
                    height: formatSize(child.styles?.height, builderState?.currentBreakpoint.value, resolveValue)
                  }"
                >
                  <BlocRender
                    :element="{ ...child, data: applyQueryItemToLeaf(child, item) }"
                    :is-clone="true"
                  />
                </div>
              </template>

              <ResizerWrapper
                v-else
                :element="child"
                :active="builderState?.selectedId.value === child.id"
                :depth="(props.depth ?? 0) + 1"
                @update:element="(newChild) => handleChildUpdate(index, newChild)"
                @resizing="isResizingItem = $event"
                :style="!isSticky(child) ? getWrapperPositionStyles(child.styles as Record<string, unknown>, builderState?.currentBreakpoint.value || 'default', resolveValue) : {}"
              >
                <BlocRender
                  :element="child"
                  @update:element="(newChild) => handleChildUpdate(index, newChild)"
                />
              </ResizerWrapper>
            </div>
          </VueDraggable>
        </template>
      </div>
    </template>
  </component>
</template>

<style scoped>
.drop-zone-active {
  outline: 2px dashed #3b82f6;
  outline-offset: -2px;
  background-color: rgba(59, 130, 246, 0.08);
}

/* Mode Blueprint: al drag, on écarte les enfants et on ajoute un padding visuel */
.blueprint-mode {
  gap: 8px !important;
  padding: 8px !important;
  outline: 1px dashed rgba(139, 92, 246, 0.6);
  outline-offset: -3px;
  background-color: rgba(139, 92, 246, 0.04);
}

/* Mode Structure pour le Slider : contour identique aux autres mais SANS gap/padding pour ne pas casser le layout */
.blueprint-mode-slider {
  outline: 1px dashed rgba(139, 92, 246, 0.6);
  outline-offset: -3px;
  background-color: rgba(139, 92, 246, 0.04);
}

/* Outline violet appliqué sur le WRAPPER RACINE du SliderBuilder en mode Structure */
/* Remplacé par ring-inset Tailwind directement dans le template - plus fiable */

.drop-zone-potential {
  outline: 1px dashed rgba(59, 130, 246, 0.5);
  outline-offset: -1px;
}

.drop-zone-potential:hover {
  outline: 2px solid #3b82f6 !important;
  background-color: rgba(59, 130, 246, 0.05);
}

:deep(.ghost-item) {
  opacity: 0.2 !important;
  background: #3b82f6 !important;
  border-radius: 4px;
}
</style>
