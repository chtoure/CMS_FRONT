<script setup lang="ts">
import { computed } from 'vue';
import { FAMILY_CAPABILITIES, type AnyComponentInstance } from '../../type/component';
import { VueDraggable } from 'vue-draggable-plus';
import { COMPONENT_MAP } from '../../registry/component_registry';

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
</script>

<template>
  <div class="relative w-full h-full group/renderer">
    <component 
      v-if="componentToRender"
      :is="componentToRender" 
      :styles="element.styles" 
      :data="element.data"
    >
      <template v-if="FAMILY_CAPABILITIES[element.family].canHaveChildren">
        <VueDraggable
          v-model="childrenModel"
          group="blocks"
          :animation="150"
          class="min-h-[60px] w-full p-2 border-2 border-dashed border-gray-100 rounded-lg"
        >
          <BlocRender 
            v-for="(child, index) in childrenModel" 
            :key="child.id" 
            :element="child"
            @update:element="(newChild: AnyComponentInstance) => childrenModel[index] = newChild"
          />
          
          <div v-if="childrenModel.length === 0" class="py-8 text-center text-gray-400">
            <span class="text-[9px] font-bold uppercase">Zone de dépôt</span>
          </div>
        </VueDraggable>
      </template>
    </component>
  </div>
</template>