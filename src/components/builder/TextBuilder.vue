<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed } from 'vue';
import type { StaticStyles, AnyComponentInstance } from '../../type/component';
import { buildTextStyles, buildTextInlineStyles } from '../../lib/style/textProcessor';
import { useVariableResolver } from '../../hook/variable';
import { inject } from 'vue';

interface Props {
  styles?: StaticStyles;
  data?: {
    content?: any;
    tag?: any;
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
  return [
      'inline-block w-full min-h-[1em] break-words',
      buildTextStyles(props.styles as Record<string, unknown>, resolveValue)
  ];
});

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  return buildTextInlineStyles(props.styles as Record<string, unknown>, bp, resolveValue);
});

const tag = computed(() => (resolveValue(props.data?.tag) as string) || 'p');
const content = computed(() => (resolveValue(props.data?.content) as string) || 'Texte par défaut');
</script>

<template>
  <component
    :is="tag"
    :class="computedClasses"
    :style="computedInlineStyles"
  >
    {{ content }}
  </component>
</template>
