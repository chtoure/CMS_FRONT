<script setup lang="ts">
import { computed, ref, nextTick } from 'vue';
import type { InteractiveStyles, CliquableAction, AnyComponentInstance } from '../../type/component';
import { executeAction } from '../../registry/cliquable';
import { buildButtonStyles, buildButtonInlineStyles } from '../../lib/style/buttonProcessor';
import { useVariableResolver } from '../../hook/variable';
import { inject } from 'vue';
import * as LucideIcons from 'lucide-vue-next';

interface Props {
  styles?: InteractiveStyles;
  data?: {
    content?: string | Record<string, unknown>;
    cliquable?: CliquableAction;
    icon?: string;
    iconPosition?: 'left' | 'right' | 'only';
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
  toggleVisibility?: (id: string) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
}>('builderState', { currentBreakpoint: { value: 'default' }, selectedId: { value: null } } as any);

// Indique si l'on est dans le contexte du Builder (pour activer l'édition inline)
const isBuilder = inject<boolean>('isBuilder', false);

const { resolveValue } = useVariableResolver();

const computedClasses = computed(() => {
  const classes = [buildButtonStyles(props.styles as Record<string, unknown>, resolveValue)];

  // Alignement Flex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const align = resolveValue((props.styles as Record<string, any>)?.textAlign) || 'center';
  const flexAlignMap: Record<string, string> = {
    'left': 'justify-start text-left',
    'center': 'justify-center text-center',
    'right': 'justify-end text-right',
    'justify': 'justify-between text-justify'
  };
  classes.push(flexAlignMap[align as string] || 'justify-center text-center');

  return classes.filter(Boolean).join(' ');
});

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  return buildButtonInlineStyles(props.styles as Record<string, unknown>, bp, resolveValue);
});

const content = computed(() => (resolveValue(props.data?.content) as string) || 'Nouveau Bouton');

const iconName = computed(() => {
  const name = resolveValue(props.data?.icon) as string;
  return name && name in LucideIcons ? name : null;
});
const LucideIcon = computed(() =>
  iconName.value ? (LucideIcons as Record<string, unknown>)[iconName.value] : null
);
const iconPosition = computed(() => (resolveValue(props.data?.iconPosition) as string) || 'left');
const showIconOnly = computed(() => !!LucideIcon.value && iconPosition.value === 'only');

// Édition inline
const isEditing = ref(false);
const editorRef = ref<HTMLElement | null>(null);
const isSelected = computed(() => isBuilder && builderState.selectedId?.value === props.element?.id);

const startEditing = (e: MouseEvent) => {
  if (!isSelected.value) return;
  e.stopPropagation();
  e.preventDefault(); // Éviter déclenchement du click
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
  const newContent = editorRef.value?.innerText?.trim() ?? '';
  if (newContent !== content.value) {
    emit('update:element', {
      ...props.element,
      data: { ...props.element.data, content: newContent }
    });
  }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    isEditing.value = false;
    if (editorRef.value) editorRef.value.innerText = content.value;
    return;
  }
  if (e.key === 'Enter') {
    e.preventDefault();
    commitEdit();
  }
  e.stopPropagation();
};

const handleClick = () => {
  const cliquable = resolveValue(props.data?.cliquable) as CliquableAction;
  if (!cliquable || !cliquable.action) return;

  if (cliquable.action === 'TOGGLE_VISIBILITY') {
    const targetId = cliquable.action_params?.targetId;
    if (targetId && builderState.toggleVisibility) {
      builderState.toggleVisibility(targetId);
    }
  } else {
    // Dans le builder, on bloque NAVIGATE_TO pour ne pas quitter l'éditeur
    if (isBuilder && cliquable.action === 'NAVIGATE_TO') {
      console.log("[BUILDER] Navigation bloquée pour :", cliquable.action_params?.url);
      return;
    }
    executeAction(cliquable);
  }
};
</script>

<template>
  <button
    :class="[
      'inline-flex items-center gap-1.5 font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 w-full',
      computedClasses
    ]"
    :style="computedInlineStyles"
    @click="!isEditing && handleClick()"
    @dblclick="startEditing"
  >
    <!-- Icône à GAUCHE -->
    <component
      v-if="LucideIcon && iconPosition === 'left'"
      :is="LucideIcon"
      :size="16"
      class="shrink-0"
    />

    <!-- Texte (éditable inline, caché si mode 'only') -->
    <span
      v-if="!showIconOnly"
      ref="editorRef"
      :contenteditable="isEditing ? 'true' : 'false'"
      @blur="commitEdit"
      @keydown="handleKeyDown"
      v-html="content"
    />

    <!-- Icône à DROITE -->
    <component
      v-if="LucideIcon && iconPosition === 'right'"
      :is="LucideIcon"
      :size="16"
      class="shrink-0"
    />

    <!-- Icône seule -->
    <component
      v-if="showIconOnly"
      :is="LucideIcon"
      :size="18"
      class="shrink-0"
    />
  </button>
</template>
