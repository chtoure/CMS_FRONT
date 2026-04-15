<script lang="ts" setup>
import { useHead } from '@vueuse/head';
import { computed, onMounted } from 'vue';
import { useParameter } from '../stores/parameter';
import { storeToRefs } from 'pinia';
import '../assets/render.css';

const parameterStore = useParameter();
const { parameter } = storeToRefs(parameterStore);

const seoData = computed(() => ({
  title: parameter.value?.title || "Site",
  description: parameter.value?.description || "",
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

onMounted(() => {
  // Optionnel : Retirer la classe dark globale lors de l'affichage du site frontend
  // pour s'assurer que les styles tailwind dark ne s'appliquent pas.
  document.documentElement.classList.remove('dark');
})
</script>

<template>
  <main id="site-render-root" class="min-h-screen">
    <RouterView/>
  </main>
</template>

<style>
/* Réécriture stricte des variables du body pour le frontend */
#site-render-root {
  --background: #ffffff;
  --foreground: #000000;
  background-color: var(--background);
  color: var(--foreground);
}
</style>
