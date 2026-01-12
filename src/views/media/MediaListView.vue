<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import CompositionTable from '@/components/composition/CompositionTable.vue'
  import Button from '@/components/ui/button/Button.vue'
  import { Eye, MoreHorizontal, Pencil, Plus, X } from 'lucide-vue-next'
  import { useCreateMedia, useDeleteMedia, useGetMediaList } from '../../hook/media'
  import { showToast } from '../../lib/toast'
  import { getErrorMessage } from '../../lib/errorMessage'
  import BaseCheckbox from '../../components/base/BaseCheckbox.vue'
  import CompositionLoading from '../../components/composition/CompositionLoading.vue'
  import CompositionError from '../../components/composition/CompositionError.vue'
  import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue'
  import DropdownMenu from '../../components/ui/dropdown-menu/DropdownMenu.vue'
  import DropdownMenuTrigger from '../../components/ui/dropdown-menu/DropdownMenuTrigger.vue'
  import DropdownMenuContent from '../../components/ui/dropdown-menu/DropdownMenuContent.vue'
  import DropdownMenuLabel from '../../components/ui/dropdown-menu/DropdownMenuLabel.vue'
  import DropdownMenuSeparator from '../../components/ui/dropdown-menu/DropdownMenuSeparator.vue'
  import CompositionConfirmDialog from '../../components/composition/CompositionConfirmDialog.vue'
  import CompositionVideoImageModal from '../../components/composition/CompositionVideoImageModal.vue'
  import { useHead } from '@vueuse/head'

  useHead({
    meta: [
      { name: 'description', content: 'Gérez vos actifs visuels avec précision sur la plateforme Compositor.' },
      { property: 'og:title', content:'Médiathèque' },
      { property: 'og:description', content: 'Gérez vos actifs visuels avec précision sur la plateforme Compositor.' },
    ],
  })

  const selectedItems = ref<Set<number>>(new Set());
  const showRemoveButton = ref(false);
  const fileInput = ref<HTMLElement | null>(null);

  const currentPage = ref(1);
  const limit = ref(10);
  const filterType = ref("all");

  const filterOptions = [
    { label: 'Images', value: 'image' },
    { label: 'Vidéos', value: 'video' }
  ]

  const filterParams = computed(() => ({
    type: filterType.value === "all" ? undefined : (filterType.value as "image" | "video"),
    page: currentPage.value,
    limit: limit.value
  }));

  const mediaQuery = useGetMediaList(filterParams);

  const mediaCreator = useCreateMedia();
  const mediaDeleter = useDeleteMedia();

  // const filterChange = (val: string ) => {
  //   filterType.value = val;
  //   currentPage.value = 1;
  // }

  watch([currentPage, limit, filterType], () => {
    mediaQuery.refetch();
  });


  const deleteSelectedItems = (id?: number) => {
    const payload = id ? id : Array.from(selectedItems.value);
    mediaDeleter.mutate(payload, {
      onSuccess: async () => {
        await mediaQuery.refetch();
        if (!id) {
          selectedItems.value.clear();
          showRemoveButton.value = false;
        }
        showToast('success', 'Éléments supprimés de l\'Eldorado');
      },
      onError: (error: Error) => {
        showToast('error', `${getErrorMessage(error)}`);
      }
    });
  }

  const toggleSelection = (id: number, checked: boolean) => {
    const next = new Set(selectedItems.value);
    if (checked) next.add(id); else next.delete(id);
    selectedItems.value = next;
    showRemoveButton.value = selectedItems.value.size > 0;
  }

  const triggerFileInput = () => fileInput.value?.click();

  const handleFileUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const files = Array.from(input.files);
    try {
      const uploadFile = files.map((file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('alt', file.name);
        return mediaCreator.mutateAsync(formData);
      })
      await Promise.all(uploadFile);
      await mediaQuery.refetch();
      showToast('success', 'Médias importés avec succès');
    } catch (error) {
      showToast('error', `${getErrorMessage(error)}`);
    }
  }

  const columns = [
    { key: 'check', label: 'Check' , class: 'w-6' },
    { key: 'image', label: 'Image' },
    { key: 'alt', label: 'Alt' },
    { key: 'actions', label: 'Actions', class: 'w-10' },
  ]

  const mediaResults = computed(() => mediaQuery.data.value?.results || []);
  const totalItems = computed(() => mediaQuery.data.value?.count || 0);
</script>

<template>
  <CompositionLoading v-if="mediaCreator.isPending.value || mediaDeleter.isPending.value || (mediaQuery.isLoading.value && !mediaQuery.data.value)" />

  <CompositionError
    v-else-if="mediaCreator.isError.value || mediaQuery.isError.value"
    :error="mediaCreator.isError.value ? mediaCreator.error.value?.message : mediaQuery.error.value?.message"
  />

  <div v-else :class="['space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700', mediaQuery.isFetching.value ? 'opacity-50 pointer-events-none transition-opacity' : '']">
    <CompositionPageHeader>
      <template #content>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div class="space-y-2">
            <h1 class="text-huge font-black tracking-tighter leading-none"> <span class="text-primary italic">Médiathèque Galerie</span></h1>
            <p class="text-background text-sm font-medium">Gérez vos contenus visuels avec une précision chirurgicale.</p>
          </div>
          <div class="flex items-center gap-4">

            <input ref="fileInput" type="file" class="hidden" multiple accept="video/*,image/*" @change="handleFileUpload" />
            <Button class="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95" @click="triggerFileInput">
              <Plus class="w-6 h-6 mr-2" />
              Importer
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
        filterable
        v-model:filterValue="filterType"
        :filterOptions="filterOptions"
        filterPlaceholder="Tous les médias"
      >
        <template #extra-header>
          <CompositionConfirmDialog v-if="showRemoveButton" header="Nettoyage de l'Eldorado" description="Êtes-vous sûr de vouloir supprimer ces actifs ?" @confirm="deleteSelectedItems" cancelText="Annuler" actionText="Supprimer">
            <template #dialogButton>
              <Button variant="destructive" class="rounded px-6 font-black shadow-lg shadow-destructive/20 animate-in zoom-in h-9 text-xs">
                Nettoyer ({{ selectedItems.size }})
              </Button>
            </template>
          </CompositionConfirmDialog>
        </template>

        <template #cell-check="{ row }">
          <BaseCheckbox
            :checked="selectedItems.has(row.id)"
            @update:checked="(v:boolean) => toggleSelection(row.id, v)"
            class="w-3 h-3 rounded border border-border bg-background backdrop-blur-sm data-[state=checked]:bg-primary data-[state=checked]:border-primary shadow-lg"
          />
        </template>
        <template #cell-image="{ row }">
          <img v-if="row.type === 'image'" :src="row.file_path" alt="" class="h-20 object-cover shadow-sm" />
          <video v-else :src="row.file_path" autoplay loop muted alt="" class="h-20 object-cover shadow-sm" />
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
                <CompositionVideoImageModal :type="row.type" :href="row.file_path" :alt="row.alt">
                  <template #trigger>
                    <button class="text-text p-2 flex items-center gap-2 transition-all hover:scale-110">
                      <Eye class="w-4 h-4" /> Visualiser
                    </button>
                  </template>
                </CompositionVideoImageModal>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel v-if="row.type === 'image'">
                <button  @click="$router.push({ name: 'admin.media.update', params: { id: row.id } })" class="text-text p-2 flex items-center gap-2 transition-all hover:scale-110">
                  <Pencil class="w-4 h-4" /> Modifier
                </button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator v-if="row.type === 'image'" />
              <DropdownMenuLabel>
                <CompositionConfirmDialog @confirm="deleteSelectedItems(row.id)" header="Suppression de l'actif" description="Êtes-vous sûr de vouloir supprimer ce média ?" cancelText="Annuler" actionText="Supprimer" >
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
