<script setup lang="ts">
import { computed } from 'vue'
import {
  FolderOpen,
  Database,
  Plus,
  ArrowUpRight,
  Clock,
  BarChart3,
  LayoutGrid,
  Zap,
  Users
} from 'lucide-vue-next'
import DashboardStatCard from '@/components/dashboard/DashboardStatCard.vue'
import Button from '@/components/ui/button/Button.vue'
import CompositionPageHeader from '@/components/composition/CompositionPageHeader.vue'
import { useGetMediaList } from '../hook/media'
import { userStore } from '../stores/user'
import { useGetVariables } from '../hook/variable'
import { useGetUsers } from '../hook/user'

const mediaQuery = useGetMediaList({ limit: 5, page: 1 })
const userQuery = useGetUsers();
const variableQuery = useGetVariables()
const totalMedia = computed(() => mediaQuery.data.value?.count || 0)
const recentMedia = computed(() => mediaQuery.data.value?.results.slice(0, 4) || [])
const totalVariable = computed(() => variableQuery.data.value?.length || 0)
const totalUser = computed(() => userQuery.data.value?.length || 0)
const storeUser = userStore();

const stats = computed(() => [
  {
    title: 'Médiathèque',
    value: totalMedia.value,
    icon: FolderOpen,
    description: 'Fichiers importés',
    // trend: { value: 12, positive: true }
  },
  {
    title: 'Variables',
    value: totalVariable.value,
    icon: Database,
    description: 'variables créées',
    // trend: { value: 5, positive: true }
  },
  {
    title: 'Utilisateurs',
    value: totalUser.value,
    icon: Users,
    description: 'utilisateurs connectés',
  },
  {
    title: 'Utilisation',
    value: '1.2GB',
    icon: BarChart3,
    description: 'Sur 5GB total',
  }
])

const quickActions = [
  { label: 'Importer Média', icon: Plus, href: 'admin.media', color: 'bg-primary' },
  { label: 'Nouvelle Variable', icon: Database, href: 'admin.variable', color: 'bg-slate-900' },
  { label: 'Voir Galerie', icon: LayoutGrid, href: 'admin.media', color: 'bg-accent' },
]

const now = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
</script>

<template>
  <div class="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
    <CompositionPageHeader>
      <template #content>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div class="space-y-2">
            <h1 class="text-huge font-black text-accent tracking-tighter leading-none">
              Hello, <span class="text-primary italic">{{ storeUser.userInfo?.full_name }}</span>
            </h1>
            <p class="text-background opacity-80 text-lg font-medium">Nous sommes le {{ now }}. Prêt à créer ?</p>
          </div>
        </div>
      </template>
    </CompositionPageHeader>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <DashboardStatCard
        v-for="stat in stats"
        :key="stat.title"
        v-bind="stat"
      />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-black tracking-tight flex items-center gap-2">
            <Clock class="w-6 h-6 text-primary" />
            Activités Récentes
          </h2>
          <Button variant="ghost" class="text-primary font-bold hover:bg-primary/5" @click="$router.push({ name: 'admin.media' })">
            Tout voir <ArrowUpRight class="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div v-for="item in recentMedia" :key="item.id" class="group relative card overflow-hidden aspect-video bg-secondary">
            <img v-if="item.type === 'image'" :src="item.file_path" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <video v-else :src="item.file_path" autoplay class="w-full h-full object-cover" muted />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
              <div class="absolute bottom-4 left-4">
                <p class="text-white text-xs font-black uppercase tracking-widest">{{ item.alt || 'Médias sans titre' }}</p>
              </div>
            </div>
          </div>
          <div v-if="recentMedia.length === 0" class="col-span-2 card p-12 flex flex-col items-center justify-center text-center space-y-4 border-dashed">
            <FolderOpen class="w-12 h-12 text-muted-foreground opacity-20" />
            <p class="text-muted-foreground font-medium">Aucun média récent. Commencez par importer des fichiers.</p>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <h2 class="text-2xl font-black tracking-tight">Raccourcis</h2>
        <div class="space-y-4">
          <button
            v-for="action in quickActions"
            :key="action.label"
            @click="$router.push({ name: action.href })"
            class="w-full flex items-center justify-between p-5 card hover:border-primary/50 transition-all group overflow-hidden relative"
          >
            <div class="flex items-center gap-4 relative z-10">
              <div :class="['p-3 rounded-xl text-white shadow-lg', action.color]">
                <component :is="action.icon" class="w-5 h-5" />
              </div>
              <span class="font-bold tracking-tight">{{ action.label }}</span>
            </div>
            <ArrowUpRight class="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors relative z-10" />
            <div class="absolute inset-0 bg-primary/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
          </button>
        </div>

        <div class="card p-6 bg-slate-900 border-none relative overflow-hidden group">
          <div class="relative z-10 space-y-4">
            <p class="text-white/60 text-xs font-bold uppercase tracking-[0.2em]">Status Système</p>
            <h4 class="text-xl font-black text-white leading-tight">Tous les systèmes sont opérationnels.</h4>
            <div class="flex items-center gap-2">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span class="text-white font-bold text-sm">Online</span>
            </div>
          </div>
          <div class="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-1000">
            <Zap class="w-32 h-32 text-white" />
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
