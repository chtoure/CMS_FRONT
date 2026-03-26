<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { FileText, Plus, MoreHorizontal, Pencil, Trash2, Eye, Lock, Archive } from 'lucide-vue-next'
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
import { useToggleArchive, useGetContentEntriesBySlug, useSwitchStatus } from '../../hook/content-entry'
import { useGetContentTypeBySlug } from '../../hook/content-type'
import { EntryStatus, type IContentEntry } from '../../type/content-entry'
import CompositionError from '../../components/composition/CompositionError.vue'
import { getErrorMessage } from '../../lib/errorMessage'
import { showToast } from '../../lib/toast'
import { usePermission } from '../../hook/usePermission'


const { hasPermission } = usePermission();
const router = useRouter()
const search = ref('')
const filterStatus = ref('all')
const currentPage = ref(1)
const itemsPerPage = ref(10)


const slug = computed(() => {
  return (router.currentRoute.value.params.slug as unknown) as string
})

const filterOptions = [
  { label: 'Publiés', value: 'PUBLISHED' },
  { label: 'Brouillons', value: 'DRAFT' }
]

const filterParams = computed(() => ({
  status: filterStatus.value === "all" ? undefined : (filterStatus.value as EntryStatus),
  page: currentPage.value,
  limit: itemsPerPage.value,
  search: search.value
}));





const { data: entries, refetch: refetchEntries, isLoading: isLoadingEntries, error: errorEntries } = useGetContentEntriesBySlug(slug.value, filterParams)
const { data: contentType } = useGetContentTypeBySlug(slug.value)
const { mutate: switchStatusMutation } = useSwitchStatus();
const { mutate: archiveContentEntryMutation } = useToggleArchive();

const handleSwitchStatus = (contentEntry: IContentEntry) => {
  const currentStatus = contentEntry?.status;
  if (!currentStatus) return;

  const nextStatus = currentStatus === EntryStatus.DRAFT
    ? EntryStatus.PUBLISHED
    : EntryStatus.DRAFT;

  switchStatusMutation({
    id: contentEntry.id,
    status: { status: nextStatus }
  }, {
    onSuccess: () => {
      showToast('success', 'Statut modifié');
      refetchEntries();
    },
    onError: (error) => {
      showToast('error', getErrorMessage(error));
    }
  });
}

const handleArchiveContentEntry = (contentEntry: IContentEntry) => {
  archiveContentEntryMutation({
    id: contentEntry.id,
    archive: true
  }, {
    onSuccess: () => {
      showToast('success', 'Contenu archivé');
      refetchEntries();
    },
    onError: (error) => {
      showToast('error', getErrorMessage(error));
    }
  });
}

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
  { key: 'title', label: 'Titre' , class: 'w-1/2'},
  { key: 'user', label: 'Auteur', class: 'w-1/4' },
  { key: 'status', label: 'Statut', class: 'w-1/4' },
  { key: 'actions', label: 'Actions', class: 'w-1/4' },
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
  router.push({ name: 'admin.content-entry.create', params: { id: contentType.value?.id} })
}

const navigateToUpdate = (entryId: number) => {
  router.push({ name: 'admin.content-entry.update', params: { id: entryId } })
}

const navigateToPreview = (entryId: number) => {
  router.push({ name: 'admin.content-entry.preview', params: { id: entryId } })
}
</script>

<template>
  <div class="space-y-8 w-full">
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
          <div v-if="hasPermission(['create_content_entry'])" class="flex items-center gap-4">
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
          :data="entries?.results || []"
          :total="entries?.count || 0"
          v-model:current-page="currentPage"
          v-model:limit="itemsPerPage"

          searchable
          v-model:search="search"
          searchPlaceholder="Rechercher par titre ou auteur..."

          filterable
          v-model:filterValue="filterStatus"
          :filterOptions="filterOptions"
          filterPlaceholder="Statut"

          :isLoading="isLoadingEntries"

          @row-click="handleRowClick"
        >
          <template #cell-id="{index}">
            <p>{{ index + 1 }}</p>
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
                  <button @click="navigateToPreview(row.id)" class="text-text hover:text-primary p-2 flex items-center gap-2 transition-all hover:scale-110">
                    <Eye class="w-4 h-4" /> Aperçu
                  </button>
                </DropdownMenuItem>
                <DropdownMenuSeparator v-if="hasPermission(['update_content_entry'])" />
                <DropdownMenuItem v-if="hasPermission(['update_content_entry'])" class=" transition-colors focus:bg-primary/10 focus:text-primary">
                  <button @click="navigateToUpdate(row.id)" class="text-text hover:text-primary p-2 flex items-center gap-2 transition-all hover:scale-110">
                    <Pencil class="w-4 h-4" /> Modifier
                  </button>
                </DropdownMenuItem>
                <DropdownMenuSeparator v-if="hasPermission(['delete_content_entry'])" />
                <DropdownMenuItem v-if="hasPermission(['delete_content_entry'])" class="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors focus:bg-destructive/10 focus:text-destructive">
                  <button class="text-text hover:text-primary p-2 flex items-center gap-2 transition-all hover:scale-110">
                    <Trash2 class="w-4 h-4" /> Supprimer
                  </button>
                </DropdownMenuItem>
                <DropdownMenuSeparator v-if="hasPermission(['update_content_entry'])" />
                <DropdownMenuItem v-if="hasPermission(['update_content_entry'])" class="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors focus:bg-destructive/10 focus:text-destructive">
                  <button @click="handleSwitchStatus(row)" class="text-text hover:text-primary p-2 flex items-center gap-2 transition-all hover:scale-110">
                    <Lock class="w-4 h-4" /> {{ row.status === EntryStatus.PUBLISHED ? 'Brouillon' : 'Publier' }}
                  </button>
                </DropdownMenuItem>
                <DropdownMenuSeparator v-if="hasPermission(['delete_content_entry'])"/>
                <DropdownMenuItem v-if="hasPermission(['delete_content_entry'])" class="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors focus:bg-destructive/10 focus:text-destructive">
                  <button @click="handleArchiveContentEntry(row)" class="text-text hover:text-primary p-2 flex items-center gap-2 transition-all hover:scale-110">
                    <Archive class="w-4 h-4" /> Archiver
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
