<template>

  <div class="flex justify-end">
    <div class=" items-end p-4">
    <CompositionDarkMode/>

    </div>
  </div>



  <main class="p-4">
    <RouterView/>
  </main>

</template>

<script setup lang="ts">
import CompositionDarkMode from '@/components/composition/CompositionDarkMode.vue';


</script>
