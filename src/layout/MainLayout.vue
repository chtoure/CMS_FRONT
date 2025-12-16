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
  <div class="flex min-h-screen ">
    
    <CompositionSidebar :is-collapsed="isSidebarCollapsed"  /> 

    <div class="flex-grow flex flex-col transition-all duration-300 ">
      
      <CompositionHeader :onToggleSidebar="toggleSidebar" headerClass="bg-background" :isSidebarCollapsed="isSidebarCollapsed" />
      
      <main class="flex-grow p-6 overflow-y-auto rounded-6 m-1 bg-background">
        <RouterView/>
      </main>
    </div>
  </div>
</template>

