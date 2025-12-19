<script setup lang="ts">
import { ref } from 'vue';
import CompositionSidebar from '@/components/composition/CompositionSidebar.vue';
import CompositionHeader from '@/components/composition/CompositionHeader.vue';

const isSidebarCollapsed = ref(false);

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

      <main class="flex-1 overflow-y-auto p-6 bg-background custom-scrollbar">
        <RouterView/>
      </main>
    </div>
  </div>
</template>

<style>

</style>

