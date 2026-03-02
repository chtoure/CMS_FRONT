<script setup lang="ts">
import { computed, ref, watch, inject } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import type { AnyComponentInstance } from '../../type/component';
import type { AnySectionInstance } from '../../type/section';
import BlocRender from './BlocRender.vue';
import ResizerWrapper from './ResizerWrapper.vue';

interface Props {
  section: AnySectionInstance;
  active: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:section', 'select']);

import { resolveValueForBreakpoint } from '../../lib/styleProcessor';
const builderState = inject<{
  selectedId: { value: string | null };
  selectComponent: (id: string | null) => void;
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' };
  isDragging: { value: boolean };
}>('builderState');

// Ref locale pour les enfants (blocs) de la section
const localChildren = ref<AnyComponentInstance[]>([...props.section.children]);

// Sync descendante (ex: chargement initial)
watch(() => props.section.children, (newVal) => {
  if (JSON.stringify(newVal) !== JSON.stringify(localChildren.value)) {
    localChildren.value = [...newVal];
  }
}, { deep: true });

// Computed pour v-model
const childrenModel = computed({
  get: () => localChildren.value,
  set: (val) => {
    localChildren.value = val;
    emit('update:section', { ...props.section, children: val });
  }
});

const formatSize = (value: unknown, defaultValue: string | undefined = undefined) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  const bp = builderState?.currentBreakpoint.value || 'default';
  const finalValue = resolveValueForBreakpoint(value, bp);
  
  if (finalValue === 'full') return '100%';
  if (typeof finalValue === 'number') return `${finalValue}px`;
  if (typeof finalValue === 'string' && !isNaN(Number(finalValue)) && finalValue.trim() !== '') return `${finalValue}px`;
  return finalValue as string;
};
const formatColor = (value: unknown) => {
  const raw = formatSize(value);
  if (!raw || typeof raw !== 'string') return undefined;
  if (raw.startsWith('#') || raw.startsWith('rgba') || raw.startsWith('hsl') || raw.startsWith('bg-') || raw.startsWith('text-') || raw.startsWith('border-')) {
    return raw;
  }
  // Si c'est un hexagone de 6 caractères sans #
  if (/^[0-9A-Fa-f]{6}$/.test(raw)) {
    return `#${raw}`;
  }
  return raw;
};
</script>

<template>
  <section 
    class="relative w-full min-h-[100px] border-b border-dashed border-gray-200 transition-colors group/section"
    :class="{ 
      'ring-2 ring-primary ring-inset z-10': active,
      'flex': formatSize(section.styles?.display) === 'flex',
      'grid': formatSize(section.styles?.display) === 'grid',
      'hidden': formatSize(section.styles?.display) === 'hidden',
    }"
    :style="{
      backgroundColor: formatColor(section.styles?.bg),
      padding: formatSize(section.styles?.padding),
      opacity: section.styles?.opacity as any,
      gap: formatSize(section.styles?.gap),
      flexDirection: (formatSize(section.styles?.direction) === 'vertical' ? 'column' : 'row') as any,
      justifyContent: formatSize(section.styles?.justify) as any,
      alignItems: formatSize(section.styles?.align) as any,
      borderWidth: formatSize(section.styles?.borderWidth),
      borderColor: formatColor(section.styles?.borderColor),
      borderStyle: formatSize(section.styles?.borderStyle) as any,
    }"
    @click.stop="emit('select', section.id)"
  >
    <!-- Label Section -->
    <div 
      v-if="active"
      class="absolute -top-6 left-0 bg-primary text-white text-[10px] px-2 py-0.5 rounded-t-sm font-bold uppercase z-50 shadow-md"
    >
      Section #{{ section.sectionId || 'New' }}
    </div>

    <VueDraggable
      v-model="childrenModel"
      :group="{ name: 'blocks', put: true, pull: true }"
      :animation="150"
      class="w-full h-full transition-all duration-300"
      :class="{
        'min-h-[80px]': childrenModel.length === 0,
        'drop-zone-active': builderState?.isDragging?.value,
        'flex': formatSize(section.styles?.display) === 'flex' || !section.styles?.display,
        'grid': formatSize(section.styles?.display) === 'grid',
        'flex-row': formatSize(section.styles?.direction) !== 'vertical',
        'flex-col': formatSize(section.styles?.direction) === 'vertical',
        'justify-start': formatSize(section.styles?.justify) === 'start',
        'justify-center': formatSize(section.styles?.justify) === 'center',
        'justify-end': formatSize(section.styles?.justify) === 'end',
        'justify-between': formatSize(section.styles?.justify) === 'between',
        'items-start': formatSize(section.styles?.align) === 'start',
        'items-center': formatSize(section.styles?.align) === 'center',
        'items-end': formatSize(section.styles?.align) === 'end',
      }"
      :style="{
        gap: formatSize(section.styles?.gap),
        gridTemplateColumns: formatSize(section.styles?.display) === 'grid' ? `repeat(${section.styles?.columns || 1}, minmax(0, 1fr))` : undefined
      }"
    >
      <div 
        v-for="(element, index) in childrenModel" 
        :key="element.id"
        class="relative transition-all outline-none"
        :style="{
          width: formatSize(element.styles?.width, undefined), 
          height: formatSize(element.styles?.height) 
        }"
      >
        <ResizerWrapper
          :element="element"
          :active="builderState?.selectedId.value === element.id" 
          @click.stop="builderState?.selectComponent(element.id)"
          @update:element="(newVal: AnyComponentInstance) => {
            const newChildren = [...childrenModel];
            newChildren[index] = newVal;
            childrenModel = newChildren;
          }"
        >
          <BlocRender
            :element="element" 
            @update:element="(newVal: AnyComponentInstance) => {
              const newChildren = [...childrenModel];
              newChildren[index] = newVal;
              childrenModel = newChildren;
            }"
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
  outline: 3px solid #3b82f6;
  outline-offset: -3px;
  background-color: rgba(59, 130, 246, 0.08);
}

/* On n'ajoute un petit padding que si c'est vide pour aider la zone de drop */
.drop-zone-active:empty {
  padding: 20px !important;
}
</style>
