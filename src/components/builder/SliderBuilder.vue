<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, inject, ref, onMounted, onUnmounted, watch } from 'vue';
import type { ContainerStyles, AnyComponentInstance } from '../../type/component';
import { buildBlocLayoutStyles, buildBlocLayoutInlineStyles } from '../../lib/style/blocProcessor';
import { buildSliderConfig, buildSliderArrowStyles, buildSliderPaginationStyles } from '../../lib/style/sliderProcessor';
import { applyVisualInline } from '../../lib/style/common';
import { filterResponsiveClasses } from '../../lib/style/core';
import { useVariableResolver } from '../../hook/variable';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

interface Props {
  styles?: ContainerStyles;
  data?: Record<string, any>;
  element?: AnyComponentInstance;
  children?: AnyComponentInstance[];
  totalSlidesCount?: number; // Nombre réel de slides incluant les clones dynamiques CMS
}

const props = defineProps<Props>();

const builderState = inject<{
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' };
  isDragging: { value: boolean };
  selectedId: { value: string | null };
  xRayMode: { value: boolean };
}>('builderState', {
  currentBreakpoint: { value: 'default' },
  isDragging: { value: false },
  selectedId: { value: null },
  xRayMode: { value: false }
} as any);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const isXRayMode = computed(() => builderState?.xRayMode?.value ?? false);
const isBuilder = inject('isBuilder', false) as boolean;

const { resolveValue } = useVariableResolver();

const currentSlide = ref(0);

const computedClasses = computed(() => {
  return filterResponsiveClasses(
    buildBlocLayoutStyles(props.styles as Record<string, unknown>, resolveValue),
    builderState.currentBreakpoint.value
  );
});

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  const styles = props.styles as Record<string, unknown> || {};

  const inline = {
    ...buildBlocLayoutInlineStyles(styles, bp, resolveValue, true)
  };

  // Appliquer les styles visuels (fond, bordures, arrondis, ombres)
  applyVisualInline(inline, styles, (val) => resolveValue(val));

  return inline;
});

const sliderConfig = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  // Les paramètres fonctionnels sont dans 'data', les paramètres de style dans 'styles'
  const config = buildSliderConfig(props.styles as Record<string, unknown>, bp, resolveValue);

  return {
    ...config,
    // slidesPerView est déjà résolu correctement par buildSliderConfig (resolveValueForBreakpoint + parseInt)
    // On ne le surcharge PAS ici pour ne pas casser la résolution par breakpoint.
    transitionDuration: resolveValue(props.data?.transitionDuration) ?? config.transitionDuration,
    transitionEase: resolveValue(props.data?.transitionEase) ?? config.transitionEase,
    autoplay: resolveValue(props.data?.autoPlay) === true,
    autoplaySpeed: resolveValue(props.data?.speed) ?? config.autoplaySpeed,
    showPagination: resolveValue(props.data?.showPagination) === true,
    showArrows: resolveValue(props.data?.showArrows) === true,
    loop: resolveValue(props.data?.loop) === true,
  };
});

const arrowStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  return buildSliderArrowStyles(props.styles as Record<string, unknown>, bp, resolveValue);
});

const paginationStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  return buildSliderPaginationStyles(props.styles as Record<string, unknown>, bp, resolveValue);
});

const slidesPerView = computed(() => {
  const v = Number(sliderConfig.value.slidesPerView);
  return (Number.isFinite(v) && v > 0) ? v : 1;
});

const slidesCount = computed(() => {
  // Si le parent a calculé le vrai total (original + clones CMS), on l'utilise.
  // Sinon, on retombe sur le nombre d'enfants statiques.
  if (props.totalSlidesCount !== undefined && props.totalSlidesCount > 0) {
    return props.totalSlidesCount;
  }
  return props.children ? props.children.length : 0;
});

// Nombre de pages = ceil(slides / par page)
const totalPages = computed(() => {
  const count = slidesCount.value || 0;
  const perView = slidesPerView.value || 1;
  return Math.max(1, Math.ceil(count / perView));
});

// Index MAX que peut prendre currentSlide = (totalPages - 1) * slidesPerView
// = l'indice du premier élément de la dernière page
const maxSlideIndex = computed(() => {
  return (totalPages.value - 1) * slidesPerView.value;
});

// Indice de page courant (0-based)
const currentPage = computed(() => {
  return Math.floor(currentSlide.value / slidesPerView.value);
});

const nextSlide = () => {
  if (slidesCount.value <= slidesPerView.value) return;
  if (currentPage.value >= totalPages.value - 1) {
    if (sliderConfig.value.loop) currentSlide.value = 0;
  } else {
    currentSlide.value = Math.min(maxSlideIndex.value, currentSlide.value + slidesPerView.value);
  }
};

const prevSlide = () => {
  if (slidesCount.value <= slidesPerView.value) return;
  if (currentPage.value <= 0) {
    if (sliderConfig.value.loop) currentSlide.value = maxSlideIndex.value;
  } else {
    currentSlide.value = Math.max(0, currentSlide.value - slidesPerView.value);
  }
};

// goToSlide reçoit un index de PAGE (0, 1, 2...) et le convertit en indice d'élément
const goToSlide = (pageIndex: number) => {
  currentSlide.value = Math.min(maxSlideIndex.value, pageIndex * slidesPerView.value);
};

const isAnySelected = computed(() => {
  const selectedId = builderState?.selectedId?.value;
  if (!selectedId) return false;
  if (selectedId === props.element?.id) return true;

  const checkChildren = (nodes: AnyComponentInstance[]): boolean => {
    for (const node of nodes) {
      if (node.id === selectedId) return true;
      if (node.children && checkChildren(node.children)) return true;
    }
    return false;
  };

  return checkChildren(props.children || []);
});

const isHovered = ref(false);
const autoplayInterval = ref<any>(null);

const startAutoplay = () => {
  // Toujours effacer l'intervalle précédent avant de relancer ou d'évaluer la condition
  stopAutoplay();

  // En mode builder : bloquer l'autoplay seulement si un ENFANT est sélectionné (pas le slider lui-même)
  // En mode rendu : bloquer si n'importe quel élément du slider est sélectionné
  const blockAutoplay = isBuilder
    ? (builderState?.selectedId?.value !== props.element?.id && isAnySelected.value)
    : isAnySelected.value;

  // Si on a décoché l'autoplay ou qu'on édite un élément interne, on ne relance pas
  if (!sliderConfig.value.autoplay || blockAutoplay) return;

  autoplayInterval.value = setInterval(() => {
    if (!isHovered.value) {
      nextSlide();
    }
  }, sliderConfig.value.autoplaySpeed);
};

const stopAutoplay = () => {
  if (autoplayInterval.value) {
    clearInterval(autoplayInterval.value);
    autoplayInterval.value = null;
  }
};

onMounted(() => {
  startAutoplay();
});

onUnmounted(() => {
  stopAutoplay();
});

watch(() => [sliderConfig.value, isAnySelected.value], () => {
  startAutoplay();
}, { deep: true });
</script>

<template>
  <div
    class="relative group/slider w-full"
    :class="[computedClasses, builderState.isDragging?.value ? 'overflow-visible' : 'overflow-hidden']"
    :style="computedInlineStyles"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Viewport : toujours overflow-visible pour que SortableJS détecte correctement les drops -->
    <div class="w-full h-full overflow-visible">
      <!-- Slider-track : overflow-hidden pour clipper les slides dans la zone de contenu (hors padding) -->
      <!-- Slider-track : l'élément qui translade. Il doit ABSOLUMENT être en overflow-visible -->
      <div
        class="slider-track ease-in-out h-full w-full transition-transform overflow-visible"
        :style="{
          transform: builderState.isDragging?.value ? 'none' : 'translateX(-' + (currentSlide * (100 / slidesPerView)) + '%)',
          transitionDuration: sliderConfig.transitionDuration + 'ms',
          transitionTimingFunction: sliderConfig.transitionEase
        }"
      >
      <slot>
        <div v-if="slidesCount === 0" class="w-full h-full flex flex-col items-center justify-center text-builder-bar-text/50 border-2 border-dashed border-builder-bar-border rounded-lg m-4 min-h-[100px]">
           <span class="text-sm font-medium">Déposez des slides ici</span>
        </div>
      </slot>
    </div>
  </div>

    <!-- Flèches et pagination : désactivées par défaut, affichées si activées dans les params -->
    <button v-show="sliderConfig.showArrows && (isBuilder || (slidesCount > slidesPerView && !builderState.isDragging?.value))" @click.stop="prevSlide" :style="arrowStyles" class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-md transition-all z-10 flex items-center justify-center pointer-events-auto" :class="isBuilder ? 'opacity-80 hover:opacity-100' : 'opacity-0 group-hover/slider:opacity-100'">
      <ChevronLeft class="w-6 h-6" :style="{ color: paginationStyles.color }" />
    </button>
    <button v-show="sliderConfig.showArrows && (isBuilder || (slidesCount > slidesPerView && !builderState.isDragging?.value))" @click.stop="nextSlide" :style="arrowStyles" class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-md transition-all z-10 flex items-center justify-center pointer-events-auto" :class="isBuilder ? 'opacity-80 hover:opacity-100' : 'opacity-0 group-hover/slider:opacity-100'">
      <ChevronRight class="w-6 h-6" :style="{ color: paginationStyles.color }" />
    </button>

    <!-- Pagination -->
    <div v-show="sliderConfig.showPagination && (isBuilder || (slidesCount > slidesPerView && !builderState.isDragging?.value))" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 pointer-events-auto">
      <button
        v-for="(_, index) in Math.max(1, maxSlideIndex + 1)"
        :key="index"
        @click.stop="goToSlide(index)"
        class="transition-all duration-300"
        :class="[
          paginationStyles.shape === 'circle' ? 'w-2 h-2 rounded-full' : '',
          paginationStyles.shape === 'line' ? 'w-6 h-1 rounded-sm' : '',
          paginationStyles.shape === 'square' ? 'w-2 h-2 rounded-sm' : ''
        ]"
        :style="{
          backgroundColor: currentSlide === index ? paginationStyles.activeColor : paginationStyles.color,
          opacity: currentSlide === index ? 1 : 0.5
        }"
      />
    </div>
  </div>
</template>

<style scoped>
/* On s'assure que le viewport et le track font bien la taille du contenu */
.slider-track :deep(> div) {
   width: 100%;
   height: 100%;
}

/* Le conteneur Flex (inséré par BlocRender / BlocRenderView) */
.slider-track :deep(.slider-flex-container) {
   display: flex !important;
   flex-direction: row !important;
   flex-wrap: nowrap !important;
   width: 100%;
   height: 100%;
   padding: 0 !important;
   margin: 0 !important;
   gap: 0 !important;
}

/* Les slides réels */
.slider-track :deep(.slider-slide) {
   min-width: calc(100% / v-bind(slidesPerView)) !important;
   max-width: calc(100% / v-bind(slidesPerView)) !important;
   height: 100% !important;
   flex-shrink: 0 !important;
}
</style>
