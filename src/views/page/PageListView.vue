<script setup lang="ts">
    import { computed, ref, watch } from 'vue'
    import CompositionTable from '@/components/composition/CompositionTable.vue'
    import Button from '@/components/ui/button/Button.vue'
    import { Eye, MoreHorizontal, Pencil, Plus, X } from 'lucide-vue-next'
    import CompositionError from '../../components/composition/CompositionError.vue'
    import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue'
    import DropdownMenu from '../../components/ui/dropdown-menu/DropdownMenu.vue'
    import DropdownMenuTrigger from '../../components/ui/dropdown-menu/DropdownMenuTrigger.vue'
    import DropdownMenuContent from '../../components/ui/dropdown-menu/DropdownMenuContent.vue'
    import DropdownMenuLabel from '../../components/ui/dropdown-menu/DropdownMenuLabel.vue'
    import DropdownMenuSeparator from '../../components/ui/dropdown-menu/DropdownMenuSeparator.vue'
    import CompositionConfirmDialog from '../../components/composition/CompositionConfirmDialog.vue'
    import { useHead } from '@vueuse/head'
    import { useGetPages } from '../../hook/page'

    useHead({
        meta: [
        { name: 'description', content: 'Gérez vos actifs visuels avec précision sur la plateforme Compositor.' },
        { property: 'og:title', content:'Pages' },
        { property: 'og:description', content: 'Gérez vos actifs visuels avec précision sur la plateforme Compositor.' },
        ],
    })


    const currentPage = ref(1);
    const limit = ref(10);
    const search = ref('');

    const filterParams = computed(() => ({
        page: currentPage.value,
        limit: limit.value,
        search: search.value
    }));

    const pageQuery = useGetPages(filterParams);

    watch([currentPage, limit], () => {
        pageQuery.refetch();
    });

    const deletePage = (id?: number) => {
        console.log('deletage de :', id);
    }

    const columns = [
        { key: 'id', label: 'ID' , class: 'w-6' },
        { key: 'name', label: 'Nom' },
        { key: 'slug', label: 'Slug' },
        { key: 'nb_revisions', label: 'Nb. Versions' },
        { key: 'user', label: 'Utilisateur'},
        { key: 'actions', label: 'Actions', class: 'w-10' },
    ]

    const mediaResults = computed(() => pageQuery.data.value?.results || []);
    const totalItems = computed(() => pageQuery.data.value?.count || 0);

    const createPage=()=>{}
</script>

<template>

  <CompositionError
    v-if="pageQuery.isError.value"
    :error="pageQuery.error.value?.message"
  />

  <div v-else :class="['space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700', pageQuery.isFetching.value ? 'opacity-50 pointer-events-none transition-opacity' : '']">
    <CompositionPageHeader>
      <template #content>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div class="space-y-2">
            <h1 class="text-huge font-black tracking-tighter leading-none"> <span class="text-primary italic">Gestionnaire de pages</span></h1>
            <p class="text-background text-sm font-medium">Gérez vos pages visuels avec une précision chirurgicale.</p>
          </div>
          <div class="flex items-center gap-4">
            <Button class="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95" @click="createPage">
              <Plus class="w-6 h-6 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>
      </template>
    </CompositionPageHeader>
    <div class="card rounded-none p-6" >
      <CompositionTable
        :columns="columns"
        :data="mediaResults"
        :total="totalItems"
        v-model:current-page="currentPage"
        v-model:limit="limit"
        searchable
        v-model:search="search"
        v-model:loading="pageQuery.isFetching.value"
      >

        <template #cell-id="{ index }">
          <p>{{ index + 1 }}</p>
        </template>

        <template #cell-name="{ row }">
          <p>{{ row.name }}</p>
        </template>

        <template #cell-slug="{ row }">
          <p>{{ row.slug }}</p>
        </template>

        <template #cell-nb_revisions="{ row }">
          <p>{{ row.pageRevisions.length }}</p>
        </template>

        <template #cell-user="{ row }">
          <p>{{ row.user?.full_name }}</p>
        </template>

        <template #cell-actions="{ row }">
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon" @click.stop="">
                <MoreHorizontal class="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>
                <button class="text-text p-2 flex items-center gap-2 transition-all hover:scale-110" @click="()=>{$router.push({ name: 'admin.pages.revisions', params: { id: row.id } })}">
                    <Eye class="w-4 h-4" /> Versionnement
                </button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel v-if="row.type === 'image'">
                <button  @click="$router.push({ name: 'admin.media.update', params: { id: row.id } })" class="text-text p-2 flex items-center gap-2 transition-all hover:scale-110">
                  <Pencil class="w-4 h-4" /> Modifier
                </button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator v-if="row.type === 'image'" />
              <DropdownMenuLabel>
                <CompositionConfirmDialog @confirm="deletePage(row.id)" header="Suppression de l'actif" description="Êtes-vous sûr de vouloir supprimer ce média ?" cancelText="Annuler" actionText="Supprimer" >
                  <template #dialogButton>
                    <button class="text-text p-2 flex items-center gap-2 transition-all hover:scale-110">
                      <X class="w-4 h-4" /> Supprimer
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
</template>
