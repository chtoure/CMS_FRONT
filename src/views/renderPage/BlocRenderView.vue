<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed } from 'vue';
import { COMPONENT_MAP } from '../../registry/component_registry';
import { FAMILY_CAPABILITIES, type ComponentFamily } from '../../type/component';
import type { HydratedBlock } from '../../type/page'; // Import de l'interface créée

// On définit le nom pour la récursivité
defineOptions({
  name: 'BlocRenderView'
});

interface Props {
  element: HydratedBlock;
  parentData?: any;
}

const props = defineProps<Props>();

// On récupère le composant correspondant au tag (ex: TextBuilder)
const componentToRender = COMPONENT_MAP[props.element.tag];

import { buildLayoutStyles, buildLayoutInlineStyles } from '../../lib/styleProcessor';

/**
 * Calcul des classes et styles de layout pour correspondre au builder
 */
const layoutClasses = computed(() => {
  return buildLayoutStyles(props.element.styles as Record<string, unknown>);
});

const layoutInlineStyles = computed(() => {
  return buildLayoutInlineStyles(props.element.styles as Record<string, unknown>);
});

/**
 * Fusion des données du bloc et des données injectées par le parent (CMS)
 */
const finalData = computed(() => ({
  ...props.element.data,
  ...props.parentData
}));

/**
 * Sécurisation de la capacité à avoir des enfants
 */
const canHaveChildren = computed(() => {
  const familyKey = props.element.family as ComponentFamily;
  return FAMILY_CAPABILITIES[familyKey]?.canHaveChildren || false;
});

/**
 * Fonctions Helper identiques au SectionBuilder pour garantir la parité
 */
function formatSize(value: unknown, defaultValue: string | undefined = undefined) {
  if (value === undefined || value === null || value === '') return defaultValue;
  let finalValue = value;
  if (typeof value === 'object' && value !== null && 'default' in (value as Record<string, unknown>)) {
    finalValue = (value as Record<string, any>).default;
  }
  if (finalValue === 'full') return '100%';
  if (typeof finalValue === 'number') return `${finalValue}px`;
  if (typeof finalValue === 'string' && !isNaN(Number(finalValue)) && finalValue.trim() !== '') return `${finalValue}px`;
  return finalValue as string;
}

function formatColor(value: unknown) {
  const raw = formatSize(value);
  if (!raw || typeof raw !== 'string') return undefined;
  if (raw.startsWith('#') || raw.startsWith('rgba') || raw.startsWith('hsl') || raw.startsWith('bg-') || raw.startsWith('text-') || raw.startsWith('border-')) {
    return raw;
  }
  if (/^[0-9A-Fa-f]{6}$/.test(raw)) return `#${raw}`;
  return raw;
}

/**
 * Tri des enfants par leur propriété 'order' pour garantir la parité avec le builder
 */
const sortedChildren = computed(() => {
  if (!props.element.children) return [];
  return [...props.element.children].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
});

</script>

<template>
  <!-- 1. CAS DES SECTIONS RACINES -->
  <section
    v-if="!componentToRender && element.children"
    class="relative w-full min-h-[100px] transition-all"
    :class="{
      'flex': formatSize(element.styles?.display) === 'flex',
      'grid': formatSize(element.styles?.display) === 'grid',
      'hidden': formatSize(element.styles?.display) === 'hidden',
    }"
    :style="{
      backgroundColor: formatColor(element.styles?.bg),
      padding: formatSize(element.styles?.padding),
      opacity: element.styles?.opacity as any,
      gap: formatSize(element.styles?.gap),
      flexDirection: (formatSize(element.styles?.direction) === 'vertical' ? 'column' : 'row') as any,
      justifyContent: formatSize(element.styles?.justify) as any,
      alignItems: formatSize(element.styles?.align) as any,
      borderWidth: formatSize(element.styles?.borderWidth),
      borderColor: formatColor(element.styles?.borderColor),
      borderStyle: formatSize(element.styles?.borderStyle) as any,
    }"
  >
    <!-- On imite exactement le VueDraggable du SectionBuilder.vue -->
    <div
      class="w-full h-full flex flex-wrap"
      :class="{
        'flex-row': formatSize(element.styles?.direction) !== 'vertical',
        'flex-col': formatSize(element.styles?.direction) === 'vertical',
        'justify-start': formatSize(element.styles?.justify) === 'start',
        'justify-center': formatSize(element.styles?.justify) === 'center',
        'justify-end': formatSize(element.styles?.justify) === 'end',
        'justify-between': formatSize(element.styles?.justify) === 'between',
        'items-start': formatSize(element.styles?.align) === 'start',
        'items-center': formatSize(element.styles?.align) === 'center',
        'items-end': formatSize(element.styles?.align) === 'end',
      }"
    >
      <div
        v-for="child in sortedChildren"
        :key="child.id"
        class="relative transition-all outline-none"
        :style="{
          width: formatSize(child.styles?.width, '100%'),
          height: formatSize(child.styles?.height)
        }"
      >
        <BlocRenderView
          :element="child"
          :parent-data="finalData"
        />
      </div>
    </div>
  </section>

  <!-- 2. CAS DES COMPOSANTS STANDARDS -->
  <component
    v-else-if="componentToRender"
    :is="componentToRender"
    :styles="element.styles"
    :data="finalData"
  >
    <!-- Slot pour les enfants (Imitation BlocRender.vue) -->
    <template v-if="canHaveChildren && element.children">
      <div
        class="w-full h-full"
        :class="layoutClasses"
        :style="layoutInlineStyles"
      >
        <div
          v-for="child in sortedChildren"
          :key="child.id"
          class="relative transition-all outline-none"
          :style="{
            width: formatSize(child.styles?.width, '100%'),
            height: formatSize(child.styles?.height)
          }"
        >
          <BlocRenderView
            :element="child"
            :parent-data="finalData"
          />
        </div>
      </div>
    </template>
  </component>
</template>
