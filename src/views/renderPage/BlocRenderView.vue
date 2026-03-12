<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, inject } from 'vue';
import { COMPONENT_MAP } from '../../registry/component_registry';
import { FAMILY_CAPABILITIES, type ComponentFamily } from '../../type/component';
import type { HydratedBlock } from '../../type/page'; // Import de l'interface créée
import { buildBlocLayoutStyles, buildBlocLayoutInlineStyles } from '../../lib/style/blocProcessor';
import { useVariableResolver } from '../../hook/variable';

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


const builderState = inject<{ 
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' },
  isVisible: (id: string | number, backendId?: number | null) => boolean
}>('builderState', { 
  currentBreakpoint: { value: 'default' },
  isVisible: () => true 
} as any);

const { resolveValue } = useVariableResolver();

/**
 * Calcul des classes et styles de layout pour correspondre au builder
 */
const layoutClasses = computed(() => {
  return buildBlocLayoutStyles(props.element.styles as Record<string, unknown>, resolveValue);
});

const layoutInlineStyles = computed(() => {
  return buildBlocLayoutInlineStyles(props.element.styles as Record<string, unknown>, builderState.currentBreakpoint.value, resolveValue);
});

/**
 * Fusion des données du bloc et des données injectées par le parent (CMS)
 */
/**
 * Fusion des données du bloc et des données injectées par le parent (CMS)
 * On applique le mapping dynamique si un _inherited_item est présent
 */
const finalData = computed(() => {
  const data = { ...props.element.data, ...props.parentData };

  // Si on a un item hérité d'une boucle CMS, on mappe ses champs sur les paramètres
  if (props.parentData?._inherited_item) {
    const item = props.parentData._inherited_item;
    const params = props.element.params || [];
    
    params.forEach((p: any) => {
      // Si la source est 'parent' et qu'on a une clé, on extrait la valeur de l'item
      if (p.type?.source === 'parent' && p.type?.parentKey) {
        // Le lien vers un élément d'une liste CMS passe par '_inherited_query'
        if (p.type.parentParamName === '_inherited_query') {
          const val = item[p.type.parentKey];
          if (val !== undefined) {
             data[p.name] = val;
          }
        }
      }
    });
  }

  return data;
});

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
  const resolved = resolveValue(value);
  if (resolved === undefined || resolved === null || resolved === '') return defaultValue;
  
  let finalValue = resolved;
  const bp = builderState.currentBreakpoint.value;
  
  if (typeof resolved === 'object' && resolved !== null && 'default' in (resolved as Record<string, unknown>)) {
    const resObj = resolved as Record<string, any>;
    if (bp === 'lg' && resObj.lg !== undefined) finalValue = resObj.lg;
    else if ((bp === 'lg' || bp === 'md') && resObj.md !== undefined) finalValue = resObj.md;
    else if (bp !== 'default' && resObj.sm !== undefined) finalValue = resObj.sm;
    else finalValue = resObj.default;
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
    v-show="builderState.isVisible(element.id, (element as any).blocTemplateId)"
    v-if="!componentToRender && element.children"
    class="relative w-full transition-all"
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
      <template v-for="child in sortedChildren" :key="child.id">
        <!-- Cas 1 : Itération activée pour cet enfant lié à une liste -->
        <template v-if="element.data?.isIterated && (child.data as any)?.linkedQueryParamName">
          <div
            v-for="(item, itemIndex) in (element.data.items || [])"
            :key="`${child.id}-${itemIndex}`"
            v-show="builderState.isVisible(child.id, (child as any).blocTemplateId)"
            class="relative transition-all outline-none"
            :style="{
              width: formatSize(child.styles?.width, '100%'),
              height: formatSize(child.styles?.height)
            }"
          >
            <BlocRenderView
              :element="child"
              :parent-data="{ ...finalData, _inherited_item: item }"
            />
          </div>
        </template>

        <!-- Cas 2 : Affichage standard -->
        <div
          v-else
          v-show="builderState.isVisible(child.id, (child as any).blocTemplateId)"
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
      </template>
    </div>
  </section>

  <!-- 2. CAS DES COMPOSANTS STANDARDS -->
  <component
    v-show="builderState.isVisible(element.id, (element as any).blocTemplateId)"
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
        <template v-for="child in sortedChildren" :key="child.id">
          <!-- Cas 1 : Itération -->
          <template v-if="element.data?.isIterated && (child.data as any)?.linkedQueryParamName">
            <div
              v-for="(item, itemIndex) in (element.data.items || [])"
              :key="`${child.id}-${itemIndex}`"
              v-show="builderState.isVisible(child.id, (child as any).blocTemplateId)"
              class="relative transition-all outline-none"
              :style="{
                width: formatSize(child.styles?.width, '100%'),
                height: formatSize(child.styles?.height)
              }"
            >
              <BlocRenderView
                :element="child"
                :parent-data="{ ...finalData, _inherited_item: item }"
              />
            </div>
          </template>

          <!-- Cas 2 : Standard -->
          <div
            v-else
            v-show="builderState.isVisible(child.id, (child as any).blocTemplateId)"
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
        </template>
      </div>
    </template>
  </component>
</template>
