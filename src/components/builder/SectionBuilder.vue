<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, inject } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import type { AnySectionInstance } from '../../type/section';
import BlocRender from './BlocRender.vue';
import ResizerWrapper from './ResizerWrapper.vue';
import { formatSize, resolveValueForBreakpoint } from '../../lib/style/core';
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

const sectionClasses = computed(() => {
  return [
    buildSectionStyles(props.section.styles as Record<string, unknown>, resolveValue)
  ];
});

const sectionLayoutClasses = computed(() => {
  return [
    buildSectionLayoutStyles(props.section.styles as Record<string, unknown>, resolveValue)
  ];
});

const sectionStyles = computed(() => {
  const bp = builderState?.currentBreakpoint.value || 'default';
  return buildSectionInlineStyles(props.section.styles as Record<string, unknown>, bp, resolveValue);
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
  'drop-zone-active': isDraggingOver.value,
  'blueprint-target': props.section.children.length > 0,
  'blueprint-active': (isDraggingOver.value || isXRayMode.value) && props.section.children.length > 0
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
    :style="sectionStyles"
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

    <!-- Label de section sélectionnée -->
    <div 
      v-if="active"
      class="absolute top-0 left-0 bg-blue-600 text-white text-[10px] px-2 py-0.5 font-bold uppercase z-[65] shadow-sm whitespace-nowrap pointer-events-none"
    >
      Section: {{ section.name || "Sans titre" }}
    </div>

    <!-- Overlay de sélection de la section (au-dessus des enfants) -->
    <div
      v-if="active"
      class="absolute inset-0 border-2 border-blue-500 pointer-events-none z-[55]"
    />

    <!-- Conteneur Draggable pour les blocs -->
    <VueDraggable
      :model-value="section.children"
      :group="{ name: 'blocks', put: true, pull: true }"
      :animation="150"
      ghost-class="ghost-item"
      class="w-full flex-1"
      :class="[draggableClasses, ...sectionLayoutClasses]"
      @update:model-value="handleChildrenChange"
      @start="builderState?.setIsDragging(true)"
      @end="builderState?.setIsDragging(false)"
    >
      <div
        v-for="(element, index) in section.children"
        :key="element.id"
        class="relative transition-all"
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
    </VueDraggable>
  </section>
</template>

<style scoped>
.drop-zone-active {
  outline: 2px dashed #3b82f6;
  outline-offset: -4px;
  background-color: rgba(59, 130, 246, 0.05);
}

/* Mode Blueprint : les composants de la section s'écartent pour mieux voir l'imbrication */
.blueprint-active {
  gap: 8px !important;
  padding: 8px !important;
  outline: 1px dashed rgba(59, 130, 246, 0.6);
  outline-offset: -3px;
  background-color: rgba(59, 130, 246, 0.02);
}

:deep(.ghost-item) {
  opacity: 0.3;
  background: #3b82f6 !important;
  border-radius: 4px;
}
</style>
