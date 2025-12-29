<script setup lang="ts">
  import { ref, computed } from "vue"
  import { Plus, Pencil, X } from "lucide-vue-next"
  import { useGetMediaList, useCreateMedia, useDeleteMedia } from "../../hook/media"
  import { showToast } from "../../lib/toast"
  import Button from "@/components/ui/button/Button.vue"
  import BaseCheckbox from "@/components/base/BaseCheckbox.vue"
  import CompositionConfirmDialog from "@/components/composition/CompositionConfirmDialog.vue"
  import CompositionLoading from "@/components/composition/CompositionLoading.vue"
  import CompositionError from "@/components/composition/CompositionError.vue"
  import CompositionVideoImageModal from "@/components/composition/CompositionVideoImageModal.vue"
  import CompositionListEmpty from "@/components/composition/CompositionListEmpty.vue"

  const filterType = ref("all");
  const selectedItems = ref<Set<number>>(new Set());
  const showRemoveButton = ref(false);
  const fileInput = ref<HTMLElement | null>(null);

  const filterParams = computed(() => ({
    type: filterType.value === "all" ? undefined : filterType.value as "image" | "video"
  }));

  const mediaQuery = useGetMediaList(filterParams);
  const mediaCreator = useCreateMedia();
  const mediaDeleter = useDeleteMedia();

  const filterChange = (val: string) => {
    filterType.value = val;
  }

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
        showToast('error', `Erreur: ${error.message}`);
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
      showToast('error', `Échec de l'import: ${error}`);
    }
  }

  const mediaList = mediaQuery.data;
</script>

<template>
  <CompositionLoading v-if="mediaCreator.isPending.value || mediaQuery.isLoading.value || mediaDeleter.isPending.value" />

  <CompositionError
    v-else-if="mediaCreator.isError.value || mediaQuery.isError.value"
    :error="mediaCreator.isError.value ? mediaCreator.error.value?.message : mediaQuery.error.value?.message"
  />

  <div v-else class="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <div class="relative overflow-hidden bg-foreground rounded-[2rem] p-10 text-background shadow-2xl">
      <div class="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div class="space-y-2">
          <h1 class="text-5xl font-black tracking-tighter leading-none"> <span class="text-primary italic">Médiathèque Galerie</span></h1>
          <p class="text-background opacity-80 text-lg font-medium">Gérez vos contenus visuels avec une précision chirurgicale.</p>
        </div>
        <div class="flex items-center gap-4">

          <input ref="fileInput" type="file" class="hidden" multiple accept="video/*,image/*" @change="handleFileUpload" />
          <Button class="rounded-2xl h-14 px-8 bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/20 transition-all active:scale-95" @click="triggerFileInput">
            <Plus class="w-6 h-6 mr-2" />
            Importer
          </Button>
        </div>
      </div>
    </div>

    <div class="card p-2 flex items-center justify-between sticky top-0 z-30 bg-background/80 backdrop-blur-2xl py-4 border-y border-border/50">
      <div class="flex items-center gap-6">
        <div class="flex bg-secondary/50 p-1.5 rounded-2xl border border-border">
          <button v-for="t in ['all', 'image', 'video']" :key="t" @click="filterChange(t)"
            :class="['px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all', filterType === t ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:text-foreground']">
            {{ t === 'all' ? 'Tous' : t }}
          </button>
        </div>
      </div>

      <CompositionConfirmDialog v-if="showRemoveButton" header="Nettoyage de l'Eldorado" description="Êtes-vous sûr de vouloir supprimer ces actifs ?" @confirm="deleteSelectedItems" cancelText="Annuler" actionText="Supprimer">
        <template #dialogButton>
          <Button variant="destructive" class="rounded-xl px-6 font-black shadow-lg shadow-destructive/20 animate-in zoom-in">
            Nettoyer ({{ selectedItems.size }})
          </Button>
        </template>
      </CompositionConfirmDialog>
    </div>

    <div v-if="mediaList?.length" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
      <div v-for="item in mediaList" :key="item.id" class="group relative">
        <div class="card relative aspect-[3/4]  overflow-hidden  border-transparent bg-secondary shadow-sm transition-all duration-700 hover:shadow-xl hover:border-primary hover:-translate-y-2">
          <img v-if="item.type === 'image'" :src="item.file_path" class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
          <div v-else class="w-full h-full bg-slate-950 flex items-center justify-center">
            <video :src="item.file_path" class="w-full h-full object-cover opacity-60" muted />
          </div>

          <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 z-10">
            <div class="absolute top-6 left-6">
              <BaseCheckbox :checked="selectedItems.has(item.id)" @update:checked="(v:boolean) => toggleSelection(item.id, v)" class="w-6 h-6 rounded-lg border-2 border-white/50 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
            </div>
            <div class="absolute bottom-6 left-6 right-6 space-y-2">
              <p class="text-white font-black text-sm truncate uppercase tracking-widest">{{ item.alt || 'Sans titre' }}</p>
              <div class="flex gap-2">
                <CompositionVideoImageModal :type="item.type" :href="item.file_path" :alt="item.alt">
                  <template #trigger>
                    <button class="flex-1 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white py-2 rounded-xl text-[10px] font-black uppercase transition-all">Aperçu</button>
                  </template>
                </CompositionVideoImageModal>
                <button v-if="item.type === 'image'" @click="$router.push({ name: 'admin.media.update', params: { id: item.id } })" class="bg-primary text-white p-2 rounded-xl transition-all hover:scale-110"><Pencil class="w-4 h-4" /></button>
                <CompositionConfirmDialog @confirm="deleteSelectedItems(item.id)" header="Suppression de l'actif" description="Êtes-vous sûr de vouloir supprimer ce média ?" cancelText="Annuler" actionText="Supprimer" >
                  <template #dialogButton>
                    <button class="bg-destructive text-white p-2 rounded-xl transition-all hover:scale-110"><X class="w-4 h-4" /></button>
                  </template>
                </CompositionConfirmDialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <CompositionListEmpty v-else label="Aucun trésor trouvé dans votre galerie" />
  </div>
</template>
