<script setup lang="ts">
import CompositionDarkMode from '@/components/composition/CompositionDarkMode.vue';
import { useHead } from '@vueuse/head';
import { computed } from 'vue';
import { useGetParameters } from '../hook/parameter';

const { data: params} = useGetParameters()

const seoData = computed(() => ({
  title: params.value?.title || "Compositor",
  description: params.value?.description || "Gérez vos actifs visuels avec précision sur la plateforme Compositor.",
  image: params.value?.logo || ""
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

  <div class="flex justify-end">
    <div class=" items-end p-4">
    <CompositionDarkMode/>

    </div>
  </div>



  <main class="p-4">
    <RouterView/>
  </main>

</template>

