<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
import type { ContainerStyles } from '../../type/component';
import { buildVisualStyles, buildVisualInlineStyles, buildLayoutStyles, buildLayoutInlineStyles } from '../../lib/styleProcessor';

interface Props {
  styles?: ContainerStyles;
  data?: {
    title?: string;
    isOpen?: boolean;
    transitionSpeed?: number;
    iconPosition?: 'left' | 'right';
  };
}

const props = defineProps<Props>();

const isOpen = ref(props.data?.isOpen || false);

const toggle = () => {
  isOpen.value = !isOpen.value;
};

const builderState = inject<{
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' }
}>('builderState', { currentBreakpoint: { value: 'default' } });

const computedClasses = computed(() => {
  return buildVisualStyles(props.styles as Record<string, unknown>);
});

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

const contentStyle = computed(() => ({
  maxHeight: isOpen.value ? '1000px' : '0',
  transition: `max-height ${props.data?.transitionSpeed || 300}ms ease-in-out`,
  overflow: 'hidden'
}));
</script>

<template>
  <div 
    class="flex flex-col border border-gray-200 rounded-lg bg-white overflow-hidden mb-4"
    :class="computedClasses"
    :style="computedInlineStyles"
  >
    <!-- Header / Question -->
    <button 
      @click="toggle"
      class="flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors w-full"
    >
      <span class="font-medium text-gray-900">
        {{ props.data?.title || 'Posez votre question ici...' }}
      </span>
      <ChevronDown 
        class="w-5 h-5 text-gray-500 transition-transform duration-300"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Body / Answer -->
    <div :style="contentStyle">
      <div 
        class="p-4 pt-0 text-gray-600 border-t border-gray-100 mt-2"
        :class="computedLayoutClasses"
        :style="computedLayoutInlineStyles"
      >
        <slot />
      </div>
    </div>
  </div>
</template>
