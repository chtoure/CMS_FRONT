<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed, watchEffect, ref, onMounted, onUnmounted, provide } from 'vue';
import { UseRenderPage } from '../../hook/page';
import CompositionError from '../../components/composition/CompositionError.vue';
import CompositionLoading from '../../components/composition/CompositionLoading.vue';
import BlocRenderView from './BlocRenderView.vue';
import NotFoundPage from '@/views/error/NotFoundPage.vue';



const route = useRoute();

// Extraction réactive du slug depuis l'URL
const slug = computed(() => (route.params.slug as string));

// 2. Appel du hook
const {
  data: page,
  isLoading,
  isError: isgetError,
  error: getError
} = UseRenderPage(slug);

//  Mise à jour du titre du document (SEO)
// Tri des sections par order
const sortedSections = computed(() => {
  if (!page.value?.layout) return [];
  return [...page.value.layout].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
});

watchEffect(() => {
  if (page.value?.slug) {
    const cleanSlug = page.value.slug.replace(/\//g, '');
    const formattedSlug = cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1).toLowerCase();
    document.title = slug.value === "" ? "Accueil" : formattedSlug;
  }
  console.log("data page Render : ",page.value);
});

// Gestion responsive
const currentBreakpoint = ref<'default' | 'sm' | 'md' | 'lg'>('default');

const updateBreakpoint = () => {
  const width = window.innerWidth;
  if (width >= 1024) {
    currentBreakpoint.value = 'lg';
  } else if (width >= 768) {
    currentBreakpoint.value = 'md';
  } else if (width >= 640) {
    currentBreakpoint.value = 'sm';
  } else {
    currentBreakpoint.value = 'default';
  }
};

const toggleStates = ref<Record<string, boolean>>({});

const toggleVisibility = (id: string | number) => {
  const key = id.toString();
  const wasVisible = toggleStates.value[key] !== false;
  toggleStates.value = {
    ...toggleStates.value,
    [key]: !wasVisible
  };
};

const isVisible = (id: string | number, backendId?: number | null) => {
  const isLocalHidden = toggleStates.value[id.toString()] === false;
  const isBackendHidden = backendId != null && toggleStates.value[backendId.toString()] === false;
  return !isLocalHidden && !isBackendHidden;
};

onMounted(() => {
  updateBreakpoint();
  window.addEventListener('resize', updateBreakpoint);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateBreakpoint);
});

provide('builderState', {
  currentBreakpoint,
  toggleVisibility,
  isVisible
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
        v-for="section in sortedSections"
        :key="section.id"
        :element="section"
      />
    </div>

    <div v-else>
      <NotFoundPage />
    </div>

  </main>
</template>

