<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
    import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
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
    import { useGetPage } from '../../hook/page'
    import { showToast } from '../../lib/toast'

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
    const pageQuery = useGetPage(pageId);

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

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PUBLISHED': return 'Publiée'
            case 'DRAFT': return 'Brouillon'
            case 'ARCHIVED': return 'Archivée'
            default: return status
        }
    }

    const mediaResults = computed(() => pageRevisionQuery.data.value?.results || []);
    const totalItems = computed(() => pageRevisionQuery.data.value?.count || 0);

    // Mémoriser la dernière version ouverte pour affichage dynamique du badge "En cours"
    const lastActiveDraftId = ref<number | null>(null);

    const onStorageCrossTab = (e: StorageEvent) => {
        if (e.key === `lastActiveDraft_${pageId.value}`) {
            lastActiveDraftId.value = Number(e.newValue);
        }
    };

    onMounted(() => {
        lastActiveDraftId.value = Number(localStorage.getItem(`lastActiveDraft_${pageId.value}`)) || null;
        window.addEventListener('storage', onStorageCrossTab);
    });

    onUnmounted(() => {
        window.removeEventListener('storage', onStorageCrossTab);
    });

    const setLastActive = (id: number) => {
        lastActiveDraftId.value = id;
        localStorage.setItem(`lastActiveDraft_${pageId.value}`, id.toString());
    };

    // Le draft actif est celui qu'on a cliqué en dernier, sinon le plus récemment modifié
    const draftRevision = computed(() => {
        const drafts = mediaResults.value; // On prend toutes les versions éditables pour être sûr (ou juste DRAFT)
        if (drafts.length === 0) return null;

        if (lastActiveDraftId.value) {
            const found = drafts.find((r: any) => r.id === lastActiveDraftId.value);
            if (found && found.status !== 'PUBLISHED') return found;
        }

        const draftOnly = drafts.filter((r: any) => r.status === 'DRAFT');
        if (draftOnly.length === 0) return null;

        return draftOnly.reduce((latest: any, current: any) => {
            return new Date(current.updatedAt) > new Date(latest.updatedAt) ? current : latest;
        });
    });

    const pageRevisionRegister = useRegisterPageRevision();
    const pageRevisionStatusUpdate = useUpdatePageRevisionStatus();
    const { fetchAll, useSyncAll, useDeleteSection, useDeleteBlockTemplate } = useBlockTemplate();
    const deleteBlockTemplateMut = useDeleteBlockTemplate();

    const isPublishing = ref<number | null>(null);

    const handleCreateRevision = async () => {
        try {

           // On calcule le numéro de la prochaine version de manière sécurisée
            const nextVersion = Math.max(...mediaResults.value.map((r: any) => r.version)) + 1;

            console.log('nextVersion', nextVersion);

            const newRevision = await pageRevisionRegister.mutateAsync({
                pageId: pageId.value,
                status: 'DRAFT',
                version: nextVersion,
            });

            if (newRevision && newRevision.id) {
                pageRevisionQuery.refetch();
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

            // 1.5 Dictionnaire pour mapper les anciens IDs aux nouveaux
            const idMap = new Map<string, string>();

            // Fonction récursive pour générer des nouveaux UUIDs sur tout l'arbre
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cleanComponentIds = (components: any[]): any[] => {
                if (!components || !Array.isArray(components)) return [];
                return components.map(c => {
                    const newId = crypto.randomUUID();
                    // On map l'ancien blocTemplateId ou id vers le nouveau UUID généré
                    if (c.blocTemplateId) {
                        idMap.set(c.blocTemplateId.toString(), newId);
                    } else if (c.id) {
                        idMap.set(c.id.toString(), newId);
                    }

                    return {
                        ...c,
                        id: newId, // Assigne explicitement la nouvelle ID générée
                        blocTemplateId: undefined,
                        children: cleanComponentIds(c.children)
                    };
                });
            };

            // Fonction pour mettre à jour les targetIds des actions (ex: TOGGLE_VISIBILITY)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updateTargetIds = (components: any[]) => {
                if (!components || !Array.isArray(components)) return;
                components.forEach(c => {
                    if (c.data?.cliquable?.action === 'TOGGLE_VISIBILITY' && c.data.cliquable.action_params?.targetId) {
                        const oldTargetId = c.data.cliquable.action_params.targetId;
                        if (idMap.has(oldTargetId)) {
                            c.data.cliquable.action_params.targetId = idMap.get(oldTargetId);
                        }
                    }
                    if (c.children) {
                       updateTargetIds(c.children);
                    }
                });
            };

            // 2. Préparer l'arbre complet de la révision cible (celle qu'on veut publier)
            const targetTreeRaw = await fetchAll(targetRevisionId);
            // Copie profonde pour s'assurer qu'absolument aucune référence n'est partagée
            const targetTree = JSON.parse(JSON.stringify(targetTreeRaw || []));

            const treeToClone = targetTree.map((section: any) => {
                const newSectionId = crypto.randomUUID();
                if (section.sectionId) {
                    idMap.set(section.sectionId.toString(), newSectionId);
                } else if (section.id) {
                   idMap.set(section.id.toString(), newSectionId);
                }
                return {
                    ...section,
                    id: newSectionId, // forcer la création d'un nouvel UUID côté frontend
                    sectionId: undefined, // forcer Create au lieu de Update dans useSyncAll
                    children: cleanComponentIds(section.children)
                };
            });

            // Met à jour toutes les clauses 'targetIds' obsolètes pour la nouvelle révision
            treeToClone.forEach((section: any) => updateTargetIds(section.children));

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
                            await deleteBlockTemplateMut.mutateAsync(node.blocTemplateId);
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

            // Déterminer la version du brouillon de travail pour l'afficher dans le toast
            const draftVersionToShow = currentPublished
                ? currentPublished.version
                : (allRevisions.reduce((max, r) => Math.max(max, r.version || 0), 0) + 1);

            showToast('success', `Publication réussie ! Vous trouverez le contenu de cette page dans le brouillon (Version ${draftVersionToShow}) pour vos futures modifications.`);

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
        <template #extra-header>
          <div v-if="draftRevision" class="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-md border border-primary/20">
            <Pencil class="w-4 h-4" />
            <span class="text-sm font-medium whitespace-nowrap">Brouillon en cours : Version {{ draftRevision.version }}</span>
          </div>
        </template>

        <template #cell-id="{ index }">
          <p>{{ index + 1 }}</p>
        </template>
        <template #cell-status="{ row }">
            <span :class="['px-3 py-1 rounded-full text-xs font-bold border', getStatusColor(row.status)]">
                {{ getStatusLabel(row.status) }}
            </span>
        </template>
        <template #cell-version="{ row }">
            <p>{{ row.version }}</p>
        </template>
        <template #cell-sections="{ row }">
            <p>{{ row.sections?.length || 0 }}</p>
        </template>
        <template #cell-user="{ row }">
            <p>{{ row.user?.full_name || '-' }}</p>
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
              <DropdownMenuLabel v-if="row.status === 'PUBLISHED'">
                <div class="flex flex-col gap-1">
                  <a
                    target="_blank"
                    :href="pageQuery.data.value?.slug.startsWith('/') ? pageQuery.data.value.slug : '/' + (pageQuery.data.value?.slug || '')"
                    class="text-text p-2 flex items-center gap-2 transition-all hover:scale-110"
                  >
                    <Eye class="w-4 h-4" /> Visualiser
                  </a>
                  <a
                    v-if="draftRevision"
                    target="_blank"
                    :href="`${$router.resolve({ name: 'admin.page-revision.update', params: { id: draftRevision.id } }).href}`"
                    class="text-text p-2 flex items-center gap-2 transition-all hover:scale-110"
                    @click="setLastActive(draftRevision.id)"
                  >
                    <Pencil class="w-4 h-4" /> Modifier (Actuel)
                  </a>
                </div>
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
                <a 
                   target="_blank" 
                   :href="`${$router.resolve({ name: 'admin.page-revision.update', params: { id: row.id } }).href}`" 
                   class="text-text p-2 flex items-center gap-2 transition-all hover:scale-110"
                   @click="setLastActive(row.id)"
                >
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
