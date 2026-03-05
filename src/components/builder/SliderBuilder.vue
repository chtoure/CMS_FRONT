<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import type { ContainerStyles } from '../../type/component';
import { buildBlocLayoutStyles, buildBlocLayoutInlineStyles } from '../../lib/style/blocProcessor';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { resolveValueForBreakpoint } from '../../lib/style/core';
import { useVariableResolver } from '../../hook/variable';

interface Props {
  styles?: ContainerStyles;
  data?: {
    slides?: any;
  };
}

const props = defineProps<Props>();

const builderState = inject<{
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' }
}>('builderState', { currentBreakpoint: { value: 'default' } } as any);

const { resolveValue } = useVariableResolver();

const currentSlide = ref(0);

const computedClasses = computed(() => {
  return buildBlocLayoutStyles(props.styles as Record<string, unknown>, resolveValue);
});

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  return buildBlocLayoutInlineStyles(props.styles as Record<string, unknown>, bp, resolveValue);
});

const slides = computed(() => {
  const rawSlides = resolveValue(props.data?.slides) as any[];
  if (!rawSlides || !Array.isArray(rawSlides)) {
    return [
      { image: 'https://via.placeholder.com/800x400/3b82f6/ffffff?text=Slide+1', title: 'Slide 1' },
      { image: 'https://via.placeholder.com/800x400/6366f1/ffffff?text=Slide+2', title: 'Slide 2' }
    ];
  }
  return rawSlides.map(s => ({
    image: resolveValue(s.image) as string,
    title: resolveValue(s.title) as string
  }));
});

const nextSlide = () => { currentSlide.value = (currentSlide.value + 1) % slides.value.length; };
const prevSlide = () => { currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length; };
</script>

<template>
  <div class="relative overflow-hidden group/slider" :class="computedClasses" :style="computedInlineStyles">
    <div 
      class="flex transition-transform duration-500 ease-in-out h-full"
      :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
    >
      <div v-for="(slide, index) in slides" :key="index" class="min-w-full h-full relative">
        <img :src="slide.image" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-black/30 flex items-center justify-center text-white text-3xl font-bold p-10 text-center">
          {{ slide.title }}
        </div>
      </div>
    </div>
    
    <button @click="prevSlide" class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-md transition-all opacity-0 group-hover/slider:opacity-100 z-10">
      <i class="ph-caret-left text-white text-2xl"></i>
    </button>
    <button @click="nextSlide" class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-md transition-all opacity-0 group-hover/slider:opacity-100 z-10">
      <i class="ph-caret-right text-white text-2xl"></i>
    </button>
  </div>
</template>
