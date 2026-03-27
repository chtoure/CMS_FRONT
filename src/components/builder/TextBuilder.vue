<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, ref, nextTick } from 'vue';
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
const emit = defineEmits<{
  'update:element': [value: AnyComponentInstance]
}>();

const builderState = inject<{
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' };
  selectedId: { value: string | null };
}>('builderState', { currentBreakpoint: { value: 'default' }, selectedId: { value: null } } as any);

// Indique si l'on est dans le contexte du Builder (pour activer l'édition inline)
const isBuilder = inject<boolean>('isBuilder', false);

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

// Édition inline
const isEditing = ref(false);
const editorRef = ref<HTMLElement | null>(null);
const isSelected = computed(() => isBuilder && builderState.selectedId?.value === props.element?.id);

const startEditing = (e: MouseEvent) => {
  if (!isSelected.value) return;
  e.stopPropagation();
  isEditing.value = true;
  nextTick(() => {
    if (editorRef.value) {
      editorRef.value.focus();
      // Placer le curseur à la fin
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editorRef.value);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  });
};

const commitEdit = () => {
  if (!isEditing.value || !props.element) return;
  isEditing.value = false;
  const newContent = editorRef.value?.innerText?.trim() ?? '';
  if (newContent !== content.value) {
    emit('update:element', {
      ...props.element,
      data: { ...props.element.data, content: newContent }
    });
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  // Escape annule l'édition
  if (e.key === 'Escape') {
    isEditing.value = false;
    if (editorRef.value) editorRef.value.innerText = content.value;
    return;
  }
  // Enter valide (sans créer de nouvelle ligne)
  if (e.key === 'Enter') {
    e.preventDefault();
    commitEdit();
  }
  e.stopPropagation();
};
</script>

<template>
  <component
    :is="tag"
    ref="editorRef"
    :class="[
      ...computedClasses,
      isSelected && isBuilder ? 'cursor-text outline-none' : ''
    ]"
    :style="computedInlineStyles"
    :contenteditable="isEditing ? 'true' : 'false'"
    :data-placeholder="content"
    @dblclick="startEditing"
    @blur="commitEdit"
    @keydown="handleKeyDown"
    v-html="content"
  ></component>
</template>
