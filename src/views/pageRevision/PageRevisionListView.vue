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
    import { useBlockTemplate } from '../../hook/bloc-template'

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
    const { fetchAll, useSyncAll, useDeleteSection, deleteBlockTemplate } = useBlockTemplate();

    const isPublishing = ref<number | null>(null);

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

    // Nouvelle logique de publication (Recyclage de l'ancienne version)
    const handlePublishRevision = async (targetRevisionId: number) => {
        try {
            isPublishing.value = targetRevisionId;
            const allRevisions = pageRevisionQuery.data.value?.results || [];

            // 1. Trouver la version publiée actuelle
            const currentPublished = allRevisions.find(r => r.status === 'PUBLISHED');

            // Fonction récursive pour supprimer les anciens IDs sur tout l'arbre
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cleanComponentIds = (components: any[]): any[] => {
                if (!components || !Array.isArray(components)) return [];
                return components.map(c => ({
                    ...c,
                    id: undefined,
                    blocTemplateId: undefined,
                    children: cleanComponentIds(c.children)
                }));
            };

            // 2. Préparer l'arbre complet de la révision cible (celle qu'on veut publier)
            const targetTreeRaw = await fetchAll(targetRevisionId);
            // Copie profonde pour s'assurer qu'absolument aucune référence n'est partagée
            const targetTree = JSON.parse(JSON.stringify(targetTreeRaw || []));

            const treeToClone = targetTree.map((section: any) => ({
                ...section,
                id: undefined, // forcer la création d'un nouvel UUID côté frontend
                sectionId: undefined, // forcer Create au lieu de Update dans useSyncAll
                children: cleanComponentIds(section.children)
            }));

            // 3. Passer la révision cible en PUBLISHED
            await pageRevisionStatusUpdate.mutateAsync({
                id: targetRevisionId,
                status: 'PUBLISHED'
            });

            // 4. Gérer le clonage dans une révision DOIT rester en DRAFT (Brouillon)
            if (currentPublished && currentPublished.id !== targetRevisionId) {
                // S'il y avait déjà une version publiée, on la recycle :
                // - on la repasse en DRAFT
                await pageRevisionStatusUpdate.mutateAsync({
                    id: currentPublished.id,
                    status: 'DRAFT'
                });

                // - on supprime ses anciennes sections (en purgeant d'abord les blocs pour éviter les contraintes de clés étrangères)
                const oldTree = await fetchAll(currentPublished.id);

                // Fonction pour supprimer tous les blocs récursivement de bas en haut
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const deleteBlocksRecursively = async (nodes: any[]) => {
                    if (!nodes || nodes.length === 0) return;
                    for (const node of nodes) {
                        if (node.children && node.children.length > 0) {
                            await deleteBlocksRecursively(node.children);
                        }
                        if (node.blocTemplateId) {
                            await deleteBlockTemplate(node.blocTemplateId);
                        }
                    }
                };

                for (const section of oldTree) {
                    if (section.sectionId) {
                        try {
                            await deleteBlocksRecursively(section.children || []);
                            await useDeleteSection(section.sectionId);
                        } catch (e) {
                            console.error("Failed to delete old section or its blocks", e);
                        }
                    }
                }

                // - on copie les sections de la cible vers cette ancienne révision recyclée
                if (treeToClone.length > 0) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await useSyncAll(treeToClone as any, currentPublished.id);
                }
            } else if (!currentPublished) {
                // S'il n'y avait AUCUNE version publiée avant (première publication de la page) :
                // On crée une nouvelle révision Brouillon pour accueillir les futures modifications
                const maxVersion = allRevisions.reduce((max, r) => Math.max(max, r.version || 0), 0);
                const newRevision = await pageRevisionRegister.mutateAsync({
                    pageId: pageId.value,
                    status: 'DRAFT',
                    version: maxVersion + 1
                });

                if (newRevision && newRevision.id && treeToClone.length > 0) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await useSyncAll(treeToClone as any, newRevision.id);
                }
            }

            console.log('Revision published and clone processed successfully');
        } catch (error) {
            console.error('Failed to publish page revision:', error);
            alert("Erreur lors de la publication. Veuillez réessayer.");
        } finally {
            isPublishing.value = null;
            // Rafraîchir la liste complète
            pageRevisionQuery.refetch();
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
                  :disabled="isPublishing === row.id"
                >
                  <Rocket class="w-4 h-4" :class="{ 'animate-pulse text-indigo-500': isPublishing === row.id }" />
                  {{ isPublishing === row.id ? 'Publication en cours...' : 'Publier cette version' }}
                </button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator v-if="row.status !== 'PUBLISHED'" />
              <DropdownMenuLabel v-if="row.status !== 'PUBLISHED'">
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
