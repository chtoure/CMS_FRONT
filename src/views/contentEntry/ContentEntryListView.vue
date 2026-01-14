<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { FileText, Plus, MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-vue-next'
import { Button } from '../../components/ui/button'
import { cn } from '../../lib/utils'
import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue'
import CompositionTable from '../../components/composition/CompositionTable.vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu'
import { Badge } from '../../components/ui/badge'

const router = useRouter()

interface ContentEntryStub {
  id: number
  title: string
  status: string
  author: string
  updatedAt: string
}

// 1. Colonnes de la table
const columns = [
  { key: 'id', label: 'ID', class: 'w-16' },
  { key: 'title', label: 'Titre' },
  { key: 'status', label: 'Statut', class: 'w-32' },
  { key: 'author', label: 'Auteur', class: 'w-48' },
  { key: 'updatedAt', label: 'Dernière modification', class: 'w-48' },
  { key: 'actions', label: 'Actions', class: 'w-10' },
]

// 2. Données statiques
const staticData = ref<ContentEntryStub[]>([
  { id: 1, title: 'Nouvel article sur le développement durable', status: 'published', author: 'Jean Dupont', updatedAt: '2024-01-12 14:30' },
  { id: 2, title: 'Rapport annuel 2023', status: 'draft', author: 'Marie Curie', updatedAt: '2024-01-11 09:15' },
  { id: 3, title: 'Présentation de l\'équipe', status: 'published', author: 'Paul Valéry', updatedAt: '2024-01-10 16:45' },
  { id: 4, title: 'Politique de confidentialité v2', status: 'archived', author: 'Antoine de Saint-Exupéry', updatedAt: '2024-01-05 11:20' },
  { id: 5, title: 'Guide d\'utilisation du CMS', status: 'published', author: 'Jean Dupont', updatedAt: '2024-01-02 10:00' }
])

// 3. États pour la recherche et le filtrage
const search = ref('')
const filterStatus = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const filterOptions = [
  { label: 'Publiés', value: 'published' },
  { label: 'Brouillons', value: 'draft' },
  { label: 'Archivés', value: 'archived' }
]

// 4. Logique de filtrage (simulée pour les données statiques)
const filteredData = computed(() => {
  return staticData.value.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.value.toLowerCase()) ||
                          item.author.toLowerCase().includes(search.value.toLowerCase())
    const matchesFilter = filterStatus.value === 'all' || item.status === filterStatus.value
    return matchesSearch && matchesFilter
  })
})

const totalItems = computed(() => filteredData.value.length)

const getStatusColor = (status: string) => {
  switch (status) {
    case 'published': return 'text-success border-success'
    case 'draft': return 'bg-warning text-warning border-warning'
    case 'archived': return 'bg-muted text-muted-foreground border-border'
    default: return 'bg-secondary text-secondary-foreground'
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'published': return 'Publié'
    case 'draft': return 'Brouillon'
    case 'archived': return 'Archivé'
    default: return status
  }
}

const handleRowClick = (row: ContentEntryStub) => {
  console.log('Row clicked:', row)
}

const navigateToCreate = () => {
  router.push({ name: 'admin.content-entry.create' })
}
</script>

<template>
  <div class="space-y-8">
    <CompositionPageHeader>
      <template #content>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div class="flex gap-4 items-center">
            <div class="p-3 bg-primary/10 rounded-2xl">
              <FileText class="h-6 w-6" />
            </div>
            <div class="space-y-1">
              <h1 class="text-huge font-black tracking-tighter leading-none">
                <span class="text-primary italic">Entrées de contenu</span>
              </h1>
              <p class="text-background text-sm font-medium">Gérez l'ensemble de vos contenus dynamiques.</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <Button
              @click="navigateToCreate"
              class="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95"
            >
              <Plus class="w-5 h-5 mr-2" />
              Contenu
            </Button>
          </div>
        </div>
      </template>
    </CompositionPageHeader>

    <div class="card rounded-none overflow-hidden p-6">
      <div class="p-0">
        <CompositionTable
          :columns="columns"
          :data="filteredData"
          :total="totalItems"
          v-model:current-page="currentPage"
          v-model:limit="itemsPerPage"

          searchable
          v-model:search="search"
          searchPlaceholder="Rechercher par titre ou auteur..."

          filterable
          v-model:filterValue="filterStatus"
          :filterOptions="filterOptions"
          filterPlaceholder="Statut"

          @row-click="handleRowClick"
        >
          <!-- Custom render for status -->
          <template #cell-status="{ value: statusValue }">
            <Badge
              variant="outline"
              :class="cn('px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', getStatusColor(statusValue as string))"
            >
              {{ getStatusLabel(statusValue as string) }}
            </Badge>
          </template>

          <!-- Custom render for actions -->
          <template #cell-actions>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon" class="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors">
                  <MoreHorizontal class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-48 p-1 rounded-xl shadow-xl border-border/50 text-sidebar-foreground bg-sidebar backdrop-blur-md">
                <DropdownMenuLabel class="text-[10px] font-bold uppercase text-muted-foreground px-2 py-1.5 opacity-50">Options</DropdownMenuLabel>
                <DropdownMenuSeparator class="bg-border/50" />
                <DropdownMenuItem class="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors focus:bg-primary/10 focus:text-primary">
                  <Eye class="h-4 w-4" />
                  <span class="text-sm font-medium">Voir</span>
                </DropdownMenuItem>
                <DropdownMenuItem class="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors focus:bg-primary/10 focus:text-primary">
                  <Pencil class="h-4 w-4" />
                  <span class="text-sm font-medium">Modifier</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator class="bg-border/50" />
                <DropdownMenuItem class="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors focus:bg-destructive/10 focus:text-destructive">
                  <Trash2 class="h-4 w-4" />
                  <span class="text-sm font-medium">Supprimer</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </template>
        </CompositionTable>
      </div>
    </div>
  </div>
</template>
