<script setup lang="ts">
import { computed, inject, ref, nextTick } from 'vue';
import { RouterLink } from 'vue-router';
import type { LinkStyles } from '../../type/style';
import type { AnyComponentInstance } from '../../type/component';
import { buildLinkStyles, buildLinkInlineStyles } from '../../lib/style/linkProcessor';
import { resolveValueForBreakpoint } from '../../lib/style/core';
import { useVariableResolver } from '../../hook/variable';

interface Props {
  styles?: LinkStyles;
  data?: {
    text?: string;
    url?: string;
    target?: string;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}>('builderState', { currentBreakpoint: { value: 'default' }, selectedId: { value: null } } as any);

// Détecte si on est dans le contexte du builder (pour bloquer la navigation)
const isBuilder = inject<boolean>('isBuilder', false);

const { resolveValue } = useVariableResolver();

const computedClasses = computed(() => {
  return buildLinkStyles(props.styles as Record<string, unknown>, resolveValue);
});

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  const allStyles = buildLinkInlineStyles(props.styles as Record<string, unknown>, bp, resolveValue);

  // Retirer textAlign du lien car il va être appliqué au wrapper parent
  const { textAlign: _textAlign, ...linkStyles } = allStyles;
  void _textAlign;

  return linkStyles;
});

// Wrapper styles appliquent textAlign au conteneur
const wrapperInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  const inlineStyles: Record<string, string> = {};

  if (props.styles?.textAlign) {
    const textAlignValue = resolveValueForBreakpoint(props.styles.textAlign, bp, resolveValue);

    if (typeof textAlignValue === 'string' && ['left', 'center', 'right', 'justify'].includes(textAlignValue)) {
      inlineStyles.textAlign = textAlignValue;
    }
  }

  return inlineStyles;
});

const linkText = computed(() => (resolveValue(props.data?.text) as string) || 'Lien');
const linkUrl = computed(() => (resolveValue(props.data?.url) as string) || '#');
const linkTarget = computed(() => (resolveValue(props.data?.target) as string) || '_self');

// --- Édition inline ---
const isEditing = ref(false);
const editorRef = ref<HTMLElement | null>(null);
const isSelected = computed(() => isBuilder && builderState.selectedId?.value === props.element?.id);

const startEditing = (e: MouseEvent) => {
  if (!isSelected.value) return;
  e.stopPropagation();
  e.preventDefault();
  isEditing.value = true;
  nextTick(() => {
    if (editorRef.value) {
      editorRef.value.focus();
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
  const newText = editorRef.value?.innerText?.trim() ?? '';
  if (newText !== linkText.value) {
    emit('update:element', {
      ...props.element,
      data: { ...props.element.data, text: newText }
    });
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    isEditing.value = false;
    if (editorRef.value) editorRef.value.innerText = linkText.value;
    return;
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    commitEdit();
  }
  e.stopPropagation();
};
</script>

<template>
  <div :style="wrapperInlineStyles">
    <!-- En mode builder : <a> classique avec navigation bloquée + édition inline -->
    <a
      v-if="isBuilder"
      ref="editorRef"
      :href="linkUrl"
      :target="linkTarget"
      :class="[computedClasses, isSelected ? 'cursor-text outline-none' : '']"
      :style="computedInlineStyles"
      class="inline-block hover:underline transition-all"
      :contenteditable="isEditing ? 'true' : 'false'"
      @click.prevent
      @dblclick="startEditing"
      @blur="commitEdit"
      @keydown="handleKeyDown"
      v-html="linkText"
    >
    </a>
    <!-- En mode rendu/preview : RouterLink fonctionnel -->
    <RouterLink
      v-else
      :to="linkUrl"
      :target="linkTarget"
      :class="computedClasses"
      :style="computedInlineStyles"
      class="inline-block hover:underline transition-all"
    >
      <span v-html="linkText"></span>
    </RouterLink>
  </div>
</template>
