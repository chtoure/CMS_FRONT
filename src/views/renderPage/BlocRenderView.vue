<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, inject } from 'vue';
import { COMPONENT_MAP } from '../../registry/component_registry';
import { FAMILY_CAPABILITIES, type ComponentFamily } from '../../type/component';
import type { HydratedBlock } from '../../type/page'; // Import de l'interface créée
import { buildBlocLayoutStyles, buildBlocLayoutInlineStyles } from '../../lib/style/blocProcessor';
import { buildSectionStyles, buildSectionInlineStyles } from '../../lib/style/sectionProcessor';
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

const normalizeStyles = (rawStyles: any): Record<string, unknown> => {
  if (!rawStyles) return {};
  if (rawStyles.styles && typeof rawStyles.styles === 'object') {
     return rawStyles.styles as Record<string, unknown>;
  }
  return rawStyles as Record<string, unknown>;
};

const normalizedElementStyles = computed<Record<string, unknown>>(() => normalizeStyles(props.element.styles));

/**
 * Calcul des classes et styles de layout pour correspondre au builder
 */
const layoutClasses = computed(() => {
  return buildBlocLayoutStyles(normalizedElementStyles.value, resolveValue);
});

const layoutInlineStyles = computed(() => {
  return buildBlocLayoutInlineStyles(normalizedElementStyles.value, builderState.currentBreakpoint.value, resolveValue);
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
  const item = props.parentData?._inherited_item;
  if (item) {
    const params = props.element.params || [];
    params.forEach((p: any) => {
      if (p.type?.source === 'parent' && p.type?.parentKey) {
        // Paramètre lié via un item hérité du conteneur ancêtre
        if (p.type.parentParamName === '_inherited_query') {
          const val = item[p.type.parentKey];
          if (val !== undefined) data[p.name] = val;
        }
      }
    });
  }

  // Si le nœud courant a des paramètres source:parent pointant vers un param du parent
  // (cas feuille liée directement à une query param du conteneur parent)
  if (!item && props.parentData) {
    const parentItems: any[] = (props.element.data as any)?.items || [];
    if (parentItems.length === 0) {
      // Essayer de résoudre en lisant les params du parent fournis dans parentData
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

// function formatColor(value: unknown) {
//   const raw = formatSize(value);
//   if (!raw || typeof raw !== 'string') return undefined;
//   if (raw.startsWith('#') || raw.startsWith('rgba') || raw.startsWith('hsl') || raw.startsWith('bg-') || raw.startsWith('text-') || raw.startsWith('border-')) {
//     return raw;
//   }
//   if (/^[0-9A-Fa-f]{6}$/.test(raw)) return `#${raw}`;
//   return raw;
// }

// Tri par order supprimé pour parité parfaite avec CanvaView / VueDraggable qui lit le tableau natif.
const elementChildren = computed(() => {
  return props.element.children || [];
});

/**
 * Styles supplémentaires pour les sections : marginTop, marginBottom, height
 * (valeurs non gérées dans buildSectionInlineStyles mais présentes dans le builder)
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

/**
 * Applique l'image de fond depuis l'item hérité au container
 */
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

/**
 * Extrait l'URL vidéo depuis element.styles.bgVideo
 */
const bgVideoUrl = computed((): string | null => {
  const raw = (normalizedElementStyles.value as any)?.bgVideo;
  if (!raw) return null;
  const inner = (raw && typeof raw === 'object' && 'value' in raw) ? raw.value : raw;
  if (inner && typeof inner === 'object' && 'url' in inner) return inner.url as string;
  if (typeof inner === 'string') return inner;
  return null;
});

/**
 * Retourne true si un enfant FEUILLE a au moins un paramètre lié
 * à un paramètre de type query du parent courant.
 */
function isLeafLinkedToQuery(child: HydratedBlock): boolean {
  if (!props.element.data?.isIterated) return false;
  const queryParamNames = (props.element.params || []).filter(
    (p: any) => p.type?.source === 'contenus' && p.type?.config?.mode === 'query'
  ).map((p: any) => p.name);

  // Feuille container classique liée
  if ((child.data as any)?.linkedQueryParamName) return true;

  // Feuille avec params source:parent pointant vers un query param du parent
  return (child.params || []).some(
    (p: any) => p.type?.source === 'parent' && queryParamNames.includes(p.type?.parentParamName)
  );
}

/**
 * Résout les données d'une feuille enfant pour un item CMS donné
 * en appliquant le mapping param-par-param.
 */
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

/**
 * Retourne les items CMS pour un enfant lié à une query
 */
const getItemsForChild = (child: HydratedBlock): any[] => {
  // Cas container enfant lié via linkedQueryParamName
  const linkedParam = (child.data as any)?.linkedQueryParamName;
  if (linkedParam) {
    const items = (props.element.data as any)?.items;
    return Array.isArray(items) ? items : [];
  }

  // Cas feuille avec params source:parent
  if ((child.params || []).some((p: any) => p.type?.source === 'parent')) {
    const items = (props.element.data as any)?.items;
    return Array.isArray(items) ? items : [];
  }

  return [];
};

</script>

<template>
  <!-- 1. CAS DES SECTIONS RACINES -->
  <section
    v-show="builderState.isVisible(element.id, (element as any).blocTemplateId)"
    v-if="!componentToRender && element.children"
    class="relative group/section flex flex-col transition-all duration-200"
    :class="buildSectionStyles(normalizedElementStyles, resolveValue)"
    :style="{ ...buildSectionInlineStyles(normalizedElementStyles, builderState.currentBreakpoint.value, resolveValue), ...extraSectionStyles }"
  >
    <!-- Background Video -->
    <video
      v-if="bgVideoUrl"
      :src="bgVideoUrl"
      autoplay
      loop
      muted
      playsinline
      class="absolute inset-0 w-full h-full object-cover -z-10 pointer-events-none"
    ></video>

    <!-- Conteneur enfants (sans padding ni min-h artificiels du builder) -->
    <div class="w-full flex-1">
      <template v-for="child in elementChildren" :key="child.id">
        <!-- Cas 1 : Itération activée pour cet enfant lié à une liste -->
        <template v-if="isLeafLinkedToQuery(child)">
          <div
            v-for="(item, itemIndex) in getItemsForChild(child)"
            :key="`${child.id}-${itemIndex}`"
            v-show="builderState.isVisible(child.id, (child as any).blocTemplateId)"
            class="relative transition-all outline-none"
            :style="{
              width: formatSize(normalizeStyles(child.styles)?.width, '100%'),
              height: formatSize(normalizeStyles(child.styles)?.height)
            }"
          >
            <BlocRenderView
              :element="applyBgImageToContainer({ ...child, data: resolveLeafData(child, item) }, item)"
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
            width: formatSize(normalizeStyles(child.styles)?.width, '100%'),
            height: formatSize(normalizeStyles(child.styles)?.height)
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
    :styles="normalizedElementStyles"
    :data="finalData"
    class="relative isolate h-full transition-all duration-200"
  >
    <!-- Background Video -->
    <video
      v-if="bgVideoUrl"
      :src="bgVideoUrl"
      autoplay
      loop
      muted
      playsinline
      class="absolute inset-0 w-full h-full object-cover -z-10 pointer-events-none"
    ></video>

    <!-- Slot pour les enfants (Imitation BlocRender.vue) -->
    <template v-if="canHaveChildren && element.children">
      <div
        class="w-full h-full"
        :class="layoutClasses"
        :style="layoutInlineStyles"
      >
        <template v-for="child in elementChildren" :key="child.id">
            <!-- Cas 1 : Itération -->
            <template v-if="isLeafLinkedToQuery(child)">
              <div
                v-for="(item, itemIndex) in getItemsForChild(child)"
                :key="`${child.id}-${itemIndex}`"
                v-show="builderState.isVisible(child.id, (child as any).blocTemplateId)"
                class="relative transition-all outline-none"
                :style="{
                  width: formatSize(normalizeStyles(child.styles)?.width, '100%'),
                  height: formatSize(normalizeStyles(child.styles)?.height)
                }"
              >
                <BlocRenderView
                  :element="applyBgImageToContainer({ ...child, data: resolveLeafData(child, item) }, item)"
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
              width: formatSize(normalizeStyles(child.styles)?.width, '100%'),
              height: formatSize(normalizeStyles(child.styles)?.height)
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
