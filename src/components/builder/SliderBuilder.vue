<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, inject, ref, onMounted, onUnmounted, watch } from 'vue';
import type { ContainerStyles, AnyComponentInstance } from '../../type/component';
import { buildBlocLayoutStyles, buildBlocLayoutInlineStyles } from '../../lib/style/blocProcessor';
import { buildSliderConfig, buildSliderArrowStyles, buildSliderPaginationStyles } from '../../lib/style/sliderProcessor';
import { applyVisualInline } from '../../lib/style/common';
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';
import { useVariableResolver } from '../../hook/variable';

interface Props {
  styles?: ContainerStyles;
  data?: Record<string, any>;
  element?: AnyComponentInstance;
  children?: AnyComponentInstance[];
}

const props = defineProps<Props>();

const builderState = inject<{
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' };
  isDragging: { value: boolean };
  selectedId: { value: string | null };
}>('builderState', {
  currentBreakpoint: { value: 'default' },
  isDragging: { value: false },
  selectedId: { value: null }
} as any);

const { resolveValue } = useVariableResolver();

const currentSlide = ref(0);

const computedClasses = computed(() => {
  return buildBlocLayoutStyles(props.styles as Record<string, unknown>, resolveValue);
});

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  const styles = props.styles as Record<string, unknown> || {};

  const inline = {
    ...buildBlocLayoutInlineStyles(styles, bp, resolveValue)
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
    slidesPerView: resolveValue((props.styles as any)?.slidesPerView) ?? resolveValue(props.data?.slidesPerView) ?? config.slidesPerView,
    transitionDuration: resolveValue(props.data?.transitionDuration) ?? config.transitionDuration,
    transitionEase: resolveValue(props.data?.transitionEase) ?? config.transitionEase,
    autoplay: resolveValue(props.data?.autoPlay) ?? config.autoplay,
    autoplaySpeed: resolveValue(props.data?.speed) ?? config.autoplaySpeed,
    showPagination: resolveValue(props.data?.showPagination) !== false,
    showArrows: resolveValue(props.data?.showArrows) !== false,
    loop: resolveValue(props.data?.loop) !== false,
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
  return sliderConfig.value.slidesPerView || 1;
});

const slidesCount = computed(() => {
  return props.children ? props.children.length : 0;
});

const maxSlideIndex = computed(() => {
  return Math.max(0, slidesCount.value - slidesPerView.value);
});

const nextSlide = () => {
  if (slidesCount.value <= slidesPerView.value) return;
  if (currentSlide.value >= maxSlideIndex.value) {
    if (sliderConfig.value.loop) currentSlide.value = 0;
  } else {
    currentSlide.value++;
  }
};

const prevSlide = () => {
  if (slidesCount.value <= slidesPerView.value) return;
  if (currentSlide.value <= 0) {
    if (sliderConfig.value.loop) currentSlide.value = maxSlideIndex.value;
  } else {
    currentSlide.value--;
  }
};
const goToSlide = (index: number) => { currentSlide.value = index; };

const isAnySelected = computed(() => {
  const selectedId = builderState.selectedId.value;
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
  if (!sliderConfig.value.autoplay || isAnySelected.value) return;
  stopAutoplay();
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
    class="relative overflow-hidden group/slider w-full"
    :class="computedClasses"
    :style="computedInlineStyles"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <div
      class="slider-track transition-transform ease-in-out h-full w-full"
      :style="{
        transform: builderState.isDragging?.value ? 'none' : 'translateX(-' + (currentSlide * (100 / slidesPerView)) + '%)',
        transitionDuration: builderState.isDragging?.value ? '0ms' : sliderConfig.transitionDuration + 'ms',
        transitionTimingFunction: sliderConfig.transitionEase
      }"
    >
      <slot>
        <div v-if="slidesCount === 0" class="w-full h-full flex flex-col items-center justify-center text-builder-bar-text/50 border-2 border-dashed border-builder-bar-border rounded-lg m-4 min-h-[100px]">
           <span class="text-sm font-medium">Déposez des slides ici</span>
        </div>
      </slot>
    </div>

    <button v-show="slidesCount > slidesPerView" @click.stop="prevSlide" :style="arrowStyles" class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-md transition-all opacity-0 group-hover/slider:opacity-100 z-10 flex items-center justify-center">
      <ChevronLeft class="w-6 h-6" :style="{ color: paginationStyles.color }" />
    </button>
    <button v-show="slidesCount > slidesPerView" @click.stop="nextSlide" :style="arrowStyles" class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-md transition-all opacity-0 group-hover/slider:opacity-100 z-10 flex items-center justify-center">
      <ChevronRight class="w-6 h-6" :style="{ color: paginationStyles.color }" />
    </button>

    <!-- Pagination -->
    <div v-show="slidesCount > slidesPerView && sliderConfig.showPagination" class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
      <button
        v-for="(_, index) in (maxSlideIndex + 1)"
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
/* Le conteneur immédiat du slot (div 130 dans BlocRender) */
.slider-track :deep(> div) {
   width: 100%;
   height: 100%;
}

/* Le VueDraggable (div 131 dans BlocRender) */
.slider-track :deep(> div > div) {
   display: flex !important;
   flex-direction: row !important;
   flex-wrap: nowrap !important;
   width: 100%;
   height: 100%;
}

/* Les slides réels (div 149 dans BlocRender) */
.slider-track :deep(> div > div > div) {
   min-width: calc(100% / v-bind(slidesPerView)) !important;
   max-width: calc(100% / v-bind(slidesPerView)) !important;
   height: 100% !important;
   flex-shrink: 0 !important;
}
</style>
