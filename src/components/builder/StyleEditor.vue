<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { computed } from 'vue';
import type { AnyComponentInstance } from '../../type/component';
import type { AnySectionInstance } from '../../type/section';

// Imports des éditeurs (pourraient être asynchrones pour optimiser, mais ici on reste simple pour la flexibilité)
import BaseStyleEditor from './styles/BaseStyleEditor.vue';
import SectionStyleEditor from './styles/SectionStyleEditor.vue';
import BlocStyleEditor from './styles/BlocStyleEditor.vue';
import ImageStyleEditor from './styles/ImageStyleEditor.vue';
import IconStyleEditor from './styles/IconStyleEditor.vue';
import CardStyleEditor from './styles/CardStyleEditor.vue';
import InputStyleEditor from './styles/InputStyleEditor.vue';
import ButtonStyleEditor from './styles/ButtonStyleEditor.vue';
import SliderStyleEditor from './styles/SliderStyleEditor.vue';
import AccordionStyleEditor from './styles/AccordionStyleEditor.vue';
import LinkStyleEditor from './styles/LinkStyleEditor.vue';
import TextStyleEditor from './styles/TextStyleEditor.vue';

const props = defineProps<{
  element: AnyComponentInstance | AnySectionInstance;
}>();

// Déterminer quel éditeur afficher en fonction du tag ou de la famille
const currentEditor = computed(() => {
  const family = props.element.family;
  const tag = (props.element as any).tag;

  if (family === 'section') return 'section';
  if (tag === 'BlocRender' || family === 'container') return 'bloc';
  if (tag === 'ButtonBuilder') return 'button';
  if (tag === 'LinkBuilder') return 'link';
  if (tag === 'SliderBuilder') return 'slider';
  if (tag === 'AccordionBuilder') return 'accordion';
  if (tag === 'ImageBuilder') return 'image';
  if (tag === 'IconBuilder') return 'icon';
  if (tag === 'CardBuilder') return 'card';
  if (tag === 'InputBuilder') return 'input';
  if (family === 'static') return 'text';
  
  return 'base';
});
</script>

<template>
  <div class="pb-20 p-1">
    <!-- Dispatcher d'éditeurs -->
    
    <!-- Section -->
    <template v-if="currentEditor === 'section'">
      <SectionStyleEditor :element="(element as any)" />
    </template>

    <!-- Bloc -->
    <template v-else-if="currentEditor === 'bloc'">
      <BlocStyleEditor :element="(element as any)" />
    </template>

    <!-- Image -->
    <template v-else-if="currentEditor === 'image'">
      <ImageStyleEditor :element="(element as any)" />
    </template>

    <!-- Icon -->
    <template v-else-if="currentEditor === 'icon'">
      <IconStyleEditor :element="(element as any)" />
    </template>

    <!-- Card -->
    <template v-else-if="currentEditor === 'card'">
      <CardStyleEditor :element="(element as any)" />
    </template>

    <!-- Input -->
    <template v-else-if="currentEditor === 'input'">
      <InputStyleEditor :element="(element as any)" />
    </template>

    <!-- Bouton -->
    <template v-else-if="currentEditor === 'button'">
      <ButtonStyleEditor :element="(element as any)" />
    </template>

    <!-- Lien -->
    <template v-else-if="currentEditor === 'link'">
      <LinkStyleEditor :element="(element as any)" />
    </template>

    <!-- Slider -->
    <template v-else-if="currentEditor === 'slider'">
      <SliderStyleEditor :element="(element as any)" />
    </template>

    <!-- Accordéon -->
    <template v-else-if="currentEditor === 'accordion'">
      <AccordionStyleEditor :element="(element as any)" />
    </template>


    <!-- Texte / Static -->
    <template v-else-if="currentEditor === 'text'">
      <TextStyleEditor :element="(element as any)" />
    </template>

    <!-- Par défaut : Base -->
    <template v-else>
      <BaseStyleEditor :element="element" />
    </template>
  </div>
</template>

<style scoped>
/* Les styles sont maintenant dans les sous-composants */
</style>
