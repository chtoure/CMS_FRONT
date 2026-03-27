<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { computed, watchEffect, ref, onMounted, onUnmounted, provide } from 'vue';
import { UseRenderPage } from '../../hook/page';
import { useGetParameters } from '../../hook/parameter';
import CompositionError from '../../components/composition/CompositionError.vue';
import CompositionLoading from '../../components/composition/CompositionLoading.vue';
import BlocRenderView from './BlocRenderView.vue';
import { ApiError } from '../../api/apiError';

// Chargement dynamique d'une Google Font dans le <head>
function loadGoogleFont(family: string) {
  if (!family) return;
  const id = `gfont-${family.replace(/\s/g, '-')}`;
  if (document.getElementById(id)) return;
  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@300;400;500;600;700&display=swap`;
  document.head.appendChild(link);
}

// Mise à jour d'une balise <meta>
function setMeta(name: string, content: string, property = false) {
  const attr = property ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}





const route = useRoute();
const router = useRouter();

// Extraction réactive du slug depuis l'URL
const slug = computed(() => (route.params.slug as string));

// 2. Appel du hook
const {
  data: page,
  isLoading,
  isError: isgetError,
  error: getError
} = UseRenderPage(slug);

// Paramètres globaux du site (logo, font, meta)
const { data: siteParams } = useGetParameters();

watchEffect(() => {
  const p = siteParams.value;
  if (!p) return;

  // ── Police globale ──────────────────────────────────────────────
  if (p.family_name) {
    loadGoogleFont(p.family_name);
    document.body.style.fontFamily = `'${p.family_name}', sans-serif`;
  }

  // ── Meta SEO ─────────────────────────────────────────────────────
  if (p.title) {
    setMeta('og:title', p.title, true);
  }
  if (p.description) {
    setMeta('description', p.description);
    setMeta('og:description', p.description, true);
  }

  // ── Logo → Favicon dynamique ─────────────────────────────────────
  // Le logo défini dans ParameterView s'affiche dans l'onglet du navigateur
  if (p.media?.file_path) {
    setMeta('og:image', p.media.file_path, true);

    // Mise à jour ou création du favicon
    let favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = p.media.file_path;
    favicon.type = p.media.file_path.endsWith('.svg') ? 'image/svg+xml' : 'image/png';
  }
});

//  Mise à jour du titre du document (SEO)
// Tri des sections par order supprimé pour s'aligner sur CanvaView (qui utilise l'ordre natif du tableau)

watchEffect(() => {
  if (page.value?.slug) {
    const cleanSlug = page.value.slug.replace(/\//g, '');
    const formattedSlug = cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1).toLowerCase();
    document.title = slug.value === "" ? "Accueil" : formattedSlug;
  }
  console.log("data page Render : ",page.value);
  
  if (page.value === null || (getError.value instanceof ApiError && getError.value.status === 404)) {
    router.push({ name: 'notfound' });
  }
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

// Exposition des paramètres globaux du site (logo, font, nom) aux composants enfants
provide('siteParams', siteParams);

</script>

<template>
  <main>

    <CompositionError
      v-if="isgetError && (!(getError instanceof ApiError) || getError.status !== 404)"
      :error="getError?.message"
    />

    <CompositionLoading
      v-else-if="isLoading"
    />

    <div v-else-if="page && page.layout">
      <BlocRenderView
        v-for="section in page.layout"
        :key="section.id"
        :element="section"
      />
    </div>



  </main>
</template>

