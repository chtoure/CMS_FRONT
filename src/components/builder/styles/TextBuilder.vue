<script setup lang="ts">
import { computed } from 'vue';
import type { AnyComponentInstance } from '../../../type/component';
import { useResolvedStyles } from '../../../hook/useResolvedStyles';
import { useVariableResolver } from '../../../hook/variable';

const props = defineProps<{
  element: AnyComponentInstance;
}>();

const { resolvedStyles } = useResolvedStyles(props.element);
const { resolveValue } = useVariableResolver();

// Résolution des données (contenu, tag) qui peuvent aussi être des variables
const content = computed(() => resolveValue(props.element.data.content) as string);
const tag = computed(() => resolveValue(props.element.data.tag) as string || 'p');
</script>

<template>
  <component 
    :is="tag"
    :style="resolvedStyles"
    class="w-full h-full break-words"
  >
    {{ content }}
  </component>
</template>