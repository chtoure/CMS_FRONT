<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next';
import { type Component, onMounted } from 'vue';

interface Props {
  title: string;
  defaultOpen?: boolean;
  icon?: Component;
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: true
});

// 1. On déclare le modèle sans l'option 'default' pour éviter l'erreur de hoisting
const isOpen = defineModel<boolean>('open');

// 2. On initialise la valeur au montage du composant si v-model n'est pas utilisé
onMounted(() => {
  if (isOpen.value === undefined) {
    isOpen.value = props.defaultOpen;
  }
});

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <div class="property-group">
    <button
      @click="toggleOpen"
      class="w-full flex items-center gap-2 px-3 py-2.5 rounded transition-all hover:bg-white/5 active:bg-white/10 group"
    >
      <ChevronDown 
        :class="['w-3 h-3 transition-transform duration-200', isOpen ? 'rotate-0' : '-rotate-90']"
      />
      
      <component 
        v-if="icon" 
        :is="icon" 
        class="w-3 h-3 text-primary/70" 
      />

      <h4 class="text-[11px] font-bold tracking-wider text-builder-bar-text flex-1 text-left">
        {{ title }}
      </h4>
    </button>

    <transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="max-h-0 opacity-0 overflow-hidden"
      enter-to-class="max-h-[1000px] opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="max-h-[1000px] opacity-100"
      leave-to-class="max-h-0 opacity-0 overflow-hidden"
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
  gap: 0.1rem;
}
</style>
