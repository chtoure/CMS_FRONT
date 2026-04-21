<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, inject } from 'vue';
import { COMPONENT_MAP } from '../../registry/component_registry';
import { FAMILY_CAPABILITIES, type ComponentFamily } from '../../type/component';
import type { HydratedBlock } from '../../type/page';
import { buildBlocLayoutStyles, buildBlocLayoutInlineStyles } from '../../lib/style/blocProcessor';
import { buildSectionStyles, buildSectionInlineStyles, buildSectionLayoutStyles } from '../../lib/style/sectionProcessor';
import { formatSize, resolveValueForBreakpoint } from '../../lib/style/core';
import { useVariableResolver } from '../../hook/variable';
import { getWrapperPositionStyles } from '../../lib/style/common';

defineOptions({ name: 'BlocRenderView' });

interface Props {
  element: HydratedBlock;
  parentData?: any;
}

const props = defineProps<Props>();

const componentToRender = COMPONENT_MAP[props.element.tag];

const builderState = inject<{
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' },
  isVisible: (id: string | number, backendId?: number | null) => boolean
}>('builderState', {
  currentBreakpoint: { value: 'default' },
  isVisible: () => true
} as any);

// Dans le rendu public, isBuilderMode est toujours false.
// On ne force JAMAIS isBuilderMode=true : cela écraserait les styles inline des composants
// et casserait la responsivité (les inline styles ont priorité sur les media queries CSS).
const isBuilderMode = false;

const { resolveValue } = useVariableResolver();

// ─── Normalisation des styles ────────────────────────────────────────────────

const normalizeStyles = (rawStyles: any): Record<string, unknown> => {
  if (!rawStyles) return {};
  if (rawStyles.styles && typeof rawStyles.styles === 'object') {
    return rawStyles.styles as Record<string, unknown>;
  }
  return rawStyles as Record<string, unknown>;
};

const normalizedElementStyles = computed<Record<string, unknown>>(() => normalizeStyles(props.element.styles));

// ─── Helpers de positionnement (miroir exact du Builder) ─────────────────────

/**
 * Retourne true si l'élément est en position fixed ou absolute (hors du flux normal).
 * Miroir de isOutOfFlow() dans SectionBuilder.vue et BlocRender.vue.
 */
function isOutOfFlow(element: HydratedBlock): boolean {
  const bp = builderState.currentBreakpoint.value;
  const pos = normalizeStyles(element.styles)?.position;
  const p = resolveValueForBreakpoint<string>(pos, bp, resolveValue);
  return p === 'fixed' || p === 'absolute';
}




/**
 * Retourne true si l'élément est en position sticky.
 * Miroir de isSticky() dans SectionBuilder.vue et BlocRender.vue.
 */
function isStickyElement(element: HydratedBlock): boolean {
  const bp = builderState.currentBreakpoint.value;
  const pos = normalizeStyles(element.styles)?.position;
  return resolveValueForBreakpoint<string>(pos, bp, resolveValue) === 'sticky';
}

/**
 * Retourne les styles de positionnement (position, top, left, right, bottom, zIndex)
 * à appliquer sur le WRAPPER div de l'enfant.
 * NOTE CRITIQUE : Ces styles doivent être appliqués sur le wrapper <div>, PAS sur
 * <BlocRenderView> lui-même, car BlocRenderView est un fragment (2 racines conditionnelles)
 * et Vue 3 n'hérite pas les attrs sur les fragments.
 */
function childWrapperStyles(element: HydratedBlock, defaultWidth?: string, defaultHeight?: string): Record<string, string> {
  const bp = builderState.currentBreakpoint.value;
  const styles = normalizeStyles(element.styles);

  // Dimensions toujours sur le wrapper
  const result: Record<string, string> = {};
  const w = formatSize(styles?.width, bp, resolveValue, defaultWidth);
  const h = formatSize(styles?.height, bp, resolveValue, defaultHeight);

  if (isOutOfFlow(element) || isStickyElement(element)) {
    // Position hors flux → les styles de positionnement vont sur le wrapper
    // (miroir exact de ce que fait ResizerWrapper dans le builder)
    const posStyles = getWrapperPositionStyles(styles, bp, resolveValue);
    Object.assign(result, posStyles);
    // Pour fixed/absolute : utiliser la largeur définie OU laisser le navigateur décider
    if (w) result.width = w;
    if (h) result.height = h;
  } else {
    // Éléments dans le flux normal : width/height sur le wrapper
    if (w) result.width = w;
    if (h) result.height = h;
  }

  return result;
}

// ─── Section racine : détection si elle-même est positionnée ─────────────────

const isSectionPositioned = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  const pos = normalizedElementStyles.value?.position;
  const p = resolveValueForBreakpoint<string>(pos, bp, resolveValue);
  return p === 'fixed' || p === 'absolute' || p === 'sticky';
});

// ─── Helpers locaux au rendu (ne modifient pas les processors partagés) ──────

/**
 * Filtre les classes avec préfixe de breakpoint vide (ex: 'lg:', 'sm:')
 * générées quand un mapper retourne '' pour une valeur responsive.
 */
function cleanClasses(raw: string): string {
  return raw.split(' ').filter(c => c && !/^(sm|md|lg|xl|2xl):$/.test(c)).join(' ');
}

/**
 * Styles sans padding/paddingX/paddingY pour le div INTERNE des enfants.
 * Le padding est déjà appliqué par le composant lui-même (buildCardInlineStyles etc.).
 * Évite le double padding : composant + div des enfants.
 */
const layoutOnlyStyles = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { padding, paddingX, paddingY, ...rest } = normalizedElementStyles.value;
  return rest;
});

/**
 * Styles inline critiques pour le layout (display, flexDirection, gridTemplateColumns)
 * que buildBlocLayoutInlineStyles(isBuilderMode=false) ne génère pas.
 * Garantit le rendu correct en production même si les classes Tailwind dynamiques sont purgées.
 */
const criticalLayoutInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  const styles = layoutOnlyStyles.value;
  const inline: Record<string, string> = {};

  const displayVal = resolveValueForBreakpoint<string>(styles.display, bp, resolveValue);
  if (displayVal && displayVal !== '') {
    inline.display = displayVal === 'hidden' ? 'none' : displayVal;
  }

  const directionVal = resolveValueForBreakpoint<string>(styles.direction, bp, resolveValue);
  if (directionVal) {
    inline.flexDirection = directionVal === 'horizontal' ? 'row' : 'column';
  }

  const columnsVal = resolveValueForBreakpoint<unknown>(styles.columns, bp, resolveValue);
  if (columnsVal != null && !isNaN(Number(columnsVal))) {
    inline.gridTemplateColumns = `repeat(${columnsVal}, minmax(0, 1fr))`;
  }

  return inline;
});

/**
 * Idem pour les SECTIONS (CAS 1) : display + flexDirection inline
 * pour garantir le rendu en production.
 */
const sectionCriticalLayoutInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  const styles = normalizedElementStyles.value;
  const inline: Record<string, string> = {};

  const displayVal = resolveValueForBreakpoint<string>(styles.display, bp, resolveValue);
  if (displayVal && displayVal !== '') {
    inline.display = displayVal === 'hidden' ? 'none' : displayVal;
  }

  const directionVal = resolveValueForBreakpoint<string>(styles.direction, bp, resolveValue);
  if (directionVal) {
    inline.flexDirection = directionVal === 'horizontal' ? 'row' : 'column';
  }

  const columnsVal = resolveValueForBreakpoint<unknown>(styles.columns, bp, resolveValue);
  if (columnsVal != null && !isNaN(Number(columnsVal))) {
    inline.gridTemplateColumns = `repeat(${columnsVal}, minmax(0, 1fr))`;
  }

  return inline;
});

// ─── Layout des blocs (conteneurs avec enfants) ───────────────────────────────
// On utilise les CLASSES Tailwind natives (buildBlocLayoutStyles) SANS filterResponsiveClasses
// car dans le rendu public, le navigateur gère les media queries nativement.

const layoutClasses = computed(() => {
  // layoutOnlyStyles : sans padding (déjà géré par le composant lui-même)
  // cleanClasses : filtre les classes breakpoint vides (lg:, sm:...)
  return cleanClasses(buildBlocLayoutStyles(layoutOnlyStyles.value, resolveValue));
});

// Styles inline pour les blocs : gap, justifyContent, alignItems
const layoutInlineStyles = computed(() => {
  return buildBlocLayoutInlineStyles(
    layoutOnlyStyles.value,
    builderState.currentBreakpoint.value,
    resolveValue,
    isBuilderMode // false → classes Tailwind + criticalLayoutInlineStyles gèrent display etc.
  );
});

// ─── Styles des sections ──────────────────────────────────────────────────────
// Séparation visuel / layout exactement comme SectionBuilder.vue

const sectionVisualStyles = computed(() => {
  if (!props.element.children) return {};
  const all = buildSectionInlineStyles(
    normalizedElementStyles.value,
    builderState.currentBreakpoint.value,
    resolveValue,
    isBuilderMode
  );
  // On retire les propriétés de layout (gap, justify, align) qui vont sur le div interne
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { gap, justifyContent, alignItems, ...visual } = all;
  return visual;
});

const sectionLayoutInlineStyles = computed(() => {
  if (!props.element.children) return {};
  const all = buildSectionInlineStyles(
    normalizedElementStyles.value,
    builderState.currentBreakpoint.value,
    resolveValue,
    isBuilderMode
  );
  // Uniquement les propriétés de layout sur le div interne
  const result: Record<string, string> = {};
  if (all.gap) result.gap = all.gap;
  if (all.justifyContent) result.justifyContent = all.justifyContent;
  if (all.alignItems) result.alignItems = all.alignItems;
  // NOTE : display, flexDirection et gridTemplateColumns sont gérés par les classes
  // Tailwind (buildSectionLayoutStyles) — le navigateur applique les media queries nativement.
  return result;
});

// ─── Données fusionnées ───────────────────────────────────────────────────────

const finalData = computed(() => {
  const data = { ...props.element.data, ...props.parentData };

  const item = props.parentData?._inherited_item;
  if (item) {
    const params = props.element.params || [];
    params.forEach((p: any) => {
      if (p.type?.source === 'parent' && p.type?.parentKey) {
        if (p.type.parentParamName === '_inherited_query') {
          const val = item[p.type.parentKey];
          if (val !== undefined) data[p.name] = val;
        }
      }
    });
  }

  if (!item && props.parentData) {
    const parentItems: any[] = (props.element.data as any)?.items || [];
    if (parentItems.length === 0) {
      const params = props.element.params || [];
      params.forEach((p: any) => {
        if (p.type?.source === 'parent' && p.type?.parentKey && props.parentData[p.type.parentParamName] !== undefined) {
          data[p.name] = props.parentData[p.type.parentParamName];
        }
      });
    }
  }

  return data;
});

// ─── Divers ──────────────────────────────────────────────────────────────────

const canHaveChildren = computed(() => {
  const familyKey = props.element.family as ComponentFamily;
  return FAMILY_CAPABILITIES[familyKey]?.canHaveChildren || false;
});

const elementChildren = computed(() => props.element.children || []);

/**
 * Styles supplémentaires pour les sections : marginTop, marginBottom, height
 */
const extraSectionStyles = computed(() => {
  const styles = normalizedElementStyles.value;
  const bp = builderState.currentBreakpoint.value;
  const extra: Record<string, string> = {};

  const pick = (val: any): string | undefined => {
    if (!val) return undefined;
    const inner = (val && typeof val === 'object' && 'value' in val) ? val.value : val;
    let v = inner;
    if (typeof inner === 'object' && inner !== null && 'default' in inner) {
      v = inner[bp] ?? inner.lg ?? inner.md ?? inner.sm ?? inner.default;
    }
    if (v === 'full') return '100%';
    if (typeof v === 'number') return `${v}px`;
    if (typeof v === 'string' && !isNaN(Number(v)) && v.trim() !== '') return `${v}px`;
    if (typeof v === 'string') return v;
    return undefined;
  };

  const mt = pick(styles.marginTop);
  if (mt) extra.marginTop = mt;
  const mb = pick(styles.marginBottom);
  if (mb) extra.marginBottom = mb;
  const h = pick(styles.height);
  if (h) extra.height = h;

  return extra;
});

function applyBgImageToContainer(child: HydratedBlock, item: any): HydratedBlock {
  const linkedBgKey = (child.data as any)?.linkedBgImageKey;
  if (!linkedBgKey || !item) return child;
  const rawUrl = item[linkedBgKey];
  if (!rawUrl) return child;
  const normStyles = normalizeStyles(child.styles);
  return {
    ...child,
    styles: {
      ...normStyles,
      bgImage: { type: 'media', url: rawUrl, value: { url: rawUrl } } as any
    }
  };
}

const bgVideoUrl = computed((): string | null => {
  const raw = (normalizedElementStyles.value as any)?.bgVideo;
  if (!raw) return null;
  const inner = (raw && typeof raw === 'object' && 'value' in raw) ? raw.value : raw;
  if (inner && typeof inner === 'object' && 'url' in inner) return inner.url as string;
  if (typeof inner === 'string') return inner;
  return null;
});

function isLeafLinkedToQuery(child: HydratedBlock): boolean {
  if (!props.element.data?.isIterated) return false;
  const queryParamNames = (props.element.params || []).filter(
    (p: any) => p.type?.source === 'contenus' && p.type?.config?.mode === 'query'
  ).map((p: any) => p.name);

  if ((child.data as any)?.linkedQueryParamName) return true;

  return (child.params || []).some(
    (p: any) => p.type?.source === 'parent' && queryParamNames.includes(p.type?.parentParamName)
  );
}

function resolveLeafData(child: HydratedBlock, item: any): any {
  const resolved: any = { ...child.data };
  const params = child.params || [];

  params.forEach((p: any) => {
    if (p.type?.source === 'parent' && p.type?.parentKey) {
      const val = item[p.type.parentKey];
      if (val !== undefined) {
        resolved[p.name] = val;
      }
    }
  });

  return resolved;
}

const getItemsForChild = (child: HydratedBlock): any[] => {
  const linkedParam = (child.data as any)?.linkedQueryParamName;
  if (linkedParam) {
    const items = (props.element.data as any)?.items;
    return Array.isArray(items) ? items : [];
  }

  if ((child.params || []).some((p: any) => p.type?.source === 'parent')) {
    const items = (props.element.data as any)?.items;
    return Array.isArray(items) ? items : [];
  }

  return [];
};

/**
 * Pour les enfants en affichage standard (non itéré), si un child container
 * a linkedQueryParamName === '_inherited_query' avec un linkedBgImageKey,
 * on applique le bon fond depuis l'_inherited_item courant.
 */
function resolveChildForInheritedBg(child: HydratedBlock): HydratedBlock {
  const linkedQueryName = (child.data as any)?.linkedQueryParamName;
  if (linkedQueryName === '_inherited_query') {
    const inheritedItem = (finalData.value as any)?._inherited_item;
    if (inheritedItem) {
      return applyBgImageToContainer(child, inheritedItem);
    }
  }
  return child;
}

</script>

<template>
  <!-- ═══════════════════════════════════════════════════════════════════════════
       CAS 1 : SECTION RACINE (élément avec des enfants, sans composant associé)
       Miroir de SectionBuilder.vue
       ═══════════════════════════════════════════════════════════════════════════ -->
  <section
    v-show="builderState.isVisible(element.id, (element as any).blocTemplateId)"
    v-if="!componentToRender && element.children"
    class="group/section flex flex-col transition-all duration-200"
    :class="[
      /* 'relative' conditionnel : supprimé si la section est fixed/absolute/sticky */
      /* afin que position:fixed ne soit pas confiné à son conteneur.               */
      /* Miroir de SectionBuilder.vue ligne 144.                                    */
      !isSectionPositioned && 'relative',
      buildSectionStyles(normalizedElementStyles, resolveValue)
    ]"
    :style="{ ...sectionVisualStyles, ...extraSectionStyles }"
  >
    <!-- Background Video -->
    <video
      v-if="bgVideoUrl"
      :src="bgVideoUrl"
      autoplay loop muted playsinline
      class="absolute inset-0 w-full h-full object-cover -z-10 pointer-events-none"
    ></video>

    <!-- Conteneur des enfants — reçoit les classes de layout (flex/grid/direction)  -->
    <!-- et les styles inline de layout (gap, justify, align).                       -->
    <!-- Miroir du VueDraggable dans SectionBuilder.vue                              -->
    <div
      class="w-full flex-1"
      :class="[
        cleanClasses(buildSectionLayoutStyles(normalizedElementStyles, resolveValue)),
        element.tag === 'SliderBuilder' ? 'slider-flex-container' : ''
      ]"
      :style="{ ...sectionLayoutInlineStyles, ...sectionCriticalLayoutInlineStyles }"
    >
      <template v-for="child in elementChildren" :key="child.id">

        <!-- ── Cas 1a : Itération (liste CMS) ─────────────────────────────── -->
        <template v-if="isLeafLinkedToQuery(child)">
          <div
            v-for="(item, itemIndex) in getItemsForChild(child)"
            :key="`${child.id}-${itemIndex}`"
            v-show="builderState.isVisible(child.id, (child as any).blocTemplateId)"
            class="transition-all outline-none"
            :class="[
              isOutOfFlow(child) ? '' : 'relative',
              element.tag === 'SliderBuilder' ? 'slider-slide' : ''
            ]"
            :style="childWrapperStyles(child, '100%')"
          >
            <!--
              IMPORTANT : on NE passe PAS :style de positionnement sur BlocRenderView !
              BlocRenderView est un fragment (v-if + v-else-if sans v-else) → Vue 3 n'hérite
              PAS les attrs sur les fragments. Les styles de positionnement doivent être
              sur le wrapper <div> ci-dessus via childWrapperStyles().
            -->
            <BlocRenderView
              :element="applyBgImageToContainer({ ...child, data: resolveLeafData(child, item) }, item)"
              :parent-data="{ ...finalData, _inherited_item: item }"
            />
          </div>
        </template>

        <!-- ── Cas 1b : Affichage standard ──────────────────────────────────── -->
        <div
          v-else
          v-show="builderState.isVisible(child.id, (child as any).blocTemplateId)"
          class="transition-all outline-none"
          :class="[
            isOutOfFlow(child) ? '' : 'relative',
            element.tag === 'SliderBuilder' ? 'slider-slide' : ''
          ]"
          :style="childWrapperStyles(child, '100%')"
        >
          <BlocRenderView
            :element="resolveChildForInheritedBg(child)"
            :parent-data="finalData"
          />
        </div>

      </template>
    </div>
  </section>

  <!-- ═══════════════════════════════════════════════════════════════════════════
       CAS 2 : COMPOSANT STANDARD (TextBuilder, CardBuilder, ImageBuilder, etc.)
       Miroir de BlocRender.vue
       ═══════════════════════════════════════════════════════════════════════════ -->
  <component
    v-show="builderState.isVisible(element.id, (element as any).blocTemplateId)"
    v-else-if="componentToRender"
    :is="componentToRender"
    :styles="normalizedElementStyles"
    :data="finalData"
    :children="element.tag === 'SliderBuilder' ? elementChildren : undefined"
    class="relative isolate h-full transition-all duration-200"
  >
    <!-- Background Video -->
    <video
      v-if="bgVideoUrl"
      :src="bgVideoUrl"
      autoplay loop muted playsinline
      class="absolute inset-0 w-full h-full object-cover -z-10 pointer-events-none"
    ></video>

    <!-- Zone des enfants pour les composants-conteneurs (ex: CardBuilder) -->
    <!-- Miroir du div interne dans BlocRender.vue (mode normal)           -->
    <template v-if="canHaveChildren && element.children">
      <div
        class="w-full h-full"
        :class="[layoutClasses, element.tag === 'SliderBuilder' ? 'slider-flex-container' : '']"
        :style="{ ...layoutInlineStyles, ...criticalLayoutInlineStyles }"
      >
        <template v-for="child in elementChildren" :key="child.id">

          <!-- ── Cas 2a : Itération (liste CMS) ────────────────────────────── -->
          <template v-if="isLeafLinkedToQuery(child)">
            <div
              v-for="(item, itemIndex) in getItemsForChild(child)"
              :key="`${child.id}-${itemIndex}`"
              v-show="builderState.isVisible(child.id, (child as any).blocTemplateId)"
              class="transition-all outline-none"
              :class="[
                isOutOfFlow(child) ? '' : 'relative',
                element.tag === 'SliderBuilder' ? 'slider-slide' : ''
              ]"
              :style="childWrapperStyles(child)"
            >
              <BlocRenderView
                :element="applyBgImageToContainer({ ...child, data: resolveLeafData(child, item) }, item)"
                :parent-data="{ ...finalData, _inherited_item: item }"
              />
            </div>
          </template>

          <!-- ── Cas 2b : Standard ──────────────────────────────────────────────── -->
          <div
            v-else
            v-show="builderState.isVisible(child.id, (child as any).blocTemplateId)"
            class="transition-all outline-none"
            :class="[
              isOutOfFlow(child) ? '' : 'relative',
              element.tag === 'SliderBuilder' ? 'slider-slide' : ''
            ]"
            :style="childWrapperStyles(child)"
          >
            <BlocRenderView
              :element="resolveChildForInheritedBg(child)"
              :parent-data="finalData"
            />
          </div>

        </template>
      </div>
    </template>
  </component>
</template>
