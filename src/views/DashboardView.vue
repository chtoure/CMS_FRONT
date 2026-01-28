<script setup lang="ts">
import { computed } from 'vue'
import {
  FolderOpen,
  Database,
  Plus,
  ArrowUpRight,
  Clock,
  Zap,
  FileText,
  Tags
} from 'lucide-vue-next'
import DashboardStatCard from '@/components/dashboard/DashboardStatCard.vue'
import Button from '@/components/ui/button/Button.vue'
import CompositionPageHeader from '@/components/composition/CompositionPageHeader.vue'
import { useGetMediaList } from '../hook/media'
import { userStore } from '../stores/user'
import { useGetVariables } from '../hook/variable'
import { useGetContentTypes } from '../hook/content-type'
import { useGetTaxonomies } from '../hook/taxonomy'
import { useHead } from '@vueuse/head'
import CompositionMediaPreview from '../components/composition/CompositionMediaPreview.vue'

useHead({
  meta: [
    { name: 'description', content: 'Voici votre tableau de bord' },
    { property: 'og:title', content:'Dashboard' },
    { property: 'og:description', content: 'Voici votre tableau de bord' },
  ],
})

const mediaQuery = useGetMediaList()
const variableQuery = useGetVariables()
const contentTypeQuery = useGetContentTypes();
const taxonomyQuery = useGetTaxonomies();

const totalMedia = computed(() => mediaQuery.data.value?.count || 0)
const recentMedia = computed(() => mediaQuery.data.value?.results.slice(0, 4) || [])
const totalVariable = computed(() => variableQuery.data.value?.length || 0)
const totalContentType = computed(() => contentTypeQuery.data.value?.count || 0)
const totalTaxonomy = computed(() => taxonomyQuery.data.value?.count || 0)

const recentContentTypes = computed(() => contentTypeQuery.data.value?.results.slice(0, 4) || [])

const storeUser = userStore();

const stats = computed(() => [
  {
    title: 'Contenus',
    value: totalContentType.value,
    icon: FileText,
    description: 'Types de contenu dédiés',
  },
  {
    title: 'Médiathèque',
    value: totalMedia.value,
    icon: FolderOpen,
    description: 'Fichiers importés',
  },
  {
    title: 'Variables',
    value: totalVariable.value,
    icon: Database,
    description: 'Variables de données',
  },
  {
    title: 'Taxonomies',
    value: totalTaxonomy.value,
    icon: Tags,
    description: 'Vocabulaires gérés',
  }
])

const quickActions = [
  { label: 'Nouveau Contenu', icon: Plus, href: 'admin.content-type', color: 'bg-primary' },
  { label: 'Importer Média', icon: FolderOpen, href: 'admin.media', color: 'bg-slate-900' },
  { label: 'Gérer Taxonomies', icon: Tags, href: 'admin.taxonomy', color: 'bg-accent' },
]

const now = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
</script>

<template>
  <div class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
    <CompositionPageHeader>
      <template #content>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div class="space-y-2">
            <p class="text-5xl font-black text-accent tracking-tighter leading-none">
              Hello, <span class="text-primary italic">{{ storeUser.userInfo?.full_name }}</span>
            </p>
            <p class="text-background opacity-80 text-lg font-medium">Nous sommes le {{ now }}. Prêt à créer ?</p>
          </div>
        </div>
      </template>
    </CompositionPageHeader>

    <!-- Statistiques Compactes -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <DashboardStatCard
        v-for="stat in stats"
        :key="stat.title"
        v-bind="stat"
      />
    </div>

    <!-- Layout Principal -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Colonne Gauche : Contenus et Médias -->
      <div class="lg:col-span-2 space-y-12">

        <!-- Types de Contenu (Accès Rapide) -->
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-black tracking-tight flex items-center gap-2">
              <FileText class="w-6 h-6 text-primary" />
              Types de Contenu
            </h2>
            <Button variant="ghost" class="text-primary font-bold hover:bg-primary/5" @click="$router.push({ name: 'admin.content-types' })">
              Gérer <ArrowUpRight class="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="ct in recentContentTypes"
              :key="ct.id"
              @click="$router.push({ name: 'admin.content-entry.list', params: { slug: ct.slug } })"
              class="group card p-4 cursor-pointer border-transparent hover:border-primary/30 hover:bg-sidebar-accent/30 transition-all flex items-center justify-between"
            >
              <div class="space-y-1">
                <p class="font-black text-lg text-sidebar-foreground group-hover:text-primary transition-colors">{{ ct.name }}</p>
                <p class="text-xs text-muted-foreground font-medium capitalize tracking-wider">{{ ct.slug }}</p>
              </div>
              <div class="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-lg shadow-primary/5">
                <Plus class="w-5 h-5 transition-transform group-hover:rotate-90" />
              </div>
            </div>
            <div v-if="recentContentTypes.length === 0" class="col-span-2 card p-12 text-center border-dashed flex flex-col items-center gap-3">
              <FileText class="w-10 h-10 text-muted-foreground/20" />
              <p class="text-muted-foreground font-medium">Aucun type de contenu créé.</p>
              <Button size="sm" @click="$router.push({ name: 'admin.content-type' })">Créer un Type</Button>
            </div>
          </div>
        </div>

        <!-- Médias Récents -->
        <div class="space-y-6">
          <div class="flex items-center justify-between">
            <h2 class="text-2xl font-black tracking-tight flex items-center gap-2">
              <Clock class="w-6 h-6 text-primary" />
              Médias Récents
            </h2>
            <Button variant="ghost" class="text-primary font-bold hover:bg-primary/5" @click="$router.push({ name: 'admin.media' })">
              Médiathèque <ArrowUpRight class="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div
              v-for="item in recentMedia"
              :key="item.id"
              @click="$router.push({ name: 'admin.media' })"
              class="group relative overflow-hidden aspect-square cursor-pointer"
            >
              <CompositionMediaPreview :media="item" />
            </div>
            <div v-if="recentMedia.length === 0" class="col-span-4 card p-12 flex flex-col items-center justify-center text-center border-dashed gap-3">
              <FolderOpen class="w-10 h-10 text-muted-foreground/20" />
              <p class="text-muted-foreground font-medium">Aucun média récent.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Colonne Droite : Raccourcis et Système -->
      <div class="space-y-8">
        <div class="space-y-6">
          <h2 class="text-2xl font-black tracking-tight">Raccourcis</h2>
          <div class="space-y-3">
            <button
              v-for="action in quickActions"
              :key="action.label"
              @click="$router.push({ name: action.href })"
              class="w-full flex items-center justify-between p-4 card border-transparent hover:border-primary/50 hover:bg-sidebar-accent/50 transition-all group relative overflow-hidden"
            >
              <div class="flex items-center gap-4 relative z-10 transition-transform group-hover:translate-x-1">
                <div :class="['p-3 rounded-xl text-white shadow-lg', action.color]">
                  <component :is="action.icon" class="w-5 h-5" />
                </div>
                <span class="font-bold tracking-tight">{{ action.label }}</span>
              </div>
              <ArrowUpRight class="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all relative z-10" />
              <div class="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </div>

        <!-- Status Système -->
        <div class="card p-6 bg-slate-900 border-none relative overflow-hidden group shadow-xl">
          <div class="relative z-10 space-y-4">
            <p class="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Status Système</p>
            <h4 class="text-lg font-black text-white leading-tight">Tous les systèmes sont opérationnels.</h4>
            <div class="flex items-center gap-2">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span class="text-white font-bold text-xs uppercase tracking-wider">Online</span>
            </div>
          </div>
          <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000">
            <Zap class="w-24 h-24 text-white" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-huge {
  font-size: clamp(2.5rem, 8vw, 5rem);
}
</style>
