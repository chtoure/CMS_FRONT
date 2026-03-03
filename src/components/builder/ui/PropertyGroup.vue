<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next';
import type { Component } from 'vue';

interface Props {
  title: string;
  defaultOpen?: boolean;
  icon?: Component;
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: true
});

const isOpen = defineModel<boolean>('open', { default: props.defaultOpen });

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <div class="property-group">
    <!-- Header collapsible -->
    <button
      @click="toggleOpen"
      class="w-full flex items-center gap-2 px-3 py-2.5 rounded transition-all hover:bg-white/5 active:bg-white/10"
    >
      <ChevronDown 
        :class="['w-3.5 h-3.5 transition-transform', isOpen ? 'rotate-0' : '-rotate-90']"
      />
      <component v-if="icon" :is="icon" class="w-3.5 h-3.5 text-primary/70" />
      <h4 class="text-[11px] font-bold uppercase tracking-wider text-builder-bar-text flex-1 text-left">
        {{ title }}
      </h4>
    </button>

    <!-- Content -->
    <transition
      enter-active-class="transition-all duration-200"
      enter-from-class="max-h-0 overflow-hidden opacity-0"
      enter-to-class="max-h-96 overflow-visible opacity-100"
      leave-active-class="transition-all duration-200"
      leave-from-class="max-h-96 overflow-visible opacity-100"
      leave-to-class="max-h-0 overflow-hidden opacity-0"
    >
      <div v-show="isOpen" class="pl-1 pr-3 pb-3 space-y-2">
        <slot />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.property-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
