<script setup lang="ts">
    import { computed, ref, watch } from 'vue'
    import CompositionTable from '@/components/composition/CompositionTable.vue'
    import Button from '@/components/ui/button/Button.vue'
    import {ArrowLeft, Eye, MoreHorizontal, Pencil, Plus, Rocket, X } from 'lucide-vue-next'
    import CompositionLoading from '../../components/composition/CompositionLoading.vue'
    import CompositionError from '../../components/composition/CompositionError.vue'
    import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue'
    import DropdownMenu from '../../components/ui/dropdown-menu/DropdownMenu.vue'
    import DropdownMenuTrigger from '../../components/ui/dropdown-menu/DropdownMenuTrigger.vue'
    import DropdownMenuContent from '../../components/ui/dropdown-menu/DropdownMenuContent.vue'
    import DropdownMenuLabel from '../../components/ui/dropdown-menu/DropdownMenuLabel.vue'
    import DropdownMenuSeparator from '../../components/ui/dropdown-menu/DropdownMenuSeparator.vue'
    import CompositionConfirmDialog from '../../components/composition/CompositionConfirmDialog.vue'
    import { useHead } from '@vueuse/head'
    import { useRouter } from 'vue-router'
    import { useGetPageRevisions, useRegisterPageRevision, useUpdatePageRevisionStatus } from '../../hook/page-revision'

    const router = useRouter();
    useHead({
        meta: [
        { name: 'description', content: 'Gérez vos actifs visuels avec précision sur la plateforme Compositor.' },
        { property: 'og:title', content:'Pages' },
        { property: 'og:description', content: 'Gérez vos actifs visuels avec précision sur la plateforme Compositor.' },
        ],
    })

    const pageId = computed(() => {
      return (router.currentRoute.value.params.id as unknown) as number
    })


    const currentPage = ref(1);
    const limit = ref(10);
    const search = ref('');

    const filterParams = computed(() => ({
        page: currentPage.value,
        limit: limit.value,
        search: search.value
    }));

    const pageRevisionQuery = useGetPageRevisions(pageId, filterParams);

    watch([currentPage, limit], () => {
        pageRevisionQuery.refetch();
    });

    const deletePageRevision = (id?: number) => {
        console.log('deletage de la version :', id);
    }

    const columns = [
        { key: 'id', label: 'ID' , class: 'w-6' },
        { key: 'status', label: 'Statut' },
        { key: 'version', label: 'Version' },
        { key: 'sections', label: 'Nb. Sections'},
        { key: 'user', label: 'Utilisateur'},
        { key: 'actions', label: 'Actions', class: 'w-10' },
    ]

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return 'text-success border-success'
            case 'DRAFT': return 'bg-warning text-warning border-warning'
            case 'ARCHIVED': return 'bg-muted text-muted-foreground border-border'
            default: return 'bg-secondary text-secondary-foreground'
        }
    }

    const mediaResults = computed(() => pageRevisionQuery.data.value?.results || []);
    const totalItems = computed(() => pageRevisionQuery.data.value?.count || 0);

    const pageRevisionRegister = useRegisterPageRevision();
    const pageRevisionStatusUpdate = useUpdatePageRevisionStatus();

    const handleCreateRevision = async () => {
        try {
            const newRevision = await pageRevisionRegister.mutateAsync({
                pageId: pageId.value,
                status: 'DRAFT'
            });

            if (newRevision && newRevision.id) {
                router.push({
                    name: 'admin.page-revision.update',
                    params: { id: newRevision.id }
                });
            }
        } catch (error) {
            console.error('Failed to create page revision:', error);
        }
    }

    const handlePublishRevision = async (id: number) => {
        try {
            await pageRevisionStatusUpdate.mutateAsync({
                id: id,
                status: 'PUBLISHED'
            });
            console.log('Revision published successfully');
        } catch (error) {
            console.error('Failed to publish page revision:', error);
        }
    }

</script>

<template>
  <CompositionLoading v-if="(pageRevisionQuery.isLoading.value && !pageRevisionQuery.data.value)" />

  <CompositionError
    v-else-if="pageRevisionQuery.isError.value"
    :error="pageRevisionQuery.error.value?.message"
  />

  <div v-else :class="['space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700', pageRevisionQuery.isFetching.value ? 'opacity-50 pointer-events-none transition-opacity' : '']">
    <CompositionPageHeader>
        <template #content>
          <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div class="flex gap-4 items-center">
                  <div class="hover:cursor-pointer hover:text-primary" @click="$router.back()">
                      <ArrowLeft />
                  </div>
                  <div class="space-y-2">
                      <h1 class="text-huge font-black tracking-tighter leading-none"> <span class="text-primary italic">Gestionnaire de pages</span></h1>
                      <p class="text-background text-sm font-medium">Gérez vos pages visuels avec une précision chirurgicale.</p>
                  </div>
              </div>

              <div class="flex items-center gap-4">
                  <Button
                    class="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95"
                    @click="handleCreateRevision"
                    :disabled="pageRevisionRegister.isPending.value"
                  >
                    <Plus class="w-6 h-6 mr-2" />
                    {{ pageRevisionRegister.isPending.value ? 'Création...' : 'Ajouter' }}
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
        filterPlaceholder="Tous les médias"
        searchable
        v-model:search="search"
      >
        <template #cell-id="{ index }">
          <p>{{ index + 1 }}</p>
        </template>
        <template #cell-status="{ row }">
            <span :class="['px-3 py-1 rounded-full text-xs font-bold border', getStatusColor(row.status)]">
                {{ row.status }}
            </span>
        </template>
        <template #cell-version="{ row }">
            <p>{{ row.version }}</p>
        </template>
        <template #cell-sections="{ row }">
            <p>{{ row.sections.length }}</p>
        </template>
        <template #cell-user="{ row }">
            <p>{{ row.user.full_name }}</p>
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
                <button class="text-text p-2 flex items-center gap-2 transition-all hover:scale-110">
                  <Eye class="w-4 h-4" /> Visualiser
                </button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel v-if="row.status !== 'PUBLISHED'">
                <button
                  class="text-primary p-2 flex items-center gap-2 transition-all hover:scale-110 font-bold"
                  @click="handlePublishRevision(row.id)"
                  :disabled="pageRevisionStatusUpdate.isPending.value"
                >
                  <Rocket class="w-4 h-4" />
                  {{ pageRevisionStatusUpdate.isPending.value ? 'Publication...' : 'Publier cette version' }}
                </button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator v-if="row.status !== 'PUBLISHED'" />
              <DropdownMenuLabel>
                <a target="_blank" :href="`${$router.resolve({ name: 'admin.page-revision.update', params: { id: row.id } }).href}`" class="text-text p-2 flex items-center gap-2 transition-all hover:scale-110">
                  <Pencil class="w-4 h-4" /> Modifier
                </a>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>
                <CompositionConfirmDialog @confirm="deletePageRevision(row.id)" header="Suppression de l'actif" description="Êtes-vous sûr de vouloir supprimer cette version ?" cancelText="Annuler" actionText="Supprimer" >
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
