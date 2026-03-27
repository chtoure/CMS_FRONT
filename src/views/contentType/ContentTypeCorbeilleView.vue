<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import CompositionTable from '@/components/composition/CompositionTable.vue'
import Button from '@/components/ui/button/Button.vue'
import { ArchiveRestore, ClipboardList, MoreHorizontal, Trash2 } from 'lucide-vue-next'
import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue'
import DropdownMenu from '../../components/ui/dropdown-menu/DropdownMenu.vue'
import DropdownMenuTrigger from '../../components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import DropdownMenuContent from '../../components/ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuLabel from '../../components/ui/dropdown-menu/DropdownMenuLabel.vue'
import DropdownMenuSeparator from '../../components/ui/dropdown-menu/DropdownMenuSeparator.vue'
import { useRestoreContentType, useDeleteContentType, useGetContentTypes } from '../../hook/content-type'
import CompositionError from '../../components/composition/CompositionError.vue'
import { showToast } from '../../lib/toast'
import { handleError } from '../../lib/error'
import CompositionConfirmDialog from '../../components/composition/CompositionConfirmDialog.vue'



const columns = [
  { key: 'num', label: 'Num', class: 'w-16' },
  { key: 'name', label: 'Nom' },
  { key: 'slug', label: 'Identifiant' },
  { key: 'description', label: 'Description'},
  { key: 'entriesCount', label: 'Champs Entrées', class: 'text-center' },
  { key: 'actions', label: 'Actions', class: 'w-10' }
]

const currentPage = ref(1);
const itemsPerPage = ref(10);
const search = ref('')


const filterParams = computed(() => ({
    archive: "true",
    page: currentPage.value,
    limit: itemsPerPage.value,
    search: search.value
}));



const {
  data: dataContentTypes,
  isLoading: isLoadingContentTypes,
  isError: isgetErrorContentTypes,
  error: getErrorContentTypes,
  refetch: refetchContentTypes
} = useGetContentTypes(filterParams);



watch([currentPage, itemsPerPage], () => {
  refetchContentTypes();
});



const {
  mutateAsync: restoreContentType,
  isPending: isLoadingRestoreContentType
} = useRestoreContentType();


const {
  mutateAsync: deleteContentType,
  isPending: isLoadingDeleteContentType
} = useDeleteContentType();





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


</script>

<template>

  <CompositionError v-if="isgetErrorContentTypes" :error="getErrorContentTypes?.message" />

  <div v-else class="min-h-screen space-y-10">
    <CompositionPageHeader>
      <template #content>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div class="flex items-center gap-4">
            <ClipboardList class="h-6 w-6" />
            <div class="space-y-2">
              <h1 class="text-huge font-black tracking-tighter leading-none"> <span class="text-primary italic">Corbeille des types de contenus</span></h1>
              <p class="text-background opacity-80 text-lg font-medium">Gérez les types de contenus supprimés.</p>
            </div>
          </div>
        </div>
      </template>
    </CompositionPageHeader>

    <!-- Table -->
        <div class="card rounded-none overflow-hidden">
          <div class="p-6">
              <CompositionTable
                :columns="columns"
                :data="dataContentTypes?.results || []"
                :total="dataContentTypes?.count || 0"
                v-model:limit="itemsPerPage"
                v-model:currentPage="currentPage"

                searchable
                v-model:search="search"
                searchPlaceholder="Rechercher par nom ou identifiant..."

                :isLoading="isLoadingContentTypes || isLoadingRestoreContentType || isLoadingDeleteContentType"
              >

                <template #cell-num="{ index }">
                  {{  index + 1 }}
                </template>

                <template #cell-name="{ value }">
                  <span class="font-medium text-foreground">{{ value }}</span>
                </template>

                <template #cell-entriesCount="{ row }">
                  <span class="font-medium text-foreground">{{ row.fields_schema.length-1 }}</span>
                </template>

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
                          <DropdownMenuLabel>
                            <CompositionConfirmDialog @confirm="handleRestore(row.id)" header="Restoration de type de contenu" description="Êtes-vous sûr de vouloir restorer ?" cancelText="Annuler" actionText="Restorer" >
                              <template #dialogButton>
                                <button class="text-text  p-2 flex items-center gap-2 transition-all hover:scale-110 hover:text-primary">
                                  <ArchiveRestore  class="w-4 h-4"  /> Restorer
                                </button>
                              </template>
                            </CompositionConfirmDialog>
                            <CompositionConfirmDialog @confirm="handleDelete(row.id)" header="Suppression de type de contenu" description="Êtes-vous sûr de vouloir supprimer définitivement ?" cancelText="Annuler" actionText="Supprimer" >
                              <template #dialogButton>
                                <button class="text-text  p-2 flex items-center gap-2 transition-all hover:scale-110 hover:text-destructive">
                                  <Trash2  class="w-4 h-4"  /> Supprimer
                                </button>
                              </template>
                            </CompositionConfirmDialog>
                          </DropdownMenuLabel>
                      </DropdownMenuContent>
                    </DropdownMenu>
                </template>
              </CompositionTable>
          </div>
        </div>
  </div>
</template>
