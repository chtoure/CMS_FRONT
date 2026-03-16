<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, inject } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import type { AnySectionInstance } from '../../type/section';
import BlocRender from './BlocRender.vue';
import ResizerWrapper from './ResizerWrapper.vue';
import { formatSize } from '../../lib/style/core';
import { buildSectionStyles, buildSectionInlineStyles } from '../../lib/style/sectionProcessor';
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
}>('builderState');

const { resolveValue } = useVariableResolver();

// Computed réactifs
const isDraggingOver = computed(() => builderState?.isDragging?.value ?? false);

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

// Classes dynamiques
const sectionClasses = computed(() => {
  return [
    { 'ring-2 ring-blue-500 ring-inset z-10': props.active },
    buildSectionStyles(props.section.styles as Record<string, unknown>, resolveValue)
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
  'min-h-[120px]': props.section.children.length === 0,
  'drop-zone-active': isDraggingOver.value
}));

</script>

<template>
  <section
    class="relative group/section transition-all duration-200"
    :class="sectionClasses"
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
      class="absolute -top-6 left-0 bg-blue-600 text-white text-[10px] px-3 py-1 rounded-t-sm font-bold uppercase z-50 shadow-lg"
    >
      Section: {{ section.name || "Sans titre" }}
    </div>

    <!-- Conteneur Draggable pour les blocs -->
    <VueDraggable
      :model-value="section.children"
      :group="{ name: 'blocks', put: true, pull: true }"
      :animation="150"
      ghost-class="ghost-item"
      class="w-full h-full p-1"
      :class="draggableClasses"
      @update:model-value="handleChildrenChange"
    >
      <div
        v-for="(element, index) in section.children"
        :key="element.id"
        class="relative transition-all"
        :style="{
          width: formatSize(element.styles?.width, builderState?.currentBreakpoint.value, resolveValue), 
          height: formatSize(element.styles?.height, builderState?.currentBreakpoint.value, resolveValue) 
        }"
      >
        <ResizerWrapper
          :element="element"
          :active="builderState?.selectedId.value === element.id"
          @update:element="(newElem) => handleElementUpdate(index, newElem)"
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

:deep(.ghost-item) {
  opacity: 0.3;
  background: #3b82f6 !important;
  border-radius: 4px;
}
</style>
