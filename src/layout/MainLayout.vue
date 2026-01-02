<script setup lang="ts">
import { ref } from 'vue';
import CompositionSidebar from '@/components/composition/CompositionSidebar.vue';
import CompositionHeader from '@/components/composition/CompositionHeader.vue';

import { onMounted, onBeforeUnmount, watch } from 'vue';
import { useRoute } from 'vue-router';


const isSidebarCollapsed = ref(false);
const route = useRoute();

const setCollapsedByViewport = () => {
  isSidebarCollapsed.value = window.innerWidth < 1024;
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

</script>


<template>
  <div class="flex h-screen overflow-hidden p13">
    <CompositionSidebar :is-collapsed="isSidebarCollapsed" />

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

<style>

</style>
