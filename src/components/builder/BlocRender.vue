<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import { FAMILY_CAPABILITIES, type AnyComponentInstance } from '../../type/component';
import { VueDraggable } from 'vue-draggable-plus';
import { COMPONENT_MAP } from '../../registry/component_registry';
import { buildLayoutStyles, buildLayoutInlineStyles } from '../../lib/styleProcessor';

defineOptions({
  name: 'BlocRender'
});

interface Props {
  element: AnyComponentInstance;
}

const props = defineProps<Props>();

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
  selectComponent: (id: string | null) => void 
}>('builderState');

const isSelected = computed(() => builderState?.selectedId.value === props.element.id);

const handleSelect = (e: MouseEvent) => {
  e.stopPropagation();
  builderState?.selectComponent(props.element.id);
};

const layoutClasses = computed(() => {
  return buildLayoutStyles(props.element.styles as Record<string, unknown>);
});

const layoutInlineStyles = computed(() => {
  return buildLayoutInlineStyles(props.element.styles as Record<string, unknown>);
});

console.log('BlocRender mounting:', {
  id: props.element.id,
  tag: props.element.tag,
  componentFound: !!componentToRender
});
const isSelectedChild = (id: string) => builderState?.selectedId.value === id;

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

const onDragStart = () => {
  // e.stopPropagation(); // Let VueDraggable handle it
};

const onDragEnd = () => {
  // e.stopPropagation();
};
</script>

<template>
  <component 
    v-if="componentToRender"
    :is="componentToRender" 
    :styles="element.styles" 
    :data="element.data"
    class="relative group/renderer transition-all duration-200"
    :class="{ 'ring-2 ring-gray-400 ring-inset z-10': isSelected, 'hover:ring-1 hover:ring-gray-300': !isSelected }"
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
            <ResizerWrapper
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
      </div>
    </template>
  </component>
</template>