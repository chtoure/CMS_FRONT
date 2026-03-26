<script lang="ts" setup>
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

  <main class="h-screen">
    <RouterView/>
  </main>
</template>
