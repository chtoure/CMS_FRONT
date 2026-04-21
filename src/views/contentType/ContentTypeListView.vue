<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import CompositionTable from '@/components/composition/CompositionTable.vue'
import Button from '@/components/ui/button/Button.vue'
import { Archive, ClipboardList, MoreHorizontal, Pencil, Plus } from 'lucide-vue-next'
import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue'
import DropdownMenu from '../../components/ui/dropdown-menu/DropdownMenu.vue'
import DropdownMenuTrigger from '../../components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import DropdownMenuContent from '../../components/ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuLabel from '../../components/ui/dropdown-menu/DropdownMenuLabel.vue'
import DropdownMenuSeparator from '../../components/ui/dropdown-menu/DropdownMenuSeparator.vue'
import { cn } from '../../lib/utils'
import Badge from '../../components/ui/badge/Badge.vue'
import { useRouter } from 'vue-router'
import { useGetContentTypes, useArchiveContentType } from '../../hook/content-type'
import CompositionError from '../../components/composition/CompositionError.vue'
import type { ContentType } from '../../type/content-type'
import { showToast } from '../../lib/toast'
import { handleError } from '../../lib/error'
import CompositionConfirmDialog from '../../components/composition/CompositionConfirmDialog.vue'



const columns = [
  { key: 'num', label: 'Num', class: 'w-16' },
  { key: 'name', label: 'Nom' },
  { key: 'slug', label: 'Identifiant' },
  { key: 'description', label: 'Description'},
  { key: 'status', label: 'Statut', class: 'w-32' },
  { key: 'entriesCount', label: 'Champs Entrées', class: 'text-center' },
  { key: 'actions', label: 'Actions', class: 'w-10' }
]

const currentPage = ref(1);
const itemsPerPage = ref(10);
const search = ref('')

const router = useRouter()



const filterParams = computed(() => ({
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
  mutateAsync: archiveContentType,
  isPending: isLoadingArchiveContentType
} = useArchiveContentType();



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







const handleCreate = () => {
  router.push({ name: 'admin.content-types.create' })
}

</script>

<template>

  <CompositionError v-if="isgetErrorContentTypes" :error="getErrorContentTypes?.message" />

  <div v-else class="min-h-screen space-y-10">
    <CompositionPageHeader>
      <template #content>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">

          <div class="flex items-center gap-4">
            <div
              class="p-3 bg-primary rounded-2xl"
            >
              <ClipboardList stroke-width="1" class="w-8 h-8" />
            </div>
            <div class="space-y-1">
              <h1 class="text-huge font-black tracking-tighter leading-none">
                <span class="text-primary italic">Gestion des types d'article</span>
              </h1>
              <p class="text-background text-sm font-medium">Gérez l'ensemble de vos types d'article.</p>
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
                :data="dataContentTypes?.results || []"
                :total="dataContentTypes?.count || 0"
                v-model:limit="itemsPerPage"
                v-model:currentPage="currentPage"

                searchable
                v-model:search="search"
                searchPlaceholder="Rechercher par nom ou identifiant..."

                :isLoading="isLoadingContentTypes || isLoadingArchiveContentType"

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


                <template #cell-status="{  }">
                  <Badge
                    variant="outline"
                    :class="cn('px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-success/20 text-success border-success/30')"
                  >
                    Actif
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
                        <DropdownMenuLabel >
                          <button @click="handleEdit(row)" class="text-text p-2 flex items-center gap-2 hover:scale-110 hover:text-primary">
                            <Pencil class="w-4 h-4" /> Modifier
                          </button>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>
                            <CompositionConfirmDialog @confirm="handleArchive(row.id)" header="Archivage de type de contenu" description="Êtes-vous sûr de vouloir Archiver ?" cancelText="Annuler" actionText="Archiver" >
                              <template #dialogButton>
                                <button class="text-text  p-2 flex items-center gap-2 hover:scale-110 hover:text-primary">
                                  <Archive class="w-4 h-4"  /> Archiver
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
