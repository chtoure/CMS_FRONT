<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { FileText, MoreHorizontal, Trash2, Eye, RefreshCw } from 'lucide-vue-next'
import { Button } from '../../components/ui/button'
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
import {useDeleteContentEntry, useGetArchivedContentEntries, useToggleArchive } from '../../hook/content-entry'
import CompositionError from '../../components/composition/CompositionError.vue'
import { getErrorMessage } from '../../lib/errorMessage'
import { showToast } from '../../lib/toast'
import { useRouter } from 'vue-router'
import CompositionConfirmDialog from '../../components/composition/CompositionConfirmDialog.vue'
import { usePermission } from '../../hook/usePermission'


const { hasPermission } = usePermission();
const router = useRouter()
const search = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)


const filterParams = computed(() => ({
  status: null,
  page: currentPage.value,
  limit: itemsPerPage.value,
  search: search.value
}));





const { data: entries, refetch: refetchEntries, isPending: isPendingEntries, error: errorEntries } = useGetArchivedContentEntries(filterParams)
const { mutate: restoreContentEntryMutation, isPending: isRestoreContentEntryPending } = useToggleArchive();
const { mutate: deleteContentEntryMutation, isPending: isDeleteContentEntryPending } = useDeleteContentEntry();


const handleRestoreContentEntry = (id: number) => {
  restoreContentEntryMutation({
    id: id,
    archive:false
  }, {
    onSuccess: () => {
      showToast('success', 'Contenu restauré');
      refetchEntries();
    },
    onError: (error) => {
      showToast('error', getErrorMessage(error));
    }
  });
}

const handleDeleteContentEntry = (id: number) => {
  deleteContentEntryMutation({
    id: id,
  }, {
    onSuccess: () => {
      showToast('success', 'Contenu supprimé');
      refetchEntries();
    },
    onError: (error) => {
      showToast('error', getErrorMessage(error));
    }
  });
}

watch([currentPage, itemsPerPage, search], () => {
  refetchEntries();
});



interface ContentEntryStub {
  id: number
  title: string
  status: string
  author: string
  updatedAt: string
}

const columns = [
  { key: 'id', label: 'ID', class: 'w-16' },
  { key: 'title', label: 'Titre' },
  { key: 'user', label: 'Auteur' },
  { key: 'actions', label: 'Actions' },
]


const handleRowClick = (row: ContentEntryStub) => {
  console.log('Row clicked:', row)
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
            <div class="p-3 bg-primary rounded-2xl">
              <FileText stroke-width="1" class="h-8 w-8" />
            </div>
            <div class="space-y-1">
              <h1 class="text-huge font-black tracking-tighter leading-none">
                <span class="text-primary italic">Corbeille des contenus </span>
              </h1>
              <p class="text-background text-sm font-medium">Gérez l'ensemble de vos contenus supprimés.</p>
            </div>
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

          :isLoading="isPendingEntries"

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
                <DropdownMenuItem v-if="hasPermission(['update_content_entry'])" :disabled="isRestoreContentEntryPending" class="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors focus:bg-destructive/10 focus:text-destructive">
                  <button @click="handleRestoreContentEntry(row.id)" class="text-text hover:text-primary p-2 flex items-center gap-2 transition-all hover:scale-110">
                    <RefreshCw class="w-4 h-4" /> Restaurer
                  </button>
                </DropdownMenuItem>
                <DropdownMenuSeparator v-if="hasPermission(['delete_content_entry'])" />
                <DropdownMenuItem v-if="hasPermission(['delete_content_entry'])" @select.prevent :disabled="isDeleteContentEntryPending" class="flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-colors focus:bg-destructive/10 focus:text-destructive">
                  <CompositionConfirmDialog
                    cancelText="Annuler"
                    actionText="Supprimer"
                    description="Voulez-vous vraiment supprimer ce contenu ? ce contenu sera supprimé définitivement."
                    header="Supprimer ce contenu"
                    @confirm="handleDeleteContentEntry(row.id)"
                  >
                    <template #dialogButton>
                      <button  class="text-text hover:text-primary p-2 flex items-center gap-2 transition-all hover:scale-110">
                        <Trash2 class="w-4 h-4" /> Supprimer
                      </button>
                    </template>

                  </CompositionConfirmDialog>

                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </template>
        </CompositionTable>
      </div>
    </div>
  </div>
</template>
