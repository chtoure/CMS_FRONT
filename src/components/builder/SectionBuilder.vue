<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, inject } from 'vue';
import type { AnySectionInstance } from '../../type/section';
import BlocRender from './BlocRender.vue';
import ResizerWrapper from './ResizerWrapper.vue';
import { formatSize, resolveValueForBreakpoint, filterResponsiveClasses } from '../../lib/style/core';
import { buildSectionStyles, buildSectionLayoutStyles, buildSectionInlineStyles } from '../../lib/style/sectionProcessor';
import { getWrapperPositionStyles } from '../../lib/style/common';
import { useVariableResolver } from '../../hook/variable';

interface Props {
  section: AnySectionInstance;
  active: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:section': [value: AnySectionInstance]
  'select': [id: string]
}>();

const builderState = inject<{
  selectedId: { value: string | null }
  selectComponent: (id: string | null) => void
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' }
  isDragging: { value: boolean }
  setIsDragging: (val: boolean) => void
  xRayMode: { value: boolean }
  clipboard: { value: AnyComponentInstance | null }
  setClipboard: (item: AnyComponentInstance | null) => void
}>('builderState');

const { resolveValue } = useVariableResolver();

// Computed réactifs
const isDraggingOver = computed(() => builderState?.isDragging?.value ?? false);
const isXRayMode = computed(() => builderState?.xRayMode?.value ?? false);

// Handlers
const handleSelect = (e: MouseEvent) => {
  e.stopPropagation();
  emit('select', props.section.id);
  builderState?.selectComponent(props.section.id);
};

const handleChildrenChange = (newChildren: any[]) => {
  emit('update:section', {
    ...props.section,
    children: newChildren
  });
};

const handleElementUpdate = (index: number, newElement: any) => {
  const newChildren = [...props.section.children];
  newChildren[index] = newElement;
  handleChildrenChange(newChildren);
};

// Whether the section uses non-static positioning
const currentSectionPosition = computed(() => {
  const bp = builderState?.currentBreakpoint.value || 'default';
  const pos = (props.section.styles as any)?.position;
  return resolveValueForBreakpoint<string>(pos, bp, resolveValue) ?? 'static';
});

const isSectionPositioned = computed(() =>
  ['fixed', 'absolute', 'sticky'].includes(currentSectionPosition.value)
);

const isSticky = (element: any) => {
  const bp = builderState?.currentBreakpoint.value || 'default';
  const pos = element.styles?.position;
  return resolveValueForBreakpoint<string>(pos, bp, resolveValue) === 'sticky';
};

const isOutOfFlow = (element: any) => {
  const bp = builderState?.currentBreakpoint.value || 'default';
  const pos = element.styles?.position;
  const p = resolveValueForBreakpoint<string>(pos, bp, resolveValue);
  return p === 'fixed' || p === 'absolute';
};

const sectionClasses = computed(() => {
  return [
    filterResponsiveClasses(
      buildSectionStyles(props.section.styles as Record<string, unknown>, resolveValue),
      builderState?.currentBreakpoint.value || 'default'
    )
  ];
});

const sectionLayoutClasses = computed(() => {
  return [
    filterResponsiveClasses(
      buildSectionLayoutStyles(props.section.styles as Record<string, unknown>, resolveValue),
      builderState?.currentBreakpoint.value || 'default'
    )
  ];
});

// Styles VISUELS uniquement (bg, padding, border) → appliqués à la balise <section>
const sectionVisualStyles = computed(() => {
  const bp = builderState?.currentBreakpoint.value || 'default';
  const all = buildSectionInlineStyles(props.section.styles as Record<string, unknown>, bp, resolveValue);
  // On retire les propriétés de layout qui doivent aller sur le VueDraggable
  const { gap, justifyContent, alignItems, ...visual } = all;
  return visual;
});

// Styles de LAYOUT (gap, justify, align) → appliqués au VueDraggable (le vrai conteneur flex)
const sectionLayoutInlineStyles = computed(() => {
  const bp = builderState?.currentBreakpoint.value || 'default';
  const all = buildSectionInlineStyles(props.section.styles as Record<string, unknown>, bp, resolveValue);
  const result: Record<string, string> = {};
  if (all.gap) result.gap = all.gap;
  if (all.justifyContent) result.justifyContent = all.justifyContent;
  if (all.alignItems) result.alignItems = all.alignItems;
  return result;
});

// Helper pour extraire l'URL depuis bgVideo (la valeur est encapsulée en { type:'static', value: {...} })
const bgVideoUrl = computed((): string | null => {
  const raw = (props.section.styles as any)?.bgVideo;
  if (!raw) return null;
  const inner = (raw && typeof raw === 'object' && 'value' in raw) ? raw.value : raw;
  if (inner && typeof inner === 'object' && 'url' in inner) return inner.url as string;
  if (typeof inner === 'string') return inner;
  return null;
});

const draggableClasses = computed(() => ({
  'py-4': props.section.children.length === 0,
  'blueprint-target': props.section.children.length > 0,
  'blueprint-active': isXRayMode.value && props.section.children.length > 0
}));

</script>

<template>
  <section
    :class="[
      // 'relative' prevents sticky/fixed from working correctly — remove it when positioned
      !isSectionPositioned && 'relative',
      'group/section flex flex-col transition-all duration-200',
      ...sectionClasses
    ]"
    :style="sectionVisualStyles"
    @click="handleSelect"
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

    <!-- Overlay de sélection de la section (au-dessus des enfants) -->
    <div
      v-if="active"
      class="absolute inset-0 border-2 border-blue-500 pointer-events-none z-[55]"
    />

    <!-- Conteneur pour les blocs -->
    <div
      class="w-full flex-1 relative"
      :class="[draggableClasses, ...sectionLayoutClasses]"
      :style="sectionLayoutInlineStyles"
    >
      <template v-for="(element, index) in section.children" :key="element.id">
        <div
          class="transition-all"
          :class="isOutOfFlow(element) ? '' : 'relative'"
          :style="{
            width: formatSize(element.styles?.width, builderState?.currentBreakpoint.value, resolveValue), 
            height: formatSize(element.styles?.height, builderState?.currentBreakpoint.value, resolveValue),
            ...(isSticky(element) ? getWrapperPositionStyles(element.styles as Record<string, unknown>, builderState?.currentBreakpoint.value || 'default', resolveValue) : {})
          }"
        >
          <ResizerWrapper
            :element="element"
            :active="builderState?.selectedId.value === element.id"
            :depth="0"
            @update:element="(newElem) => handleElementUpdate(index, newElem)"
            :style="!isSticky(element) ? getWrapperPositionStyles(element.styles as Record<string, unknown>, builderState?.currentBreakpoint.value || 'default', resolveValue) : {}"
          >
            <BlocRender
              :element="element"
              @update:element="(newElem) => handleElementUpdate(index, newElem)"
            />
          </ResizerWrapper>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
/* Mode Blueprint : les composants de la section s'écartent pour mieux voir l'imbrication */
.blueprint-active {
  gap: 8px !important;
  padding: 8px !important;
  outline: 1px dashed rgba(59, 130, 246, 0.6);
  outline-offset: -3px;
  background-color: rgba(59, 130, 246, 0.02);
}
</style>
