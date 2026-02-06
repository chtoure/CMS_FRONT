<script lang="ts" setup>
import { ref } from 'vue';
import CanvaView from './CanvaView.vue';
import ComponentView from './ComponentView.vue';
import PropritiesView from './PropritiesView.vue';
import { X, Menu } from 'lucide-vue-next';
import Button from '../../components/ui/button/Button.vue';

const showComponentView = ref(true);
const showPropertiesView = ref(true);
</script>

<template>
  <div class="relative h-screen w-screen overflow-hidden bg-builder-background">

    <main class="absolute inset-0 z-0 w-full h-full">
      <CanvaView />
    </main>

    <aside
      class="absolute top-0 left-0 h-full w-64 bg-builder-bar-background border-r border-border z-10 transform transition-transform duration-300 ease-in-out shadow-xl"
      :class="showComponentView ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex items-center justify-between p-4 border-b border-border">
        <h2 class="font-bold text-builder-bar-text tracking-wide">Composants</h2>
        <Button @click="showComponentView = false" class="text-white">
          <X class="h-4 w-4" />
        </Button>
      </div>
      <div class="h-[calc(100%-60px)] overflow-y-auto  w-full bg-builder-bar-background px-4 py-2">
        <ComponentView />
      </div>
    </aside>

    <aside
      class="absolute top-0 right-0 h-full w-80 bg-builder-background/95 backdrop-blur-sm border-l border-gray-700 z-10 transform transition-transform duration-300 ease-in-out shadow-xl"
      :class="showPropertiesView ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 class="font-bold text-white tracking-wide">Propriétés</h2>
        <button @click="showPropertiesView = false" class="text-gray-400 hover:text-white transition-colors">
          <X class="h-4 w-4" />
        </button>
      </div>
      <div class="h-[calc(100%-60px)] overflow-y-auto">
        <PropritiesView />
      </div>
    </aside>

    <div class="absolute top-4 left-4 z-20 transition-all duration-300" :class="{ 'translate-x-64': showComponentView }">
       <Button
        v-if="!showComponentView"
        @click="showComponentView = true; showPropertiesView = false"
        class="flex items-center justify-center p-2 text-white shadow-lg transition-all"
        title="Ouvrir les composants"
      >
        <Menu class="h-5 w-5" />
      </Button>

    </div>

    <div class="absolute top-4 right-4 z-20 transition-all duration-300" :class="{ '-translate-x-80': showPropertiesView }">
       <Button
        v-if="!showPropertiesView"
        @click="showPropertiesView = true; showComponentView = false"
        class="flex items-center justify-center p-2 text-white shadow-lg transition-all"
        title="Ouvrir les propriétés"
      >
        <Menu class="h-5 w-5" />
      </Button>
    </div>

  </div>
</template>

<style scoped>
aside ::-webkit-scrollbar {
  width: 5px;
}
aside ::-webkit-scrollbar-track {
  background: transparent;
}
aside ::-webkit-scrollbar-thumb {
  background: #4b5563;
  border-radius: 4px;
}
aside ::-webkit-scrollbar-thumb:hover {
  background: #6b7280;
}
</style>
