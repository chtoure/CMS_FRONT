<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, inject } from 'vue';
import { FAMILY_CAPABILITIES, type AnyComponentInstance } from '../../type/component';
import { VueDraggable } from 'vue-draggable-plus';
import { COMPONENT_MAP } from '../../registry/component_registry';
import { buildBlocLayoutStyles, buildBlocLayoutInlineStyles } from '../../lib/style/blocProcessor';
import { formatSize } from '../../lib/style/core';
import { useVariableResolver } from '../../hook/variable';
import ResizerWrapper from './ResizerWrapper.vue';

defineOptions({
  name: 'BlocRender'
});

interface Props {
  element: AnyComponentInstance;
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
  toggleStates: { value: Record<string, boolean> }
  isVisible: (id: string, backendId?: number | null) => boolean
}>('builderState');

const { resolveValue } = useVariableResolver();

// Computed réactifs
const isSelected = computed(() => builderState?.selectedId.value === props.element.id);
const canHaveChildren = computed(() => {
  // Le bouton ne doit plus être un conteneur
  if (props.element.tag === 'ButtonBuilder') return false;
  // Le slider est un conteneur
  if (props.element.tag === 'SliderBuilder') return true;
  return FAMILY_CAPABILITIES[props.element.family]?.canHaveChildren || false;
});

const layoutClasses = computed(() => {
  return buildBlocLayoutStyles(props.element.styles as Record<string, unknown>, resolveValue);
});

const layoutInlineStyles = computed(() => {
  const bp = builderState?.currentBreakpoint.value || 'default';
  return buildBlocLayoutInlineStyles(props.element.styles as Record<string, unknown>, bp, resolveValue);
});

const isDraggingOver = computed(() => builderState?.isDragging?.value ?? false);
const isVisible = computed(() => {
  return builderState?.isVisible(props.element.id, props.element.blocTemplateId) ?? true;
});

// Handlers
const handleSelect = (e?: MouseEvent) => {
  if (e) e.stopPropagation();
  builderState?.selectComponent(props.element.id);
};

const handleChildrenChange = (newChildren: AnyComponentInstance[]) => {
  emit('update:element', {
    ...props.element,
    children: newChildren
  });
};

const handleChildUpdate = (index: number, newChild: AnyComponentInstance) => {
  if (!props.element.children) return;
  const newChildren = [...props.element.children];
  newChildren[index] = newChild;
  handleChildrenChange(newChildren);
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
    class="relative group/renderer transition-all duration-200"
    :class="{ 
      'ring-2 ring-blue-500 ring-inset z-10': isSelected, 
      'hover:ring-1 hover:ring-gray-300': !isSelected && !isDraggingOver,
      'drop-zone-potential': isDraggingOver && canHaveChildren,
      'opacity-20 grayscale-[0.8] border-2 border-dashed border-red-500/50': !isVisible,
    }"
    v-show="isVisible || isSelected"
    @click="handleSelect"
    @update:element="(newVal: AnyComponentInstance) => emit('update:element', newVal)"
  >
    <!-- Overlay interactif pour composants sans enfants (Sélection) -->
    <!-- On le désactive pour les types interactifs (boutons) pour qu'ils reçoivent le clic direct -->
    <div 
      v-if="!canHaveChildren && !isSelected && element.family !== 'interactive'" 
      class="absolute inset-0 z-[5] cursor-pointer shadow-none"
      @click.stop="handleSelect"
    />

    <!-- Label du composant sélectionné -->
    <div 
      v-if="isSelected"
      class="absolute -top-5 left-0 bg-blue-500 text-white text-[9px] px-2 py-0.5 rounded-t-sm font-bold uppercase z-50 shadow-md whitespace-nowrap flex items-center gap-2"
    >
      <span>{{ element.name }}</span>
    </div>

    <!-- Badge Caché -->
    <div 
      v-if="!isVisible"
      class="absolute top-0 right-0 bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded-bl-sm z-[60] font-black uppercase pointer-events-none shadow-sm"
    >
      Caché
    </div>

    <!-- Zone de drop pour conteneurs -->
    <template v-if="canHaveChildren">
      <div class="relative w-full h-full"> 
        <VueDraggable
          :model-value="element.children || []"
          :group="{ name: 'blocks', put: true, pull: true }"
          :animation="100"
          :delay="0"
          ghost-class="ghost-item"
          class="w-full h-full transition-all duration-300"
          :class="[
            layoutClasses, 
            { 
              'drop-zone-active': isDraggingOver,
              'min-h-[80px] p-4': !element.children || element.children.length === 0,
              'p-2': element.children && element.children.length > 0 && isDraggingOver
            }
          ]"
          :style="layoutInlineStyles"
          @update:model-value="handleChildrenChange"
        >
          <div
            v-for="(child, index) in (element.children || [])"
            :key="child.id"
            class="relative transition-all"
            :style="{
              width: formatSize(child.styles?.width, builderState?.currentBreakpoint.value, resolveValue), 
              height: formatSize(child.styles?.height, builderState?.currentBreakpoint.value, resolveValue) 
            }"
            @click.stop="builderState?.selectComponent(child.id)"
          >
            <ResizerWrapper
              :element="child"
              :active="builderState?.selectedId.value === child.id"
              @update:element="(newChild) => handleChildUpdate(index, newChild)"
            >
              <BlocRender 
                :element="child"
                @update:element="(newChild) => handleChildUpdate(index, newChild)"
              />
            </ResizerWrapper>
          </div>
        </VueDraggable>
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
