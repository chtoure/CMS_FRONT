<script setup lang="ts">
import { computed, inject } from 'vue';
import { FAMILY_CAPABILITIES, type AnyComponentInstance } from '../../type/component';

defineOptions({
  name: 'BlocRender'
});
import { VueDraggable } from 'vue-draggable-plus';
import { COMPONENT_MAP } from '../../registry/component_registry';
import { buildLayoutStyles } from '../../lib/styleProcessor';

interface Props {
  element: AnyComponentInstance;
}

const props = defineProps<Props>();

// On définit un émetteur pour prévenir le parent du changement
const emit = defineEmits(['update:element']);

// Ce computed va servir de "pont" sécurisé pour le v-model
const childrenModel = computed({
  get: () => props.element.children,
  set: (newValue) => {
    // Au lieu de muter la prop, on renvoie une copie de l'élément avec les nouveaux enfants
    emit('update:element', {
      ...props.element,
      children: newValue
    });
  }
});

const componentToRender = COMPONENT_MAP[props.element.tag];

const selector = inject<{ selectedId: { value: string | null }, selectComponent: (id: string) => void }>('builderSelector');

const isSelected = computed(() => selector?.selectedId.value === props.element.id);

const handleSelect = (e: MouseEvent) => {
  e.stopPropagation();
  selector?.selectComponent(props.element.id);
};

const layoutClasses = computed(() => {
  return buildLayoutStyles(props.element.styles as Record<string, unknown>);
});

console.log('BlocRender mounting:', {
  id: props.element.id,
  tag: props.element.tag,
  componentFound: !!componentToRender
});
</script>

<template>
  <div 
    class="relative w-full h-full group/renderer transition-all duration-200"
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

    <component 
      v-if="componentToRender"
      :is="componentToRender" 
      :styles="element.styles" 
      :data="element.data"
    >

      <template v-if="FAMILY_CAPABILITIES[element.family].canHaveChildren">
        <div class="relative w-full"> 
          <VueDraggable
            v-model="childrenModel"
            :group="{ name: 'blocks', put: true, pull: true }"
            :animation="150"
            class="min-h-[100px] w-full pb-2"
            :class="layoutClasses"
          >
            <BlocRender 
              v-for="(child, index) in childrenModel" 
              :key="child.id" 
              :element="child"
              @update:element="(newChild: AnyComponentInstance) => {
                const newChildren = [...childrenModel];
                newChildren[index] = newChild;
                childrenModel = newChildren;
              }"
            />
          </VueDraggable>
          
          <div v-if="childrenModel.length === 0" class="absolute inset-0 flex items-center justify-center pointer-events-none bg-gray-50/50 border border-dashed border-gray-300"/>
        </div>
      </template>
    </component>
  </div>
</template>