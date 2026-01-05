<script setup lang="ts">
import { ref } from 'vue';
import CompositionSidebar from '@/components/composition/CompositionSidebar.vue';
import CompositionHeader from '@/components/composition/CompositionHeader.vue';

import { onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';

const isSidebarCollapsed = ref(false);
const route = useRoute();

const isMobile = ref(false);

const setCollapsedByViewport = () => {
  isMobile.value = window.innerWidth < 1024;
  isSidebarCollapsed.value = isMobile.value;
};

const handleResize = () => {
  setCollapsedByViewport();
};

onMounted(() => {
  setCollapsedByViewport();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});

watch(() => route.fullPath, () => {
  if (window.innerWidth < 1024) {
    isSidebarCollapsed.value = true;
  }
});

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
};

watch(() => route.fullPath, () => {
  if (window.innerWidth < 1024) {
    isSidebarCollapsed.value = true;
  }
});




</script>


<template>
  <div class="flex h-screen overflow-hidden">

    <div
      class="fixed lg:static inset-y-0 left-0 z-50 w-auto lg:w-auto"
      :class="{ 'hidden': isSidebarCollapsed }"
    >
      <CompositionSidebar :is-collapsed="isSidebarCollapsed" />
    </div>

    <div
      v-if="!isSidebarCollapsed"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden"
      @click="isSidebarCollapsed = true"
    ></div>

    <div class="flex-1 flex flex-col h-screen overflow-hidden transition-all duration-300">
      <CompositionHeader
        :onToggleSidebar="toggleSidebar"
        headerClass="bg-background"
        :isSidebarCollapsed="isSidebarCollapsed"
      />

      <main class="flex-1 overflow-y-auto p-2 md:p-6 bg-background custom-scrollbar">
        <RouterView/>
      </main>
    </div>
  </div>
</template>
