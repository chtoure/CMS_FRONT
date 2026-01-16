<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { FileText, Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-vue-next'
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
import { useGetContentEntryByContentTypeId } from '../../hook/content-entry'
import { useGetContentType } from '../../hook/content-type'
import type { EntryStatus } from '../../type/content-entry'
import CompositionLoading from '../../components/composition/CompositionLoading.vue'
import CompositionError from '../../components/composition/CompositionError.vue'
import { getErrorMessage } from '../../lib/errorMessage'

const router = useRouter()
const search = ref('')
const filterStatus = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)


const id = computed(() => {
  return (router.currentRoute.value.params.id as unknown) as number
})

const filterOptions = [
  { label: 'Publiés', value: 'PUBLISHED' },
  { label: 'Brouillons', value: 'DRAFT' },
  { label: 'Archivés', value: 'ARCHIVED' }
]

const filterParams = computed(() => ({
  type: filterStatus.value === "all" ? undefined : (filterStatus.value as EntryStatus),
  page: currentPage.value,
  limit: itemsPerPage.value,
  search: search.value
}));



const { data: entries, refetch: refetchEntries, isLoading: isLoadingEntries, error: errorEntries } = useGetContentEntryByContentTypeId({id: id.value, filter: filterParams})
const { data: contentType } = useGetContentType(id.value)


watch([currentPage, itemsPerPage, filterStatus, search], () => {
  refetchEntries();
});



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
  { key: 'user', label: 'Auteur', class: '' },
  { key: 'status', label: 'Statut', class: '' },
  { key: 'actions', label: 'Actions', class: '' },
]


const getStatusColor = (status: string) => {
  switch (status) {
    case 'PUBLISHED': return 'text-success border-success'
    case 'DRAFT': return 'bg-warning text-warning border-warning'
    case 'ARCHIVED': return 'bg-muted text-muted-foreground border-border'
    default: return 'bg-secondary text-secondary-foreground'
  }
}


const handleRowClick = (row: ContentEntryStub) => {
  console.log('Row clicked:', row)
}

const navigateToCreate = () => {
  router.push({ name: 'admin.content-entry.create', params: { id: id.value} })
}

const navigateToUpdate = (entryId: number) => {
  router.push({ name: 'admin.content-entry.update', params: { id: entryId } })
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
                <span class="text-primary italic">Entrées de contenu {{ contentType?.name }}</span>
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
      <CompositionError v-if="errorEntries" :error="getErrorMessage(errorEntries)"/>
      <div v-else class="p-0">
        <CompositionTable
          :columns="columns"
          :data="entries || []"
          :total="entries?.length || 0"
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
          <template v-if="isLoadingEntries">
            <CompositionLoading />
          </template>

          <template #cell-title="{row}">
            <p>{{ row.data_json.title }}</p>
          </template>
          <template #cell-user="{row}">
            <p>{{ row.user?.full_name }}</p>
          </template>
          <template #cell-status="{ row }">
            <Badge
              variant="outline"
              :class="cn('px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', getStatusColor(row.status as string))"
            >
              {{ (row.status as string) }}
            </Badge>
          </template>

          <!-- Custom render for actions -->
          <template #cell-actions="{row}">
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon" class="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors">
                  <MoreHorizontal class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-48 p-1 rounded-xl shadow-xl border-border/50 text-sidebar-foreground bg-sidebar backdrop-blur-md">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem class=" transition-colors focus:bg-primary/10 focus:text-primary">
                  <button @click="navigateToUpdate(row.id)" class="text-text hover:text-primary p-2 flex items-center gap-2 transition-all hover:scale-110">
                    <Pencil class="w-4 h-4" /> Modifier
                  </button>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem class="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors focus:bg-destructive/10 focus:text-destructive">
                  <button class="text-text hover:text-primary p-2 flex items-center gap-2 transition-all hover:scale-110">
                    <Trash2 class="w-4 h-4" /> Supprimer
                  </button>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </template>
        </CompositionTable>
      </div>
    </div>
  </div>
</template>
