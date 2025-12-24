<script setup lang="ts">
  import { ref, computed } from "vue"

  import { Plus, Pencil, X, Eye } from "lucide-vue-next"
  import Button from "@/components/ui/button/Button.vue"
  import Select from "@/components/ui/select/Select.vue"
  import SelectTrigger from "@/components/ui/select/SelectTrigger.vue"
  import SelectValue from "@/components/ui/select/SelectValue.vue"
  import SelectContent from "@/components/ui/select/SelectContent.vue"
  import SelectItem from "@/components/ui/select/SelectItem.vue"

  import BaseCheckbox from "@/components/base/BaseCheckbox.vue"
  import CompositionConfirmDialog from "@/components/composition/CompositionConfirmDialog.vue"
  import { showToast } from "../../lib/toast"
  import { useCreateMedia, useDeleteMedia, useGetMediaList } from "../../hook/media"
  import CompositionLoading from "@/components/composition/CompositionLoading.vue"
  import CompositionError from "@/components/composition/CompositionError.vue"
  import CompositionVideoImageModal from "@/components/composition/CompositionVideoImageModal.vue"
import CompositionListEmpty from "../../components/composition/CompositionListEmpty.vue"

  const filterType = ref("all");

  const {
    mutateAsync: createMediaAsync,
    isError: isCreateMediaError,
    isPending: isCreateMediaLoading,
    error: createMediaError
  } = useCreateMedia();

  const {
    mutate: deleteMedia,
    isPending: isDeleteMediaLoading,
  } = useDeleteMedia();

  const filterParams = computed(() => ({
    type: filterType.value === "all" ? undefined : filterType.value as "image" | "video"
  }));

  const {
    data: mediaList,
    isLoading: isMediaListLoading,
    isError: isMediaListError,
    error: mediaListError,
    refetch: refreshMediaList
  } = useGetMediaList(filterParams);

  const filterChange = (val: string) => {
    filterType.value = val;
  }

  const selectedItems = ref<Set<number>>(new Set());
  const showRemoveButton = ref(false);
  const fileInput = ref<HTMLElement | null>(null);



  const deleteSelectedItems = (id?: number) => {
    const payload = id ? id : Array.from(selectedItems.value);

    deleteMedia(payload, {
      onSuccess: async () => {
        await refreshMediaList();
        
        if (!id) {
          selectedItems.value.clear();
          showRemoveButton.value = false;
        }
        
        showToast('success', 'Données supprimées avec succès!');
      },
      onError: (error: Error) => {
        showToast('error', `Erreur lors de la suppression: ${error.message}`);
      }
    });
  }

  const toggleSelection = (id: number, checked: boolean) => {
    console.log("Clicked:", id, checked);

    const next = new Set(selectedItems.value);

    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }

    selectedItems.value = next;

    if (selectedItems.value.size > 0) {
      showRemoveButton.value = true;
    } else {
      showRemoveButton.value = false;
    }
  }

  const triggerFileInput = () => {
    fileInput.value?.click();
  }

  const handleFileUpload = async (event: Event) => {
    const input = event.target as HTMLInputElement;

    if (!input.files) return;

    const files = Array.from(input.files);

    try {

      const uploadFile= files.map((file)=>{
        const formData = new FormData();
        formData.append('file', file);
        formData.append('alt', file.name);
        return createMediaAsync(formData);
      })

      await Promise.all(uploadFile);

      await refreshMediaList();
      showToast('success', 'Données supprimées avec succès!');
      
    } catch (error) {
      showToast('error', `Erreur lors de la suppression: ${error}`);
    }

  }

</script>

<template>
  <CompositionLoading v-if="isCreateMediaLoading || isMediaListLoading || isDeleteMediaLoading" />

  <CompositionError 
    v-else-if="isCreateMediaError || isMediaListError" 
    :error="isCreateMediaError ? createMediaError?.message : mediaListError?.message"
  />

  <div v-else class="p-6">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold text-foreground mb-1">Médiathèque</h1>
          <p class="text-[13px] text-muted-foreground">Gérez vos images et vidéos</p>
        </div>
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          multiple
          accept="video/*,image/*"
          @change="handleFileUpload"
        />
        <Button
          size="sm"
          class="text-primary-foreground"
          @click="triggerFileInput"
        >
          <Plus class="w-4 h-4" />
          Ajouter media
        </Button>
      </div>
    </div>

    <div class="">
      <div class="mb-4">
        <label class="text-[11px] font-semibold text-text uppercase tracking-wide mb-2 block">Filtrer</label>
        <div class="flex gap-2">
          <div class="w-40">
            <Select :default-value="filterType" @update:modelValue="filterChange">
              <SelectTrigger class="h-8 text-[13px] !border-border bg-input">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CompositionConfirmDialog
            v-if="showRemoveButton"
            header="Confirmer la suppresion"
            description="Êtes-vous sûr de vouloir supprimer les éléments sélectionnés ? Cette action est irréversible."
            cancelText="Annuler"
            actionText="Supprimer"
            @confirm="deleteSelectedItems"
          >
            <template #dialogButton>
              <Button size="sm" variant="destructive">
                Supprimer ({{ selectedItems.size }})
              </Button>
            </template>
          </CompositionConfirmDialog>
        </div>
      </div>

      <CompositionListEmpty v-if="!mediaList?.length" label="Aucune donnée trouvée" />

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        <div v-for="item in mediaList" :key="item.id" class="group relative">
          <div class="aspect-square overflow-hidden relative rounded-lg border border-border bg-muted hover:border-primary/50 transition-all">
            <div class="absolute bottom-2 left-2 z-10">
              <BaseCheckbox
                :checked="selectedItems.has(item.id)"
                @update:checked="(val: boolean) => toggleSelection(item.id, val)"
              />
            </div>

            <div class="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <CompositionVideoImageModal :type="item.type" :href="item.file_path" :alt="item.alt">
                <template #trigger>

                  <button
                    class="group/btn w-7 h-7 bg-background rounded-md flex items-center justify-center shadow-sm hover:bg-muted transition-colors border border-border">
                    <Eye class="w-3.5 h-3.5 text-muted-foreground group-hover/btn:text-foreground" />
                  </button>

                </template>

              </CompositionVideoImageModal>

              <button
                v-if="item.type === 'image'"
                class="group/btn w-7 h-7 bg-background rounded-md flex items-center justify-center shadow-sm hover:bg-muted transition-colors border border-border"
                @click="$router.push({ name: 'admin.media.update', params: { id: item.id } })">
                <Pencil class="w-3.5 h-3.5 text-muted-foreground group-hover/btn:text-foreground" />
              </button>
              <CompositionConfirmDialog
                :header="'Confirmer la suppresion'"
                :description="'Êtes-vous sûr de vouloir supprimer ? Cette action est irréversible.'"
                :cancelText="'Annuler'"
                :actionText="'Supprimer'"
                @confirm="() => deleteSelectedItems(item.id)"
              >
                <template #dialogButton>
                  <button
                    class="group/btn w-7 h-7 bg-background rounded-md flex items-center justify-center shadow-sm hover:bg-destructive transition-colors border border-border hover:border-destructive"
                  >
                    <X class="w-3.5 h-3.5 text-muted-foreground group-hover/btn:text-destructive-foreground" />
                  </button>
                </template>
              </CompositionConfirmDialog>
            </div>

            <img
              v-if="item.type === 'image'"
              :src="item.file_path || '/placeholder.svg'"
              :alt="item.alt || 'Media Image'"
              class="w-full h-full object-cover"
            />
            <video
              v-else
              :src="item.file_path || '/placeholder.svg'"
              :alt="item.alt || 'Media Image'"
              class="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
