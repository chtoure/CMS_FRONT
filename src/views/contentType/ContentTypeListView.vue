<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import CompositionTable from '@/components/composition/CompositionTable.vue'
import Button from '@/components/ui/button/Button.vue'
import { Archive, ArchiveRestore, ClipboardList, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue'
import CompositionConfirmDialog from '../../components/composition/CompositionConfirmDialog.vue'
import DropdownMenu from '../../components/ui/dropdown-menu/DropdownMenu.vue'
import DropdownMenuTrigger from '../../components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import DropdownMenuContent from '../../components/ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuLabel from '../../components/ui/dropdown-menu/DropdownMenuLabel.vue'
import DropdownMenuSeparator from '../../components/ui/dropdown-menu/DropdownMenuSeparator.vue'
import { cn } from '../../lib/utils'
import Badge from '../../components/ui/badge/Badge.vue'
import CompositionVerifyButton from '../../components/composition/CompositionVerifyButton.vue'
import { useRouter } from 'vue-router'
import { useGetContentsPaginate , useArchiveContentType, useRestoreContentType, useDeleteContentType } from '../../hook/content-type'
import CompositionLoading from '../../components/composition/CompositionLoading.vue'
import CompositionError from '../../components/composition/CompositionError.vue'
import type { ContentType } from '../../type/content-type'
import { showToast } from '../../lib/toast'
import { handleError } from '../../lib/error'



const columns = [
  { key: 'num', label: 'Num', class: 'w-16' },
  { key: 'name', label: 'Nom' },
  { key: 'slug', label: 'Slug' },
  { key: 'description', label: 'Description'},
  { key: 'status', label: 'Statut', class: 'w-32' },
  { key: 'entriesCount', label: 'Champs Entrées', class: 'text-center' },
  { key: 'actions', label: 'Actions', class: 'w-10' }
]

const currentPage = ref(1);
const itemsPerPage = ref(10);
const filterArchiv = ref("all");
const search = ref('')

const router = useRouter()

const filterOptions = [
  { label: 'Actifs', value: 'false' },
  { label: 'Archivés', value: 'true' }
]

const filterParams = computed(() => ({
    archive: filterArchiv.value,
    page: currentPage.value,
    limit: itemsPerPage.value,
}));



const {
  data: dataContentTypes,
  isLoading: isLoadingContentTypes,
  isError: isgetErrorContentTypes,
  error: getErrorContentTypes,
  refetch: refetchContentTypes
} = useGetContentsPaginate(filterParams);


const contentTypesResults = computed(() => dataContentTypes.value?.results || []);
const totalItems = computed(() => dataContentTypes.value?.count || 0);



watch([currentPage, itemsPerPage, filterArchiv], () => {
  refetchContentTypes();
});



const {
  mutateAsync: archiveContentType,
  isPending: isLoadingArchiveContentType
} = useArchiveContentType();


const {
  mutateAsync: restoreContentType,
  isPending: isLoadingRestoreContentType
} = useRestoreContentType();


const {
  mutateAsync: deleteContentType,
  isPending: isLoadingDeleteContentType
} = useDeleteContentType();


const filteredData = computed(() => {
  return contentTypesResults.value.filter(item => {
    // Filtrage par recherche
    const matchesSearch = item.name.toLowerCase().includes(search.value.toLowerCase()) ||
                          item.slug.toLowerCase().includes(search.value.toLowerCase()) ||
                          item.description?.toLowerCase().includes(search.value.toLowerCase())

    // Filtrage par statut
   let matchesArchive = true;
    if (filterArchiv.value !== 'all') {
      matchesArchive = item.archive === (filterArchiv.value === 'true');
    }
    return matchesSearch && matchesArchive;
  })
})

const getStatusColor = (status: boolean) => {
  switch (status) {
    case false: return 'bg-success/20 text-success border-success/30'
    case true: return 'bg-muted text-muted-foreground border-border'
  }
}

const getStatusLabel = (status: boolean) => {

  switch (status) {
    case false: return 'Actif'
    case true: return 'Archivé'
  }
}

const handleEdit = (row: ContentType) => {
  router.push({ name: 'admin.content-types.edit', params: { id: row.id } })
}

const handleArchive = (id: number) => {
  archiveContentType(id, {
    onSuccess: () => {
      showToast("success", "Type de contenu archivé avec succès");
      refetchContentTypes();
    },
    onError: (error) => {
      handleError(error)
    }
  })
}


const handleRestore = (id: number) => {
  restoreContentType(id, {
    onSuccess: () => {
      showToast("success", "Type de contenu restauré avec succès");
      refetchContentTypes();
    },
    onError: (error) => {
      handleError(error)
    }
  })
}

const handleDelete = (id: number) => {
  deleteContentType(id, {
    onSuccess: () => {
      showToast("success", "Type de contenu supprimé avec succès");
      refetchContentTypes();
    },
    onError: (error) => {
      handleError(error)
    }
  })
}



const handleCreate = () => {
  router.push({ name: 'admin.content-types.create' })
}

</script>

<template>

  <CompositionLoading v-if="isLoadingContentTypes || isLoadingArchiveContentType || isLoadingRestoreContentType || isLoadingDeleteContentType" />
  <CompositionError v-else-if="isgetErrorContentTypes" :error="getErrorContentTypes?.message" />

  <div v-else class="min-h-screen space-y-10">
    <CompositionPageHeader>
      <template #content>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div class="flex items-center gap-4">
            <ClipboardList class="h-6 w-6" />
            <div class="space-y-2">
              <h1 class="text-huge font-black tracking-tighter leading-none"> <span class="text-primary italic">Gestion des types de contenus</span></h1>
              <p class="text-background opacity-80 text-lg font-medium">Gérez la structure de vos contenus.</p>
            </div>
          </div>

          <div class="flex items-center gap-4">

            <Button @click="handleCreate" class="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95">
              <Plus class="w-6 h-6 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>
      </template>
    </CompositionPageHeader>

    <!-- Table -->
        <div class="card rounded-none overflow-hidden">
          <div class="p-6">
              <CompositionTable
                :columns="columns"
                :data="filteredData"
                :total="totalItems"
                v-model:limit="itemsPerPage"
                v-model:currentPage="currentPage"

                searchable
                v-model:search="search"
                searchPlaceholder="Rechercher par nom ou slug..."

                filterable
                v-model:filterValue="filterArchiv"
                :filterOptions="filterOptions"
                filterPlaceholder="Statut"
              >
                <!-- Custom rendering for Name column -->


                <template #cell-num="{ index }">
                  {{  index + 1 }}
                </template>

                <template #cell-name="{ value }">
                  <span class="font-medium text-foreground">{{ value }}</span>
                </template>

                <template #cell-entriesCount="{ row }">
                  <span class="font-medium text-foreground">{{ row.fields_schema.length-1 }}</span>
                </template>


                <template #cell-status="{ row }">
                  <Badge
                    variant="outline"
                    :class="cn('px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider', getStatusColor(row.archive))"
                  >
                    {{ getStatusLabel(row.archive) }}
                  </Badge>
                </template>

                <!-- Custom rendering for Actions column -->
                <template #cell-actions="{ row }">
                  <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal class="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <CompositionVerifyButton :if="!row.archive">
                          <DropdownMenuLabel >
                          <button @click="handleEdit(row)" class="text-text p-2 flex items-center gap-2 hover:scale-110 hover:text-primary">
                            <Pencil class="w-4 h-4" /> Modifier
                          </button>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>
                            <CompositionConfirmDialog header="Archivage de type de contenu" description="Êtes-vous sûr de vouloir Archiver ?" cancelText="Annuler" actionText="Archiver" >
                              <template #dialogButton>
                                <button @click="handleArchive(row.id)" class="text-text  p-2 flex items-center gap-2 hover:scale-110 hover:text-primary">
                                  <Archive class="w-4 h-4"  /> Archiver
                                </button>
                              </template>
                            </CompositionConfirmDialog>
                          </DropdownMenuLabel>
                        </CompositionVerifyButton>
                        <CompositionVerifyButton :if="row.archive">
                          <DropdownMenuLabel>
                            <CompositionConfirmDialog header="Restoration de type de contenu" description="Êtes-vous sûr de vouloir restorer ?" cancelText="Annuler" actionText="Restorer" >
                              <template #dialogButton>
                                <button @click="handleRestore(row.id)" class="text-text  p-2 flex items-center gap-2 transition-all hover:scale-110 hover:text-primary">
                                  <ArchiveRestore  class="w-4 h-4"  /> Restorer
                                </button>
                                <CompositionConfirmDialog header="Suppression de type de contenu" description="Êtes-vous sûr de vouloir supprimer définitivement ?" cancelText="Annuler" actionText="Supprimer" >
                                  <template #dialogButton>
                                    <button @click="handleDelete(row.id)" class="text-text  p-2 flex items-center gap-2 transition-all hover:scale-110 hover:text-destructive">
                                      <Trash2  class="w-4 h-4"  /> Supprimer
                                    </button>
                                  </template>
                                </CompositionConfirmDialog>
                              </template>
                            </CompositionConfirmDialog>
                          </DropdownMenuLabel>
                        </CompositionVerifyButton>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </template>
              </CompositionTable>
          </div>
        </div>
  </div>
</template>
