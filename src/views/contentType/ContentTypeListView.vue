<script setup lang="ts">
import { ref, computed } from 'vue'
import CompositionTable from '@/components/composition/CompositionTable.vue'
import Button from '@/components/ui/button/Button.vue'
import { Archive, ArchiveRestore, ClipboardList, MoreHorizontal, Pencil, Plus } from 'lucide-vue-next'
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



interface ContentType {
  id: number
  name: string
  slug: string
  description: string
  entriesCount: number
  archive: boolean
}

// Mock Data
const contentTypes = ref<ContentType[]>([
  {
    id: 1,
    name: 'Article',
    slug: 'article',
    description: 'Articles de blog standard',
    entriesCount: 15,
    archive: false
  },
  {
    id: 2,
    name: 'Produit',
    slug: 'product',
    description: 'Catalogue de produits',
    entriesCount: 8,
    archive: false
  },
  {
    id: 3,
    name: 'Page',
    slug: 'page',
    description: 'Pages statiques du site',
    entriesCount: 4,
    archive: true
  },
  {
    id: 4,
    name: 'Portfolio',
    slug: 'portfolio',
    description: 'Projets et réalisations',
    entriesCount: 12,
    archive: false
  }
])

const columns = [
  { key: 'id', label: 'ID', class: 'w-16' },
  { key: 'name', label: 'Nom' },
  { key: 'slug', label: 'Slug' },
  { key: 'description', label: 'Description'},
  { key: 'status', label: 'Statut', class: 'w-32' },
  { key: 'entriesCount', label: 'Entrées', class: 'w-[100px] text-center' },
  { key: 'actions', label: 'Actions', class: 'w-10' }
]

const limit = ref(10)
const currentPage = ref(1)
const search = ref('')
const filterStatus = ref('all')

const filterOptions = [
  { label: 'Actifs', value: 'active' },
  { label: 'Archivés', value: 'archive' }
]

const filteredData = computed(() => {
  return contentTypes.value.filter(item => {
    // Filtrage par recherche
    const matchesSearch = item.name.toLowerCase().includes(search.value.toLowerCase()) ||
                          item.slug.toLowerCase().includes(search.value.toLowerCase()) ||
                          item.description.toLowerCase().includes(search.value.toLowerCase())

    // Filtrage par statut
    let matchesFilter = true
    if (filterStatus.value === 'active') {
      matchesFilter = !item.archive
    } else if (filterStatus.value === 'archive') {
      matchesFilter = item.archive
    }

    return matchesSearch && matchesFilter
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
  console.log('Edit', row)
}

const handleDelete = (row: ContentType) => {
  console.log('Delete', row)
}

const router = useRouter()

const handleCreate = () => {
  router.push({ name: 'admin.content-types.create' })
}

</script>

<template>
  <div class="min-h-screen space-y-10">
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
                :total="filteredData.length"
                v-model:limit="limit"
                v-model:currentPage="currentPage"

                searchable
                v-model:search="search"
                searchPlaceholder="Rechercher par nom ou slug..."

                filterable
                v-model:filterValue="filterStatus"
                :filterOptions="filterOptions"
                filterPlaceholder="Statut"
              >
                <!-- Custom rendering for Name column -->
                <template #cell-name="{ value }">
                  <span class="font-medium text-foreground">{{ value }}</span>
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
                        <Button variant="ghost" size="icon" @click.stop="console.log('Editer', row)">
                          <MoreHorizontal class="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator/>
                        <CompositionVerifyButton :if="!row.archive">
                          <DropdownMenuLabel >
                          <button @click="handleEdit(row)" class="text-text p-2 flex items-center gap-2 transition-all hover:scale-110">
                            <Pencil class="w-4 h-4" /> Modifier
                          </button>
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>
                            <CompositionConfirmDialog header="Suppression de type de contenu" description="Êtes-vous sûr de vouloir Archiver ?" cancelText="Annuler" actionText="Archiver" >
                              <template #dialogButton>
                                <button @click="handleDelete(row)" class="text-text  p-2 flex items-center gap-2 transition-all hover:scale-110">
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
                                <button class="text-text  p-2 flex items-center gap-2 transition-all hover:scale-110">
                                  <ArchiveRestore  class="w-4 h-4"  /> Restorer
                                </button>
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
