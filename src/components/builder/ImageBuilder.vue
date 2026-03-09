<script setup lang="ts">
import { computed, inject } from 'vue';
import type { StaticStyles, AnyComponentInstance } from '../../type/component';
import { buildImageStyles, buildImageInlineStyles } from '../../lib/style/imageProcessor';
import { useVariableResolver } from '../../hook/variable';

interface Props {
  styles?: StaticStyles;
  data?: {
    src?: any;
    alt?: any;
    objectFit?: any;
  };
  element?: AnyComponentInstance;
  children?: AnyComponentInstance[];
}

const props = defineProps<Props>();

const builderState = inject<{
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' }
}>('builderState', { currentBreakpoint: { value: 'default' } } as any);

const { resolveValue } = useVariableResolver();

const computedClasses = computed(() => {
  return buildImageStyles(props.styles as Record<string, unknown>, resolveValue);
});

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  return buildImageInlineStyles(props.styles as Record<string, unknown>, bp, resolveValue);
});

const imageSrc = computed(() => (resolveValue(props.data?.src) as string) || 'https://via.placeholder.com/400x300?text=Image+Builder');
const imageAlt = computed(() => (resolveValue(props.data?.alt) as string) || '');
const objectFit = computed(() => (resolveValue(props.data?.objectFit) as any) || 'cover');
</script>

<template>
  <div class="overflow-hidden" :class="computedClasses" :style="computedInlineStyles">
    <img
      :src="imageSrc"
      :alt="imageAlt"
      class="w-full h-full"
      :style="{ objectFit: objectFit }"
    />
  </div>
</template>
