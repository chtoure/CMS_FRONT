<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';
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

/**
 * Calcul des styles pour le rendu des sections (fallback si pas de composant spécifique)
 * On utilise CSSProperties pour valider le typage des attributs style
 */
const sectionStyles = computed((): CSSProperties => {
  const s = props.element.styles;

  return {
    display: (formatSize(s?.display) || 'block') as any,
    backgroundColor: formatColor(s?.bg),
    padding: formatSize(s?.padding) as string,
    opacity: s?.opacity as number,
    gap: formatSize(s?.gap) as string,
    flexDirection: (formatSize(s?.direction) === 'vertical' ? 'column' : 'row') as any,
    justifyContent: formatSize(s?.justify) as any,
    alignItems: formatSize(s?.align) as any,
    borderWidth: formatSize(s?.borderWidth) as string,
    borderColor: formatColor(s?.borderColor),
    borderStyle: formatSize(s?.borderStyle) as any,
  };
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

// --- Fonctions Helper identiques au Builder ---

function formatSize(value: any, defaultValue: string | undefined = undefined) {
  if (!value) return defaultValue;
  let finalValue = typeof value === 'object' && 'default' in value ? value.default : value;
  if (finalValue === 'full') return '100%';
  if (typeof finalValue === 'number' || !isNaN(Number(finalValue))) return `${finalValue}px`;
  return finalValue;
}

function formatColor(value: any) {
  const raw = formatSize(value);
  if (!raw || typeof raw !== 'string') return undefined;
  if (raw.startsWith('#') || raw.startsWith('rgba') || raw.startsWith('bg-')) return raw;
  if (/^[0-9A-Fa-f]{6}$/.test(raw)) return `#${raw}`;
  return raw;
}
</script>

<template>
  <section
    v-if="!componentToRender && element.children"
    :style="sectionStyles"
    class="w-full min-h-[50px]"
  >
    <BlocRenderView
      v-for="child in element.children"
      :key="child.id"
      :element="child"
      :parent-data="finalData"
    />
  </section>

  <component
    v-else-if="componentToRender"
    :is="componentToRender"
    :styles="element.styles"
    :data="finalData"
  >
    <template v-if="canHaveChildren && element.children">
      <BlocRenderView
        v-for="child in element.children"
        :key="child.id"
        :element="child"
        :parent-data="finalData"
      />
    </template>
  </component>
</template>
