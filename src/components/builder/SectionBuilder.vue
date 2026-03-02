<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { computed, inject } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import type { AnyComponentInstance } from '../../type/component';
import type { AnySectionInstance } from '../../type/section';
import BlocRender from './BlocRender.vue';
import ResizerWrapper from './ResizerWrapper.vue';
import { resolveValueForBreakpoint } from '../../lib/styleProcessor';

interface Props {
  section: AnySectionInstance;
  active: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:section': [value: AnySectionInstance]
  'select': [id: string]
}>();

const builderState = inject<{
  selectedId: { value: string | null }
  selectComponent: (id: string | null) => void
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' }
  isDragging: { value: boolean }
}>('builderState');

// Computed réactifs
const isDraggingOver = computed(() => builderState?.isDragging?.value ?? false);

const displayValue = computed(() => resolveValueForBreakpoint(props.section.styles?.display, builderState?.currentBreakpoint.value || 'default') || 'flex');
const directionValue = computed(() => resolveValueForBreakpoint(props.section.styles?.direction, builderState?.currentBreakpoint.value || 'default'));
const justifyValue = computed(() => resolveValueForBreakpoint(props.section.styles?.justify, builderState?.currentBreakpoint.value || 'default'));
const alignValue = computed(() => resolveValueForBreakpoint(props.section.styles?.align, builderState?.currentBreakpoint.value || 'default'));

// Utilitaires
const formatSize = (value: unknown, defaultValue?: string): string | undefined => {
  if (value === undefined || value === null || value === '') return defaultValue;
  const bp = builderState?.currentBreakpoint.value || 'default';
  const finalValue = resolveValueForBreakpoint(value, bp);
  
  if (finalValue === 'full') return '100%';
  if (typeof finalValue === 'number') return `${finalValue}px`;
  if (typeof finalValue === 'string' && !isNaN(Number(finalValue)) && finalValue.trim() !== '') {
    return `${finalValue}px`;
  }
  return finalValue as string;
};

const formatColor = (value: unknown): string | undefined => {
  const raw = formatSize(value);
  if (!raw || typeof raw !== 'string') return undefined;
  
  // Si c'est déjà une couleur CSS valide
  if (raw.startsWith('#') || raw.startsWith('rgba') || raw.startsWith('hsl') || 
      raw.startsWith('rgb') || raw.startsWith('var(')) {
    return raw;
  }
  
  // Si c'est un nom de classe Tailwind
  if (raw.startsWith('bg-') || raw.startsWith('text-') || raw.startsWith('border-')) {
    return raw;
  }
  
  // Si c'est un hex sans #
  if (/^[0-9A-Fa-f]{6}$/.test(raw)) {
    return `#${raw}`;
  }
  
  return raw;
};

// Handlers
const handleSelect = (e: MouseEvent) => {
  e.stopPropagation();
  emit('select', props.section.id);
  builderState?.selectComponent(props.section.id);
};

const handleChildrenChange = (newChildren: AnyComponentInstance[]) => {
  emit('update:section', {
    ...props.section,
    children: newChildren
  });
};

const handleChildUpdate = (index: number, newChild: AnyComponentInstance) => {
  const newChildren = [...props.section.children];
  newChildren[index] = newChild;
  handleChildrenChange(newChildren);
};

// Classes dynamiques
const sectionClasses = computed(() => {
  const classes: Record<string, boolean> = {
    'ring-2 ring-blue-500 ring-inset z-10': props.active,
    'flex': displayValue.value === 'flex' || !displayValue.value,
    'grid': displayValue.value === 'grid',
    'hidden': displayValue.value === 'hidden',
    'flex-row': directionValue.value !== 'vertical',
    'flex-col': directionValue.value === 'vertical',
  };
  
  // Justify
  if (justifyValue.value === 'start') classes['justify-start'] = true;
  if (justifyValue.value === 'center') classes['justify-center'] = true;
  if (justifyValue.value === 'end') classes['justify-end'] = true;
  if (justifyValue.value === 'between') classes['justify-between'] = true;
  
  // Align
  if (alignValue.value === 'start') classes['items-start'] = true;
  if (alignValue.value === 'center') classes['items-center'] = true;
  if (alignValue.value === 'end') classes['items-end'] = true;
  
  return classes;
});

const sectionStyles = computed(() => ({
  backgroundColor: formatColor(props.section.styles?.bg),
  padding: formatSize(props.section.styles?.padding),
  opacity: props.section.styles?.opacity as any,
  gap: formatSize(props.section.styles?.gap),
  borderWidth: formatSize(props.section.styles?.borderWidth),
  borderColor: formatColor(props.section.styles?.borderColor),
  borderStyle: formatSize(props.section.styles?.borderStyle) as any,
  gridTemplateColumns: displayValue.value === 'grid' 
    ? `repeat(${props.section.styles?.columns || 1}, minmax(0, 1fr))` 
    : undefined
}));

const draggableClasses = computed(() => ({
  'min-h-[80px]': props.section.children.length === 0,
  'drop-zone-active': isDraggingOver,
}));
</script>

<template>
  <section 
    class="relative w-full min-h-[100px] border-b border-dashed border-gray-200 transition-colors group/section"
    :class="sectionClasses"
    :style="sectionStyles"
    @click.stop="handleSelect"
  >
    <!-- Label Section -->
    <div 
      v-if="props.active"
      class="absolute -top-6 left-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-t-sm font-bold uppercase z-50 shadow-md"
    >
      Section #{{ props.section.sectionId || 'New' }}
    </div>

    <!-- VueDraggable Container -->
    <VueDraggable
      :model-value="props.section.children"
      :group="{ name: 'blocks', put: true, pull: true }"
      :animation="100"
      :delay="0"
      ghost-class="ghost-item"
      class="w-full transition-all duration-300"
      :class="draggableClasses"
      @update:model-value="handleChildrenChange"
    >
      <div 
        v-for="(element, index) in props.section.children" 
        :key="element.id"
        class="relative transition-all"
        :style="{
          width: formatSize(element.styles?.width), 
          height: formatSize(element.styles?.height) 
        }"
      >
        <ResizerWrapper
          :element="element"
          :active="builderState?.selectedId.value === element.id" 
          @click.stop="builderState?.selectComponent(element.id)"
          @update:element="(newVal) => handleChildUpdate(index, newVal)"
        >
          <BlocRender
            :element="element" 
            @update:element="(newVal) => handleChildUpdate(index, newVal)"
          />
        </ResizerWrapper>
      </div>
    </VueDraggable>
  </section>
</template>

<style scoped>
.group\/section:hover {
  background-color: rgba(59, 130, 246, 0.02);
}

.drop-zone-active {
  outline: 2px dashed #3b82f6;
  outline-offset: -2px;
  background-color: rgba(59, 130, 246, 0.08);
}

:deep(.ghost-item) {
  opacity: 0.2 !important;
  background: #3b82f6 !important;
  border-radius: 4px;
}
</style>
