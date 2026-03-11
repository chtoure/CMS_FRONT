<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import type { ContainerStyles, AnyComponentInstance } from '../../type/component';
import { buildBlocLayoutStyles, buildBlocLayoutInlineStyles } from '../../lib/style/blocProcessor';
import { useVariableResolver } from '../../hook/variable';

interface Props {
  styles?: ContainerStyles;
  data?: {
    items?: any;
  };
  element?: AnyComponentInstance;
  children?: AnyComponentInstance[];
}

const props = defineProps<Props>();

const builderState = inject<{
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' }
}>('builderState', { currentBreakpoint: { value: 'default' } } as any);

const { resolveValue } = useVariableResolver();

const openIndex = ref<number | null>(0);

const computedClasses = computed(() => {
  return buildBlocLayoutStyles(props.styles as Record<string, unknown>, resolveValue);
});

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  return buildBlocLayoutInlineStyles(props.styles as Record<string, unknown>, bp, resolveValue);
});

const items = computed(() => {
  const rawItems = resolveValue(props.data?.items) as any[];
  if (!rawItems || !Array.isArray(rawItems)) {
    return [
      { title: 'Item 1', content: 'Contenu de l\'item 1' },
      { title: 'Item 2', content: 'Contenu de l\'item 2' }
    ];
  }
  return rawItems.map(item => ({
    title: resolveValue(item.title) as string,
    content: resolveValue(item.content) as string
  }));
});
</script>

<template>
  <div :class="computedClasses" :style="computedInlineStyles">
    <div v-for="(item, index) in items" :key="index" class="border-b border-gray-200">
      <button 
        class="w-full py-4 px-6 text-left font-medium flex justify-between items-center bg-white"
        @click="openIndex = openIndex === index ? null : index"
      >
        <span>{{ item.title }}</span>
        <i class="ph-caret-down transition-transform duration-200" :class="{ 'rotate-180': openIndex === index }"></i>
      </button>
      <div 
        v-if="openIndex === index" 
        class="px-6 py-4 bg-gray-50 animate-fade-in whitespace-pre-wrap"
      >
        {{ item.content }}
      </div>
    </div>
  </div>
</template>
