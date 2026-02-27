<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script lang="ts" setup>
import { computed } from 'vue';
import type { AnyComponentInstance } from '../../type/component';
import type { AnySectionInstance } from '../../type/section';

// Imports des éditeurs (pourraient être asynchrones pour optimiser, mais ici on reste simple pour la flexibilité)
import BaseStyleEditor from './styles/BaseStyleEditor.vue';
import LayoutStyleEditor from './styles/LayoutStyleEditor.vue';
import TextStyleEditor from './styles/TextStyleEditor.vue';
import ButtonStyleEditor from './styles/ButtonStyleEditor.vue';
import SliderStyleEditor from './styles/SliderStyleEditor.vue';
import AccordionStyleEditor from './styles/AccordionStyleEditor.vue';
import LinkStyleEditor from './styles/LinkStyleEditor.vue';

const props = defineProps<{
  element: AnyComponentInstance | AnySectionInstance;
}>();

// Déterminer quel éditeur afficher en fonction du tag ou de la famille
const currentEditor = computed(() => {
  const family = props.element.family;
  const tag = (props.element as any).tag;

  if (family === 'section') return 'section';
  if (tag === 'ButtonBuilder') return 'button';
  if (tag === 'LinkBuilder') return 'link';
  if (tag === 'SliderBuilder') return 'slider';
  if (tag === 'AccordionBuilder') return 'accordion';
  if (family === 'static') return 'text';
  if (family === 'container') return 'container';
  if (family === 'input') return 'text'; // On utilise l'éditeur texte pour les inputs par défaut
  
  return 'base';
});
</script>

<template>
  <div class="pb-20 p-1">
    <!-- Dispatcher d'éditeurs -->
    
    <!-- Section -->
    <template v-if="currentEditor === 'section'">
      <BaseStyleEditor :element="element" :whitelist="['padding', 'bg', 'opacity', 'borderWidth', 'borderColor', 'borderStyle']" />
      <div class="mt-6">
        <LayoutStyleEditor :element="(element as any)" />
      </div>
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
      <BaseStyleEditor :element="element" />
      <div class="mt-6">
        <TextStyleEditor :element="element" />
      </div>
    </template>

    <!-- Conteneur -->
    <template v-else-if="currentEditor === 'container'">
      <BaseStyleEditor :element="element" />
      <div class="mt-6">
        <LayoutStyleEditor :element="element" />
      </div>
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
