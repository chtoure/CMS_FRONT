<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import type { ContainerStyles } from '../../type/component';
import { buildNavbarStyles, buildNavbarInlineStyles } from '../../lib/style/navbarProcessor';
import { useVariableResolver } from '../../hook/variable';
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

const { resolveValue } = useVariableResolver();

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
  return buildNavbarStyles(props.styles as Record<string, unknown>, resolveValue);
});

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  return buildNavbarInlineStyles(props.styles as Record<string, unknown>, bp, resolveValue);
});


</script>

<template>
  <header 
      :class="['sticky top-0 z-50 w-full border-b border-[#F29100]/30 backdrop-blur-lg shadow-lg bg-white/70', computedClasses]"
      :style="computedInlineStyles"
  >
      <div class="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between py-4">
              <div class="flex items-center font-bold flex-1">
                  <!-- zone de drop gauche -->
                  <template v-for="child in (props as any).children?.filter((c: any) => c.data?.slot === 'left')" :key="child.id">
                    <CardBuilder v-bind="child" class="mr-4 flex-1">
                       <template #default>
                          <component 
                            v-for="subChild in child.children" 
                            :is="subChild.tag" 
                            :key="subChild.id"
                            v-bind="subChild"
                          />
                       </template>
                    </CardBuilder>
                  </template>

                  <!-- Si pas de zones configurées (legacy) -->
                  <slot v-if="!(props as any).children?.some((c: any) => c.data?.slot === 'left')" name="left" />
                  <slot v-if="!(props as any).children?.some((c: any) => c.data?.slot === 'left')" />

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
              <div class="hidden lg:flex flex-1 justify-end">
                <template v-for="child in (props as any).children?.filter((c: any) => c.data?.slot === 'right')" :key="child.id">
                  <CardBuilder v-bind="child" class="ml-4 flex-1">
                     <template #default>
                        <component 
                          v-for="subChild in child.children" 
                          :is="subChild.tag" 
                          :key="subChild.id"
                          v-bind="subChild"
                        />
                     </template>
                  </CardBuilder>
                </template>
                <slot v-if="!(props as any).children?.some((c: any) => c.data?.slot === 'right')" name="right" />
              </div>
          </div>
      </div>

      <!-- menu collapsible mobile / small -->
      <div 
          v-show="shouldShowMenu" 
          class="lg:hidden border-t border-[#F29100]/30 backdrop-blur-lg"
      >
          <div class="px-4 py-3 space-y-2">
            <!-- zone de drop droite (mobile menu) -->
            <template v-for="child in (props as any).children?.filter((c: any) => c.data?.slot === 'right')" :key="child.id">
              <CardBuilder v-bind="child" class="mb-4">
                 <template #default>
                    <component 
                      v-for="subChild in child.children" 
                      :is="subChild.tag" 
                      :key="subChild.id"
                      v-bind="subChild"
                    />
                 </template>
              </CardBuilder>
            </template>
            <!-- contenu générique ou via slot -->
            <slot name="menu" />
            <slot v-if="!(props as any).children?.some((c: any) => c.data?.slot === 'right')" />
          </div>
      </div>
  </header>
</template>
