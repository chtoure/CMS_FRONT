<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, inject } from 'vue';
import { ChevronLeft, ChevronRight, Layout } from 'lucide-vue-next';
import type { ContainerStyles } from '../../type/component';
import { buildVisualStyles, buildVisualInlineStyles, buildLayoutStyles, buildLayoutInlineStyles, resolveValueForBreakpoint } from '../../lib/styleProcessor';

interface Props {
  styles?: ContainerStyles;
  data?: {
    autoPlay?: boolean;
    speed?: number;
    showPagination?: boolean;
    showArrows?: boolean;
    loop?: boolean;
  };
}

const props = defineProps<Props>();

const currentIndex = ref(0);
const sliderRef = ref<HTMLElement | null>(null);
let intervalId: ReturnType<typeof setInterval> | null = null;

const builderState = inject<{
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' }
}>('builderState', { currentBreakpoint: { value: 'default' } });

// On utilise une ref pour forcer la réactivité du nombre d'enfants
const slides = ref<Element[]>([]);

const updateSlides = () => {
  if (sliderRef.value) {
    slides.value = Array.from(sliderRef.value.children);
  }
};

const childrenCount = computed(() => slides.value.length);

// Observer les changements dans le DOM pour mettre à jour les slides
onMounted(() => {
  updateSlides();
  const observer = new MutationObserver(updateSlides);
  if (sliderRef.value) {
    observer.observe(sliderRef.value, { childList: true });
  }
  onUnmounted(() => observer.disconnect());
});

// Les fonctions next, prev et goTo sont définies plus bas après le calcul de maxIndex

const goTo = (index: number) => {
  currentIndex.value = Math.min(index, maxIndex.value);
};

const startAutoPlay = () => {
  stopAutoPlay();
  if (props.data?.autoPlay) {
    intervalId = setInterval(next, props.data.speed || 3000);
  }
};

const stopAutoPlay = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

onMounted(() => {
  startAutoPlay();
});

onUnmounted(() => {
  stopAutoPlay();
});

watch(() => [props.data?.autoPlay, props.data?.speed], () => {
  startAutoPlay();
});

const computedClasses = computed(() => {
  return buildVisualStyles(props.styles as Record<string, unknown>);
});

const getResponsiveValue = (key: string, defaultValue: any) => {
  const bp = builderState.currentBreakpoint.value;
  const val = resolveValueForBreakpoint((props.styles as Record<string, any>)?.[key], bp);
  return val !== undefined ? val : defaultValue;
};

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  return buildVisualInlineStyles(props.styles as Record<string, unknown>, bp);
});

const computedLayoutClasses = computed(() => {
  return buildLayoutStyles(props.styles as Record<string, unknown>);
});

const computedLayoutInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  return buildLayoutInlineStyles(props.styles as Record<string, unknown>, bp);
});

const transitionDuration = computed(() => getResponsiveValue('transitionDuration', 500));
const transitionEase = computed(() => getResponsiveValue('transitionEase', 'ease-in-out'));
const arrowColor = computed(() => getResponsiveValue('arrowColor', '#FFFFFF'));
const arrowBg = computed(() => getResponsiveValue('arrowBg', 'rgba(255, 255, 255, 0.2)'));
const arrowSize = computed(() => getResponsiveValue('arrowSize', 24));
const pagColor = computed(() => getResponsiveValue('paginationColor', 'rgba(255, 255, 255, 0.5)'));
const pagActiveColor = computed(() => getResponsiveValue('paginationActiveColor', '#3b82f6')); // Primary par défaut
const pagShape = computed(() => getResponsiveValue('paginationShape', 'circle'));

const slidesPerView = computed(() => Math.max(1, getResponsiveValue('slidesPerView', 1)));

const wrapperStyle = computed(() => {
  const gapValue = getResponsiveValue('gap', 0);
  const gapPx = typeof gapValue === 'number' ? gapValue : parseInt(gapValue) || 0;
  
  // Largeur d'un slide en tenant compte du gap
  // Formula: (100% - (N-1)*gap) / N
  const slideWidthCalc = `calc((100% - ${(slidesPerView.value - 1) * gapPx}px) / ${slidesPerView.value})`;

  return {
    transform: `translateX(calc(-${currentIndex.value} * (${slideWidthCalc} + ${gapPx}px)))`,
    transition: `transform ${transitionDuration.value}ms ${transitionEase.value}`,
    display: 'flex',
    width: '100%',
    height: '100%',
    flexDirection: 'row' as const,
    flexWrap: 'nowrap' as const,
    gap: `${gapPx}px`
  };
});

const slideStyle = computed(() => {
  const gapValue = getResponsiveValue('gap', 0);
  const gapPx = typeof gapValue === 'number' ? gapValue : parseInt(gapValue) || 0;
  return {
    flexShrink: 0,
    width: `calc((100% - ${(slidesPerView.value - 1) * gapPx}px) / ${slidesPerView.value})`
  };
});

const maxIndex = computed(() => {
  return Math.max(0, childrenCount.value - slidesPerView.value);
});

const next = () => {
  if (childrenCount.value <= slidesPerView.value) return;
  if (currentIndex.value < maxIndex.value) {
    currentIndex.value++;
  } else if (props.data?.loop !== false) {
    currentIndex.value = 0;
  }
};

const prev = () => {
  if (childrenCount.value <= slidesPerView.value) return;
  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else if (props.data?.loop !== false) {
    currentIndex.value = maxIndex.value;
  }
};
</script>

<template>
  <div 
    class="relative group/slider overflow-hidden w-full h-full min-h-[200px]"
    :class="computedClasses"
    :style="computedInlineStyles"
    @mouseenter="stopAutoPlay"
    @mouseleave="startAutoPlay"
  >
    <!-- Slides Wrapper Outer (le masque de découpe) -->
    <div class="w-full h-full overflow-hidden">
      <!-- Slides Wrapper Inner (le ruban qui défile) -->
      <div 
        :style="{ ...wrapperStyle, ...computedLayoutInlineStyles }" 
        :class="computedLayoutClasses"
        ref="sliderRef"
        class="slider-track"
      >
        <slot />
      </div>
    </div>

    <!-- Navigation Arrows -->
    <template v-if="props.data?.showArrows !== false && childrenCount > 1">
      <button 
        @click.stop="prev"
        class="absolute left-4 top-1/2 -translate-y-1/2 backdrop-blur-md p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 z-10 flex items-center justify-center border border-white/10"
        :style="{ backgroundColor: arrowBg, color: arrowColor }"
      >
        <ChevronLeft :style="{ width: arrowSize + 'px', height: arrowSize + 'px' }" />
      </button>
      <button 
        @click.stop="next"
        class="absolute right-4 top-1/2 -translate-y-1/2 backdrop-blur-md p-2 rounded-full transition-all duration-300 hover:scale-110 active:scale-95 z-10 flex items-center justify-center border border-white/10"
        :style="{ backgroundColor: arrowBg, color: arrowColor }"
      >
        <ChevronRight :style="{ width: arrowSize + 'px', height: arrowSize + 'px' }" />
      </button>
    </template>

    <!-- Pagination Dots -->
    <div 
      v-if="props.data?.showPagination !== false && childrenCount > 1"
      class="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-10 px-3 py-2 rounded-full backdrop-blur-sm bg-black/10 border border-white/5"
    >
      <button 
        v-for="i in childrenCount" 
        :key="i"
        @click.stop="goTo(i-1)"
        class="transition-all duration-300 relative group/dot"
        :class="{
          'rounded-full': pagShape === 'circle',
          'rounded-sm': pagShape === 'square' || pagShape === 'line',
        }"
        :style="{
          width: pagShape === 'line' ? (currentIndex === i-1 ? '24px' : '12px') : '8px',
          height: pagShape === 'line' ? '3px' : '8px',
          backgroundColor: currentIndex === i-1 ? pagActiveColor : pagColor
        }"
      >
        <span class="absolute -inset-2 rounded-full opacity-0 group-hover/dot:bg-white/10 transition-opacity" />
      </button>
    </div>


  </div>
</template>

<style scoped>
.slider-track :deep(*) {
  flex-shrink: 0;
  width: v-bind('slideStyle.width') !important;
}
</style>
