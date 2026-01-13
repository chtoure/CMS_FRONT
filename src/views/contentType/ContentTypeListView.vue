<script setup lang="ts">
import { ref } from 'vue'
import CompositionTable from '@/components/composition/CompositionTable.vue'
import Button from '@/components/ui/button/Button.vue'
import { Archive, ArchiveRestore, ClipboardList, MoreHorizontal, Pencil, Plus } from 'lucide-vue-next'
import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue'
import Select from '../../components/ui/select/Select.vue'
import SelectTrigger from '../../components/ui/select/SelectTrigger.vue'
import SelectValue from '../../components/ui/select/SelectValue.vue'
import SelectContent from '../../components/ui/select/SelectContent.vue'
import SelectItem from '../../components/ui/select/SelectItem.vue'
import CompositionConfirmDialog from '../../components/composition/CompositionConfirmDialog.vue'
import DropdownMenu from '../../components/ui/dropdown-menu/DropdownMenu.vue'
import DropdownMenuTrigger from '../../components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import DropdownMenuContent from '../../components/ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuLabel from '../../components/ui/dropdown-menu/DropdownMenuLabel.vue'
import DropdownMenuSeparator from '../../components/ui/dropdown-menu/DropdownMenuSeparator.vue'



interface ContentType {
  id: number
  name: string
  slug: string
  description: string
  entriesCount: number
}

// Mock Data
const contentTypes = ref<ContentType[]>([
  {
    id: 1,
    name: 'Article',
    slug: 'article',
    description: 'Articles de blog standard',
    entriesCount: 15
  },
  {
    id: 2,
    name: 'Produit',
    slug: 'product',
    description: 'Catalogue de produits',
    entriesCount: 8
  },
  {
    id: 3,
    name: 'Page',
    slug: 'page',
    description: 'Pages statiques du site',
    entriesCount: 4
  },
  {
    id: 4,
    name: 'Portfolio',
    slug: 'portfolio',
    description: 'Projets et réalisations',
    entriesCount: 12
  }
])

const columns = [
  { key: 'name', label: 'Nom', class: 'w-[200px]' },
  { key: 'slug', label: 'Slug', class: 'w-[200px]' },
  { key: 'description', label: 'Description' },
  { key: 'entriesCount', label: 'Entrées', class: 'w-[100px] text-center' },
  { key: 'actions', label: 'Actions', class: 'w-[100px] text-end' }
]

const limit = ref(10)
const currentPage = ref(1)
const total = ref(contentTypes.value.length)

const handleCreate = () => {
  console.log('Create new content type')
}

const handleEdit = (row: ContentType) => {
  console.log('Edit', row)
}

const handleDelete = (row: ContentType) => {
  console.log('Delete', row)
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
          <div class="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p class="font-bold text-text huge">Liste des types de contenus</p>
            <div class="">
              <Select>
                <SelectTrigger class="input-custom">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" class="select-item-custom">Tous</SelectItem>
                  <SelectItem value="false" class="select-item-custom">Active</SelectItem>
                  <SelectItem value="true" class="select-item-custom">Achivés</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div class="p-6">
              <CompositionTable
                :columns="columns"
                :data="contentTypes"
                :total="total"
                v-model:limit="limit"
                v-model:currentPage="currentPage"
              >
                <!-- Custom rendering for Name column -->
                <template #cell-name="{ value }">
                  <span class="font-medium text-foreground">{{ value }}</span>
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
                        <!-- <CompositionVerifyButton> -->
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
                        <!-- </CompositionVerifyButton> -->
                        <!-- <CompositionVerifyButton> -->
                          <DropdownMenuLabel>
                            <CompositionConfirmDialog header="Restoration de type de contenu" description="Êtes-vous sûr de vouloir restorer ?" cancelText="Annuler" actionText="Restorer" >
                              <template #dialogButton>
                                <button class="text-text  p-2 flex items-center gap-2 transition-all hover:scale-110">
                                  <ArchiveRestore  class="w-4 h-4"  /> Restorer
                                </button>
                              </template>
                            </CompositionConfirmDialog>
                          </DropdownMenuLabel>
                        <!-- </CompositionVerifyButton> -->
                      </DropdownMenuContent>
                    </DropdownMenu>
                </template>
              </CompositionTable>
          </div>
        </div>
  </div>
</template>
