import { defineAsyncComponent, type Component as VueComponent } from 'vue';

export const COMPONENT_MAP: Record<string, VueComponent> = {
  ButtonBuilder: defineAsyncComponent(() => import('@/components/builder/ButtonBuilder.vue')),

  CardBuilder: defineAsyncComponent(() => import('@/components/builder/CardBuilder.vue')),
  TextBuilder: defineAsyncComponent(() => import('@/components/builder/TextBuilder.vue')),
  ImageBuilder: defineAsyncComponent(() => import('@/components/builder/ImageBuilder.vue')),
  IconBuilder: defineAsyncComponent(() => import('@/components/builder/IconBuilder.vue')),
  InputBuilder: defineAsyncComponent(() => import('@/components/builder/InputBuilder.vue')),
  SliderBuilder: defineAsyncComponent(() => import('@/components/builder/SliderBuilder.vue')),
  AccordionBuilder: defineAsyncComponent(() => import('@/components/builder/AccordionBuilder.vue')),
  LinkBuilder: defineAsyncComponent(() => import('@/components/builder/LinkBuilder.vue'))
};