<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { 
    Archive, 
    Check, 
    ChevronLeft, 
    ChevronRight, 
    FileText, 
    Layers, 
    Play, 
    Plus, 
    Search, 
    Trash2, 
    X,
    Image as ImageIcon,
    Pen,
    Eye,
    FolderOpen,
  } from 'lucide-vue-next'
  import { useCreateMedia, useDeleteMedia, useGetMediaList, useUpdateMedia } from '../../hook/media'
  import { showToast } from '../../lib/toast'
  import { getErrorMessage } from '../../lib/errorMessage'
  import CompositionLoading from '../../components/composition/CompositionLoading.vue'
  import CompositionError from '../../components/composition/CompositionError.vue'
  import { useHead } from '@vueuse/head'
  import Button from '@/components/ui/button/Button.vue'
  import Input from '@/components/ui/input/Input.vue'
  import type { Media } from '../../type/media'
  import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue'
  import CompositionVideoImageModal from '../../components/composition/CompositionVideoImageModal.vue'
import { usePermission } from '../../hook/usePermission'

  useHead({
    title: 'Médiathèque | Compositor',
    meta: [
      { name: 'description', content: 'Gérez vos actifs visuels avec précision sur la plateforme Compositor.' },
    ],
  })

  const { hasPermission } = usePermission();

  const selectedMediaId = ref<number | null>(null);
  const searchQuery = ref("");
  const debouncedSearch = ref(searchQuery);
  const filterType = ref("all");
  const currentPage = ref(1);
  const limit = ref(20);
  const fileInput = ref<HTMLElement | null>(null);
  const isEditingAlt = ref(false);
  const editedAlt = ref("");

  const filterOptions = [
    { label: 'Tous', value: 'all', icon: Layers },
    { label: 'Images', value: 'image', icon: ImageIcon },
    { label: 'Vidéos', value: 'video', icon: Play },
    { label: 'Documents', value: 'document', icon: FileText },
    { label: 'Archives', value: 'archive', icon: Archive },
  ]

  // Data
  const filterParams = computed(() => ({
    type: filterType.value === "all" ? undefined : [filterType.value as 'image' | 'video' | 'document' | 'archive'],
    page: currentPage.value,
    limit: limit.value,
    search: debouncedSearch.value || undefined
  }));

  const mediaQuery = useGetMediaList(filterParams);
  const mediaCreator = useCreateMedia();
  const mediaDeleter = useDeleteMedia();
  const mediaUpdater = useUpdateMedia();

  const mediaResults = computed(() => mediaQuery.data.value?.results || []);
  const totalItems = computed(() => mediaQuery.data.value?.count || 0);
  const totalPages = computed(() => Math.ceil(totalItems.value / limit.value));

  const selectedMedia = computed(() => 
    mediaResults.value.find(m => m.id === selectedMediaId.value) || null
  );

  // Watchers
  watch(selectedMedia, (newMedia) => {
    if (newMedia) {
      editedAlt.value = newMedia.alt || "";
      isEditingAlt.value = false;
    }
  });

  watch([currentPage, limit, filterType, debouncedSearch], () => {
    mediaQuery.refetch();
  });

  // Actions
  const handleSelectMedia = (media: Media) => {
    selectedMediaId.value = media.id;
  };

  const triggerFileInput = () => fileInput.value?.click();

  const handleFileUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const files = Array.from(input.files);
    try {
      const uploadPromises = files.map((file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('alt', file.name.split('.')[0] || 'Image sans titre'); // Default alt
        return mediaCreator.mutateAsync(formData);
      });
      await Promise.all(uploadPromises);
      await mediaQuery.refetch();
      showToast('success', 'Médias importés avec succès');
    } catch (error) {
      showToast('error', getErrorMessage(error));
    }
  };

  const deleteMedia = async (id: number) => {
    mediaDeleter.mutate(id, {
      onSuccess: () => {
        if (selectedMediaId.value === id) selectedMediaId.value = null;
        mediaQuery.refetch();
        showToast('success', 'Média supprimé');
      }
    });
  };

  const updateAltText = () => {
    if (!selectedMediaId.value) return;
    mediaUpdater.mutate({
      mediaId: selectedMediaId.value,
      payload: {
        operations: {
          metadata: { alt: editedAlt.value }
        }
      }
    }, {
      onSuccess: () => {
        isEditingAlt.value = false;
        mediaQuery.refetch();
        showToast('success', 'Texte alternatif mis à jour');
      },
      onError: (error) => {
        showToast('error', getErrorMessage(error));
      }
    });
  };

  // Helpers
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

</script>

<template>
  <div class="h-full flex flex-col space-y-8">
    <CompositionPageHeader>
      <template #content>
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="p-3 bg-primary rounded-2xl">
              <FolderOpen stroke-width="1" class="w-8 h-8"/>
            </div>
            <div>
              <h1 class="text-3xl font-black tracking-tighter leading-none">
                <span class="text-primary italic">Médiathèque</span> Galerie
              </h1>
              <p class="text-muted-foreground text-sm font-medium mt-1 italic">Gérez vos contenus avec une précision chirurgicale.</p>
            </div>
          </div>
          
          <div v-if="hasPermission(['upload_media'])" class="flex items-center gap-3">
            <input ref="fileInput" type="file" class="hidden" multiple @change="handleFileUpload" />
            <Button class="rounded-xl h-12 px-6 bg-primary text-white font-bold shadow-lg shadow-primary/20 transition-all active:scale-95" @click="triggerFileInput">
              <Plus class="w-5 h-5 mr-2" /> Importer
            </Button>
          </div>
        </div>
      </template>
    </CompositionPageHeader>

    <div class="flex-1 flex flex-col card rounded-none overflow-hidden">
      <div class="p-4 border-b border-border bg-background backdrop-blur-md z-30">
        <div class="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div class="flex items-center bg-muted p-1 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar custom-scrollbar">
            <button 
              v-for="opt in filterOptions" 
              :key="opt.value"
              @click="filterType = opt.value"
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap"
              :class="filterType === opt.value ? 'bg-primary shadow-sm text-white' : 'text-muted-foreground hover:text-foreground'"
            >
              <component :is="opt.icon" class="w-3.5 h-3.5" />
              {{ opt.label }}
            </button>
          </div>

          <div class="relative w-full sm:w-64">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              v-model="searchQuery" 
              placeholder="Rechercher..." 
              class="input-custom pl-10"
            />
          </div>
        </div>
      </div>

      <div class="flex-1 flex overflow-hidden relative">
        
        <main class="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-muted-foreground custom-scrollbar">
          <CompositionLoading v-if="mediaQuery.isLoading.value && !mediaQuery.data.value" />
          <CompositionError v-else-if="mediaQuery.isError.value" :error="mediaQuery.error.value?.message" />
          
          <div v-else>
            <div v-if="mediaResults.length === 0" class="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <Layers class="w-12 h-12 mb-4 opacity-10" />
              <p class="font-medium">Aucun média trouvé</p>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
              <div 
                v-for="media in mediaResults" 
                :key="media.id"
                @click="handleSelectMedia(media)"
                class="group relative aspect-square overflow-hidden cursor-pointer"
                :class="selectedMediaId === media.id ? 'ring-1 ring-primary ring-offset-2 scale-[0.95] shadow-inner' : 'hover:shadow-xl hover:-translate-y-1 bg-muted'"
              >
                <img v-if="media.type === 'image'" :src="media.file_path" class="w-full h-full object-cover" loading="lazy" />
                <div v-else-if="media.type === 'video'" class="w-full h-full bg-slate-900 flex items-center justify-center relative">
                  <video :src="media.file_path" muted class="w-full h-full object-cover opacity-50" />
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="p-2 bg-white/20 backdrop-blur-md rounded-full"><Play class="w-6 h-6 text-white fill-current" /></div>
                  </div>
                </div>
                <div v-else class="w-full h-full flex items-center justify-center">
                  <component :is="media.type === 'document' ? FileText : Archive" class="w-10 h-10 text-muted-foreground/40" />
                </div>

                <div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p class="text-white text-[10px] truncate font-bold">{{ media.alt || media.file_path }}</p>
                </div>

                <div v-if="selectedMediaId === media.id" class="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-lg animate-in zoom-in">
                  <Check class="w-3 h-3 stroke-[4px]" />
                </div>
              </div>
            </div>

            <div v-if="totalPages > 1" class="flex justify-center mt-12 mb-6 gap-2">
              <Button variant="outline" size="icon" :disabled="currentPage === 1" @click="currentPage--" class="rounded-xl h-10 w-10">
                <ChevronLeft class="w-4 h-4" />
              </Button>
              <div class="flex items-center px-6 bg-muted/50 rounded-xl font-bold text-xs uppercase tracking-widest">
                Page {{ currentPage }} / {{ totalPages }}
              </div>
              <Button variant="outline" size="icon" :disabled="currentPage === totalPages" @click="currentPage++" class="rounded-xl h-10 w-10">
                <ChevronRight class="w-4 h-4" />
              </Button>
            </div>
          </div>
        </main>

        <aside 
          class="h-full border-l border-border bg-muted backdrop-blur-sm flex flex-col overflow-hidden shrink-0 "
          :class="selectedMediaId ? 'w-80 opacity-100' : 'w-0 opacity-0 border-none'"
        >
          <div v-if="selectedMedia" class="w-80 flex flex-col h-full overflow-y-auto p-6 space-y-4 custom-scrollbar">
            <div class="flex items-center justify-between">
              <h2 class="text-xs font-black text-muted-foreground">Détails de l'actif</h2>
              <button @click="selectedMediaId = null" class="p-2 hover:bg-background transition-colors">
                <X class="w-4 h-4 text-muted-foreground" />
              </button>
            </div>



            <div v-if="selectedMedia.type=='image'" class="grid gap-3">
              <div  v-for="(val, label) in { 'Format': selectedMedia.type, 'Poids': formatFileSize(selectedMedia.size), 'Dimension': `${selectedMedia.width || '?'}x${selectedMedia.height || '?'}`, 'Date de création': formatDate(selectedMedia.createdAt as unknown as string) }" :key="label" class="flex items-center justify-between p-3 bg-background border border-border">
                <span class="text-[10px] font-bold text-muted-foreground">{{ label }}</span>
                <span class="text-xs font-black">{{ val }}</span>
              </div>
            </div>

            <div v-else-if="selectedMedia.type=='video'" class="grid gap-3">
              <div  v-for="(val, label) in { 'Format': selectedMedia.type, 'Poids': formatFileSize(selectedMedia.size), 'Durée': `${selectedMedia.duration || '?'}s`, 'Date de création': formatDate(selectedMedia.createdAt as unknown as string) }" :key="label" class="flex items-center justify-between p-3 bg-background border border-border">
                <span class="text-[10px] font-bold text-muted-foreground">{{ label }}</span>
                <span class="text-xs font-black">{{ val }}</span>
              </div>
            </div>

            <div v-else-if="selectedMedia.type=='document'" class="grid gap-3">
              <div  v-for="(val, label) in { 'Format': selectedMedia.type, 'Poids': formatFileSize(selectedMedia.size), 'Nbre pages': selectedMedia.pageCount, 'Date de création': formatDate(selectedMedia.createdAt as unknown as string) }" :key="label" class="flex items-center justify-between p-3 bg-background border border-border">
                <span class="text-[10px] font-bold text-muted-foreground">{{ label }}</span>
                <span class="text-xs font-black">{{ val }}</span>
              </div>
            </div>

            <div v-else class="grid gap-3">
              <div  v-for="(val, label) in { 'Format': selectedMedia.type, 'Poids': formatFileSize(selectedMedia.size), 'Date de création': formatDate(selectedMedia.createdAt as unknown as string) }" :key="label" class="flex items-center justify-between p-3 bg-background border border-border">
                <span class="text-[10px] font-bold text-muted-foreground">{{ label }}</span>
                <span class="text-xs font-black">{{ val }}</span>
              </div>
            </div>

            <div v-if="hasPermission(['update_media'])" class="space-y-3 pt-2">
              <label class="text-[10px] font-black text-muted-foreground px-1">Accessibilité (ALT)</label>
              <textarea 
                v-model="editedAlt" 
                rows="4"
                @focus="isEditingAlt = true"
                class="w-full input-custom bg-background"
                placeholder="Décrivez ce média..."
              ></textarea>
              
              <div v-if="isEditingAlt" class="flex gap-2 animate-in slide-in-from-top-2 duration-300">
                <Button class="flex-1 font-bold text-white" @click="updateAltText" :loading="mediaUpdater.isPending.value">Enregistrer</Button>
                <Button variant="ghost" class="font-bold"  @click="isEditingAlt = false; editedAlt = selectedMedia?.alt || ''">Annuler</Button>
              </div>
            </div>

            <div class="flex gap-2 pt-6 mt-auto  border-t border-border">
              <Button @click="$router.push({ name: 'admin.media.update', params: { id: selectedMedia.id } })" v-if="selectedMedia.type=='image'" variant="ghost" class="w-full justify-start rounded-xl text-primary hover:bg-primary/10 font-bold gap-3" >
                <Pen class="w-4 h-4" /> Modifier
              </Button>
              <CompositionVideoImageModal v-else :type="selectedMedia.type" :href="selectedMedia.file_path" :alt="selectedMedia.alt">
                <template #trigger>
                  <Button variant="ghost" class="w-full justify-start rounded-xl text-primary hover:bg-primary/10 font-bold gap-3">
                    <Eye class="w-4 h-4" /> Visualiser
                  </Button>
                </template>
              </CompositionVideoImageModal>
              <Button v-if="hasPermission(['delete_media'])" variant="ghost" class="w-full justify-start rounded-xl text-destructive hover:bg-destructive/10 font-bold gap-3" @click="deleteMedia(selectedMedia.id)">
                <Trash2 class="w-4 h-4" /> Supprimer
              </Button>
              
            </div>
            <div v-if="selectedMedia.type=='image'" class=" flex justify-center mt-auto ">
              <CompositionVideoImageModal :type="selectedMedia.type" :href="selectedMedia.file_path" :alt="selectedMedia.alt">
                <template #trigger>
                  <Button variant="ghost" class="w-full rounded-xl text-primary hover:bg-primary/10 font-bold gap-3">
                    <Eye class="w-4 h-4" /> Visualiser
                  </Button>
                </template>
              </CompositionVideoImageModal>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>
