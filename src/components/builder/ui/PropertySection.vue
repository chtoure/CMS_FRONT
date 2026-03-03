<script setup lang="ts">
import { ref } from 'vue';
import { ChevronDown } from 'lucide-vue-next';

interface Props {
  title: string;
  defaultOpen?: boolean;
  icon?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: true
});

const isOpen = ref(props.defaultOpen);
</script>

<template>
  <div class="space-y-2 border-b border-builder-bar-border pb-4 last:border-b-0">
    <!-- Header -->
    <button
      @click="isOpen = !isOpen"
      class="w-full flex items-center justify-between group"
    >
      <div class="flex items-center gap-2">
        <component v-if="icon" :is="icon" class="w-4 h-4 text-primary opacity-75 group-hover:opacity-100 transition-opacity" />
        <h4 class="text-[11px] uppercase tracking-wider font-black text-builder-bar-text group-hover:text-primary transition-colors">
          {{ title }}
        </h4>
      </div>
      <ChevronDown 
        class="w-3.5 h-3.5 text-builder-bar-text/50 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Content -->
    <transition
      enter-active-class="transition-all duration-200"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="isOpen" class="space-y-3 mt-3">
        <slot />
      </div>
    </transition>
  </div>
</template>

<style scoped>
</style>
