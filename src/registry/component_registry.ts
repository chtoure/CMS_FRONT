import { defineAsyncComponent, type Component as VueComponent } from 'vue';

export const COMPONENT_MAP: Record<string, VueComponent> = {
  ButtonBuilder: defineAsyncComponent(() => import('@/components/builder/ButtonBuilder.vue')),
  GridBuilder: defineAsyncComponent(() => import('@/components/builder/GridBuilder.vue')),
  CardBuilder: defineAsyncComponent(() => import('@/components/builder/CardBuilder.vue')),
};