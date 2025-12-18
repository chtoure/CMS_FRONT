<script setup lang="ts">
import { ref, watchEffect } from "vue"

import { Plus, Pencil, X } from "lucide-vue-next"
import Button from "@/components/ui/button/Button.vue"
import Select from "@/components/ui/select/Select.vue"
import SelectTrigger from "@/components/ui/select/SelectTrigger.vue"
import SelectValue from "@/components/ui/select/SelectValue.vue"
import SelectContent from "@/components/ui/select/SelectContent.vue"
import SelectItem from "@/components/ui/select/SelectItem.vue"

import BaseCheckbox from "@/components/base/BaseCheckbox.vue"
import CompositionConfirmDialog from "@/components/composition/CompositionConfirmDialog.vue"
import { showToast } from "../../lib/toast"
import type { Media } from "../../type/media"

const mockMediaItems: Media[] = [
  { id: 1, file_path: "https://picsum.photos/400/300?random=1", type: "image", alt: null },
  { id: 2, file_path: "https://picsum.photos/400/300?random=2", type: "image", alt: null },
  { id: 3, file_path: "https://picsum.photos/400/300?random=3", type: "image", alt: null },
  { id: 4, file_path: "https://picsum.photos/400/300?random=4", type: "image", alt: null },
  { id: 5, file_path: "https://picsum.photos/400/300?random=5", type: "image", alt: null },
  { id: 6, file_path: "https://picsum.photos/400/300?random=6", type: "image", alt: null },
  { id: 7, file_path: "https://picsum.photos/400/300?random=7", type: "image", alt: null },
  { id: 8, file_path: "https://picsum.photos/400/300?random=8", type: "image", alt: null },
  { id: 9, file_path: "https://picsum.photos/400/300?random=9", type: "image", alt: null },
  { id: 10, file_path: "https://picsum.photos/400/300?random=10", type: "image", alt: null },
  { id: 11, file_path: "https://picsum.photos/400/300?random=11", type: "image", alt: null },
  { id: 12, file_path: "https://picsum.photos/400/300?random=12", type: "image", alt: null },
]

const selectedItems = ref<Set<number>>(new Set());

  const showRemoveButton = ref(false);
  const fileInput=ref<HTMLElement | null>(null);

  watchEffect(() => {
    console.log("Selected items:", Array.from(selectedItems.value));
  });


  const deleteSelectedItems = (id?:number) => {
    if (id) {
      console.log("Deleting item:", id);
    }else{
      console.log("Deleting items:", Array.from(selectedItems.value));
    }
    showToast('success', 'Données supprimées avec succès!')
  }

  const toggleSelection = (id: number, checked: boolean) => {
    console.log("Clicked:", id, checked)

    const next = new Set(selectedItems.value)

    if (checked) {
      next.add(id)
    } else {
      next.delete(id)
    }

    selectedItems.value = next

    if (selectedItems.value.size>0) {
      showRemoveButton.value = true;
    } else {
      showRemoveButton.value = false;
    }
  }

  const triggerFileInput=()=>{
    fileInput.value?.click();
  }

  const handleFileUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;

    if (!input.files) return ;

    const files = Array.from(input.files);

    for (const file of files) {
      const formData = new FormData();
      const type = file.type.startsWith('image/*') ? 'image' : 'video';
      formData.append('file', file);
      formData.append('type', type);
      formData.append('alt', file.name);
    }

    console.log("Uploaded files:", files);
    showToast('success', 'Fichiers téléchargés avec succès!')
  }

</script>

<template>
  <div class="min-h-screen ">
    <div class=" pb-6">
      <div class="flex items-center justify-end">
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          multiple
          accept="video/*,image/*"
          @change="handleFileUpload"
        />
        <Button
          class="text-background"
          @click="triggerFileInput"
        >
          <Plus class="w-4 h-4 mr-2" />
          Ajouter media
        </Button>
      </div>
    </div>

    <div class="">
      <div class="bg-background/10 rounded-lg border border-border p-6">
        <div class="mb-4">
          <label class="text-xs font-semibold text-text mb-2 block">Trier</label>
          <div class="grid grid-cols-1 sm:grid-auto-columns sm:flex gap-2">
            <div class="max-w-xs">
              <Select default-value="newest">
                <SelectTrigger class="w-full border-border">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Tous</SelectItem>
                  <SelectItem value="oldest">Images</SelectItem>
                  <SelectItem value="name">Videos</SelectItem>
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
                <Button variant="destructive">
                  Supprimer ({{ selectedItems.size }})
                </Button>
              </template>
            </CompositionConfirmDialog>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <div v-for="item in mockMediaItems" :key="item.id" class="group relative">
            <div class="aspect-[4/3] overflow-hidden relative card">
              <div class="absolute bottom-2 left-2 z-10 text-text">
                <BaseCheckbox
                  :checked="selectedItems.has(item.id)"
                  @update:checked="(val:boolean) => toggleSelection(item.id, val)"
                />

              </div>

              <div class="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button class="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
                  <Pencil class="w-4 h-4 text-gray-700" />
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
                      class="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-destructive transition-colors"
                    >
                      <X class="w-4 h-4 text-gray-700" />
                    </button>
                  </template>
                </CompositionConfirmDialog>
              </div>

              <img
                :src="item.file_path || '/placeholder.svg'"
                :alt="item.alt || 'Media Image'"
                class="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
