<script setup lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { computed, inject, ref } from 'vue';
import type { AccordionStyles } from '../../type/style';
import type { AnyComponentInstance } from '../../type/component';
import {
  buildAccordionContainerInlineStyles,
  buildAccordionQuestionInlineStyles,
} from '../../lib/style/accordionProcessor';
import { buildBlocLayoutStyles, buildBlocLayoutInlineStyles } from '../../lib/style/blocProcessor';
import { useVariableResolver } from '../../hook/variable';

interface Props {
  styles?: AccordionStyles;
  data?: {
    title?: string;
    titre?: string;
    label?: string;
    question?: string;
    content?: string;
    reponse?: string;
    response?: string;
    description?: string;
    isOpen?: boolean;
    transitionSpeed?: number;
  };
  element?: AnyComponentInstance;
  children?: AnyComponentInstance[];
}

const props = defineProps<Props>();

const builderState = inject<{
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' }
}>('builderState', { currentBreakpoint: { value: 'default' } } as any);

const { resolveValue } = useVariableResolver();

// État ouvert/fermé — initialisé depuis data.isOpen
const isOpen = ref<boolean>(
  resolveValue(props.data?.isOpen) === true
);

const toggle = () => { isOpen.value = !isOpen.value; };

// ─── Styles ────────────────────────────────────────────────────────────────
const bp = computed(() => builderState.currentBreakpoint.value);
const rawStyles = computed(() => props.styles as Record<string, unknown> | undefined);

const containerClasses = computed(() =>
  buildBlocLayoutStyles(rawStyles.value as Record<string, unknown>, resolveValue)
);

const containerInlineStyles = computed(() => ({
  ...buildBlocLayoutInlineStyles(rawStyles.value as Record<string, unknown>, bp.value, resolveValue),
  ...buildAccordionContainerInlineStyles(rawStyles.value, bp.value, resolveValue),
}));

const questionInlineStyles = computed(() =>
  buildAccordionQuestionInlineStyles(rawStyles.value, bp.value, resolveValue)
);



// ─── Données ───────────────────────────────────────────────────────────────
const title = computed(() =>
  (resolveValue(props.data?.title || props.data?.titre || props.data?.label || props.data?.question) as string) || 'Question'
);
const content = computed(() =>
  (resolveValue(props.data?.content || props.data?.reponse || props.data?.response || props.data?.description) as string) || 'Réponse de l\'accordéon'
);

const transitionDuration = computed(() => {
  const speed = resolveValue(props.data?.transitionSpeed);
  return typeof speed === 'number' && speed > 0 ? speed : 300;
});

// ─── Callbacks de transition (en dehors du template pour éviter les lint) ──
function onEnter(el: Element, done: () => void) {
  const target = el as HTMLElement;
  const dur = transitionDuration.value;
  target.style.overflow = 'hidden';
  target.style.maxHeight = '0';
  target.style.opacity = '0';
  window.requestAnimationFrame(() => {
    target.style.transition = `max-height ${dur}ms ease, opacity ${dur}ms ease`;
    target.style.maxHeight = target.scrollHeight + 'px';
    target.style.opacity = '1';
    window.setTimeout(done, dur);
  });
}

function onLeave(el: Element, done: () => void) {
  const target = el as HTMLElement;
  const dur = transitionDuration.value;
  target.style.overflow = 'hidden';
  target.style.maxHeight = target.scrollHeight + 'px';
  target.style.opacity = '1';
  window.requestAnimationFrame(() => {
    target.style.transition = `max-height ${dur}ms ease, opacity ${dur}ms ease`;
    target.style.maxHeight = '0';
    target.style.opacity = '0';
    window.setTimeout(done, dur);
  });
}
</script>

<template>
  <div :class="[containerClasses, 'overflow-hidden w-full transition-all duration-300']" :style="containerInlineStyles">

    <!-- Bouton Question -->
    <button
      class="w-full flex justify-between items-center text-left focus:outline-none"
      :style="[questionInlineStyles, !questionInlineStyles.padding ? { padding: '12px 16px' } : {}]"
      @click="toggle"
      type="button"
    >
      <span class="flex-1 font-medium" v-html="title"></span>
      <!-- Icône chevron animé -->
      <svg
        class="shrink-0 ml-3"
        :style="{
          transition: `transform ${transitionDuration}ms ease`,
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
        }"
        xmlns="http://www.w3.org/2000/svg"
        width="16" height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>


    <!-- Panneau Réponse avec transition JS -->
    <Transition :css="false" @enter="onEnter" @leave="onLeave">
      <div
        v-if="isOpen"
        :style="[questionInlineStyles, !questionInlineStyles.padding ? { padding: '12px 16px' } : {}]"
        class="whitespace-pre-wrap flex flex-col"
        v-html="content"
      >
      </div>
    </Transition>

  </div>
</template>
