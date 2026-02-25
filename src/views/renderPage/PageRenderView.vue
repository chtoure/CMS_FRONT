<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed, watchEffect } from 'vue';
import { UseRenderPage } from '../../hook/page';
import CompositionError from '../../components/composition/CompositionError.vue';
import CompositionLoading from '../../components/composition/CompositionLoading.vue';
import BlocRenderView from './BlocRenderView.vue';


const route = useRoute();

// Extraction réactive du slug depuis l'URL
const slug = computed(() => (route.params.slug as string) || 'accueil');

// 2. Appel du hook
const {
  data: page,
  isLoading,
  isError: isgetError,
  error: getError
} = UseRenderPage(slug);

//  Mise à jour du titre du document (SEO)
watchEffect(() => {
  if (page.value?.slug) {
    document.title = `${page.value.slug.toUpperCase()}`;
  }
  console.log("data page Render : ",page.value);
});

</script>

<template>
  <main>

    <CompositionError
      v-if="isgetError"
      :error="getError?.message"
    />

    <CompositionLoading
      v-else-if="isLoading"
    />

    <div v-else-if="page">
      <BlocRenderView
        v-for="section in page.layout"
        :key="section.id"
        :element="section"
      />
    </div>

    <div v-else class="text-center p-10 text-gray-400">
      Aucun contenu disponible pour cette page.
    </div>

  </main>
</template>

