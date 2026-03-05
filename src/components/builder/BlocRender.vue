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
}>('builderState');

const { resolveValue } = useVariableResolver();

// Computed réactifs
const isSelected = computed(() => builderState?.selectedId.value === props.element.id);
const canHaveChildren = computed(() => FAMILY_CAPABILITIES[props.element.family].canHaveChildren);

const layoutClasses = computed(() => {
  return buildBlocLayoutStyles(props.element.styles as Record<string, unknown>, resolveValue);
});

const layoutInlineStyles = computed(() => {
  const bp = builderState?.currentBreakpoint.value || 'default';
  return buildBlocLayoutInlineStyles(props.element.styles as Record<string, unknown>, bp, resolveValue);
});

const isDraggingOver = computed(() => builderState?.isDragging?.value ?? false);

// Handlers
const handleSelect = (e: MouseEvent) => {
  e.stopPropagation();
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
    class="relative group/renderer transition-all duration-200"
    :class="{ 
      'ring-2 ring-blue-500 ring-inset z-10': isSelected, 
      'hover:ring-1 hover:ring-gray-300': !isSelected && !isDraggingOver,
      'drop-zone-potential': isDraggingOver && canHaveChildren
    }"
    @click="handleSelect"
  >
    <!-- Overlay interactif pour composants sans enfants -->
    <div 
      v-if="!canHaveChildren" 
      class="absolute inset-0 z-[5] cursor-pointer"
    />

    <!-- Label du composant sélectionné -->
    <div 
      v-if="isSelected"
      class="absolute -top-5 left-0 bg-blue-500 text-white text-[9px] px-2 py-0.5 rounded-t-sm font-bold uppercase z-50 shadow-md"
    >
      {{ element.name }}
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
              'min-h-[40px]': !element.children || element.children.length === 0 
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
  outline: 2px solid #3b82f6 !important;
  outline-offset: -2px;
  background-color: rgba(59, 130, 246, 0.05);
}

:deep(.ghost-item) {
  opacity: 0.2 !important;
  background: #3b82f6 !important;
  border-radius: 4px;
}
</style>
