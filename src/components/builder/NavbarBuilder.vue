<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import type { ContainerStyles } from '../../type/component';
import { buildVisualStyles, buildVisualInlineStyles } from '../../lib/styleProcessor';
import CardBuilder from './CardBuilder.vue';

interface Props {
  styles?: ContainerStyles;
  data?: {
    isSticky?: boolean;
    // si false, menu n'est jamais ouvert automatiquement
    responsiveToggle?: boolean;
    // styles distincts pour zones de dépôt gauche et droite
    leftCardStyles?: ContainerStyles;
    rightCardStyles?: ContainerStyles;
    [key: string]: unknown;
  };
}

const props = defineProps<Props>();

const builderState = inject<{
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}>('builderState', { currentBreakpoint: { value: 'default' } } as any);

const isOpen = ref(false);

// si responsiveToggle est false, on affiche toujours le menu (pas de bouton)
const shouldShowMenu = computed(() => {
  if (!props.data?.responsiveToggle) return true;
  const bp = builderState.currentBreakpoint.value;
  // sur grands écrans, laisser visible
  if (bp === 'lg' || bp === 'md') return true;
  return isOpen.value;
});

// désactive la popup quand on passe à un breakpoint large
watch(() => builderState.currentBreakpoint.value, (bp) => {
  if (bp === 'lg' || bp === 'md') {
    isOpen.value = false; // on n'a plus besoin du toggle
  }
});

const toggle = () => {
  if (props.data?.responsiveToggle !== false) {
    isOpen.value = !isOpen.value;
  }
};

const computedClasses = computed(() => {
  return buildVisualStyles(props.styles as Record<string, unknown>);
});

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  return buildVisualInlineStyles(props.styles as Record<string, unknown>, bp);
});


</script>

<template>
  <header 
      :class="['sticky top-0 z-50 w-full border-b border-[#F29100]/30 backdrop-blur-lg shadow-lg bg-white/70', computedClasses]"
      :style="computedInlineStyles"
  >
      <div class="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between py-4">
              <div class="flex items-center font-bold">
                  <!-- zone de drop gauche -->
                  <CardBuilder :styles="props.data?.leftCardStyles" class="mr-4">
                    <template #default>
                      <slot name="left" />
                      <!-- rendre aussi le slot par défaut pour la récursivité -->
                      <slot />
                    </template>
                  </CardBuilder>

                  <!-- bouton toggle mobile -->
                  <button 
                      v-if="props.data?.responsiveToggle !== false"
                      @click="toggle"
                      class="lg:hidden inline-flex items-center justify-center p-2 ml-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
                      :aria-expanded="shouldShowMenu"
                  >
                      <svg v-if="!shouldShowMenu" class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                      <svg v-else class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                  </button>
              </div>
              <!-- droite zone visible sur large uniquement -->
              <CardBuilder :styles="props.data?.rightCardStyles" class="ml-4 hidden lg:block">
                <template #default>
                  <slot name="right" />
                </template>
              </CardBuilder>
          </div>
      </div>

      <!-- menu collapsible mobile / small -->
      <div 
          v-show="shouldShowMenu" 
          class="lg:hidden border-t border-[#F29100]/30 backdrop-blur-lg"
      >
          <div class="px-4 py-3 space-y-2">
            <!-- zone de drop droite (mobile menu) -->
            <CardBuilder :styles="props.data?.rightCardStyles" class="mb-4">
              <template #default>
                <slot name="right" />
                <!-- also render any default children passed by builder -->
                <slot />
              </template>
            </CardBuilder>
            <!-- contenu générique ou via slot -->
            <slot name="menu" />
          </div>
      </div>
  </header>
</template>
