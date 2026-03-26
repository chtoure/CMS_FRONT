<script setup lang="ts">
import CompositionDarkMode from '@/components/composition/CompositionDarkMode.vue';
import { useHead } from '@vueuse/head';
import { computed } from 'vue';
import { useParameter } from '../stores/parameter';
import { storeToRefs } from 'pinia';

const parameterStore = useParameter();
const { parameter } = storeToRefs(parameterStore);

const seoData = computed(() => ({
  title: parameter.value?.title || "Compositor",
  description: parameter.value?.description || "Gérez vos actifs visuels avec précision sur la plateforme Compositor.",
  image: parameter.value?.media?.file_path || ""
}))

useHead({
  title: () => seoData.value.title,
  meta: [
    { name: 'description', content: () => seoData.value.description },
    { property: 'og:title', content: () => seoData.value.title },
    { property: 'og:description', content: () => seoData.value.description },
    { property: 'og:image', content: () => seoData.value.image },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
})


</script>





<template>

  <div class="fixed top-4 right-4 z-50">
    <CompositionDarkMode/>
  </div>
  <main class="h-screen p-4">
    <RouterView/>
  </main>

</template>

