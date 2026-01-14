<script setup lang="ts">
import CompositionModal from './CompositionModal.vue'
import { ref, computed, watch } from 'vue'
import { useGetMediaList, useCreateMedia } from '../../hook/media'
import Tabs from '@/components/ui/tabs/Tabs.vue'
import TabsContent from '@/components/ui/tabs/TabsContent.vue'
import TabsList from '@/components/ui/tabs/TabsList.vue'
import TabsTrigger from '@/components/ui/tabs/TabsTrigger.vue'
import Button from '@/components/ui/button/Button.vue'
import { Upload, Check, Loader2, Image as ImageIcon, FileVideo } from 'lucide-vue-next'
import { showToast } from '../../lib/toast'
import { getErrorMessage } from '../../lib/errorMessage'
import CompositionLoading from './CompositionLoading.vue'
import CompositionError from './CompositionError.vue'
import CompositionListEmpty from './CompositionListEmpty.vue'
import type { Media } from '../../type/media'


const props = withDefaults(defineProps<{
  modelValue?: number | number[] | null
  triggerText?: string
  multiple?: boolean
  allowedTypes?: ('image' | 'video')[]
}>(), {
  multiple: false
})

const emit = defineEmits(['update:modelValue', 'change'])

const open = ref(false)
const activeTab = ref('library')
const searchQuery = ref('')
const selectedMediaIds = ref<number | number[] | undefined>(props.modelValue || undefined)

const page = ref(1)
const limit = ref(20)
const filterParams = computed(() => ({
  page: page.value,
  limit: limit.value,
  search: searchQuery.value,
  type: props.allowedTypes && props.allowedTypes.length === 1 ? props.allowedTypes[0] : undefined
}))

const { data: mediaData, isLoading, isError, error, refetch } = useGetMediaList(filterParams)

const mediaList = computed(() => mediaData.value?.results || [])
const total = computed(() => mediaData.value?.count || 0)

// Upload Logic
const { mutateAsync: uploadMedia, isPending: isUploading } = useCreateMedia()
const fileInput = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)

const triggerFileInput = () => fileInput.value?.click()

const handleFileUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files?.length) return
  await processFiles(Array.from(input.files))
}

const onDrop = async (e: DragEvent) => {
  isDragging.value = false
  if (!e.dataTransfer?.files?.length) return
  await processFiles(Array.from(e.dataTransfer.files))
}

const processFiles = async (files: File[]) => {
  try {
    for (const file of files) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('alt', file.name)
      await uploadMedia(formData)
    }
    showToast('success', 'Médias importés avec succès')
    await refetch()
    activeTab.value = 'library'
  } catch (err) {
    showToast('error', getErrorMessage(err))
  }
}

// Selection Logic
const selectMedia = (media: Media) => {
  if (props.multiple) {
    const current = Array.isArray(selectedMediaIds.value) ? [...selectedMediaIds.value] : []
    const index = current.indexOf(media.id)
    if (index === -1) {
      current.push(media.id)
    } else {
      current.splice(index, 1)
    }
    selectedMediaIds.value = current
  } else {
    // Toggle logic for single selection
    if (selectedMediaIds.value === media.id) {
        selectedMediaIds.value = undefined
    } else {
        selectedMediaIds.value = media.id
    }
  }
}

const confirmSelection = () => {
    // Check if selection is valid
    const hasSelection = props.multiple
      ? Array.isArray(selectedMediaIds.value) && selectedMediaIds.value.length > 0
      : selectedMediaIds.value !== undefined && selectedMediaIds.value !== null

    if (hasSelection) {
      emit('update:modelValue', selectedMediaIds.value)
      emit('change', selectedMediaIds.value)
      open.value = false
    }
}

watch(() => props.modelValue, (val) => {
  selectedMediaIds.value = val !== null ? val : undefined
})

const selectedMedia = computed(() => {
    if (props.multiple) {
        if (Array.isArray(selectedMediaIds.value) && selectedMediaIds.value.length > 0) {
            // For multiple, maybe just show count or first few?
            // Let's modify the template to handle this separately
            return selectedMediaIds.value.map(id => mediaList.value.find(m => m.id === id)).filter(Boolean) as Media[]
        }
        return []
    }
    return mediaList.value.find(m => m.id === selectedMediaIds.value)
})

</script>

<template>
  <CompositionModal v-model:open="open" :title="'Médiathèque'" description="Sélectionnez ou téléversez un média">
    <template #trigger>
      <slot name="trigger">
         <Button variant="outline" class="justify-start text-left font-normal" @click="open = true">
            <template v-if="!multiple && selectedMedia && !Array.isArray(selectedMedia)">
                <img v-if="selectedMedia.type === 'image'" :src="selectedMedia.file_path" class="h-6 w-6 mr-2 object-cover rounded-sm" />
                <FileVideo v-else class="h-4 w-4 mr-2" />
                {{ selectedMedia.alt }}
            </template>
            <template v-else-if="multiple && Array.isArray(selectedMedia) && selectedMedia.length > 0">
                 <span class="flex items-center gap-2">
                    <span v-for="media in selectedMedia.slice(0, 3)" :key="media.id" class="relative">
                         <img v-if="media.type === 'image'" :src="media.file_path" class="h-6 w-6 object-cover rounded-sm border border-border" />
                         <FileVideo v-else class="h-4 w-4" />
                    </span>
                    <span v-if="selectedMedia.length > 3" class="text-xs text-muted-foreground">+{{ selectedMedia.length - 3 }}</span>
                     <span class="ml-2">{{ selectedMedia.length }} sélectionné(s)</span>
                 </span>
            </template>
            <span v-else>{{ triggerText || 'Sélectionner...' }}</span>
         </Button>
      </slot>
    </template>

    <template #content>
      <div class="flex flex-col w-[800px] max-w-full">
          <Tabs v-model="activeTab" class="flex-1 flex flex-col">
            <div class="px-0 pb-4">
                <TabsList class="grid w-full grid-cols-2 gap-2">
                    <TabsTrigger value="upload" variant="outline" class="h-10 bg-border text-text data-[state=active]:bg-primary data-[state=active]:text-white">Téléverser des fichiers</TabsTrigger>
                    <TabsTrigger value="library" variant="outline" class="h-10 bg-border text-text data-[state=active]:bg-primary data-[state=active]:text-white">Médiathèque</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="upload" class="p-8 mt-0">
                <div
                    class="w-full h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center p-10 transition-colors"
                    :class="isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'"
                    @dragover.prevent="isDragging = true"
                    @dragleave.prevent="isDragging = false"
                    @drop.prevent="onDrop"
                >
                    <Upload class="h-10 w-10 text-muted-foreground mb-4" />
                    <h3 class="text-lg font-semibold mb-1">Déposez vos fichiers pour les téléverser</h3>
                    <p class="text-sm text-muted-foreground mb-6">ou</p>
                    <input ref="fileInput" type="file" class="hidden" multiple accept="image/*,video/*" @change="handleFileUpload" />
                    <Button variant="outline" @click="triggerFileInput" :disabled="isUploading">
                        <Loader2 v-if="isUploading" class="mr-2 h-4 w-4 animate-spin" />
                        {{ isUploading ? 'Téléversement...' : 'Sélectionnez des fichiers' }}
                    </Button>
                    <p class="text-xs text-muted-foreground mt-4">Taille de fichier maximale pour le téléversement : 5 Mo.</p>
                </div>
            </TabsContent>

            <TabsContent value="library" class="flex-1 flex flex-col mt-0 h-full overflow-hidden px-2">
                <!-- <div class="py-4 flex gap-2">
                     <div class="relative">
                        <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input v-model="searchQuery" placeholder="Rechercher des médias..." class="pl-8 input-custom" />
                    </div>
                </div> -->

                <div class="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2">
                    <CompositionLoading v-if="isLoading" />
                    <CompositionError v-else-if="isError" :error="getErrorMessage(error)" />

                    <CompositionListEmpty v-else-if="mediaList.length === 0" title="Médiathèque" description="Aucun média trouvé" :icon="ImageIcon" />
                    <div v-else class="grid grid-cols-2 small:grid-cols-3 md:grid-cols-4 gap-4">
                        <div
                            v-for="item in mediaList"
                            :key="item.id"
                            class="group relative aspect-square border border-border overflow-hidden cursor-pointer transition-all"
                            @click="selectMedia(item)"
                        >
                            <img
                                v-if="item.type === 'image'"
                                :src="item.file_path"
                                :alt="item.alt || 'image'"
                                class="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                            <video
                                v-else
                                :src="item.file_path"
                                autoplay
                                loop
                                muted
                                class="w-full h-full object-cover"
                            />

                            <div v-if="multiple ? Array.isArray(selectedMediaIds) && selectedMediaIds.includes(item.id) : selectedMediaIds === item.id" class="absolute inset-0 flex items-center justify-center bg-black/40">
                                <Check class="h-8 w-8 text-primary drop-shadow-md" />
                            </div>
                             <div class="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-[10px] text-white truncate px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {{ item.alt }}
                            </div>
                        </div>
                    </div>
                </div>

                 <div class="pt-4 flex justify-between items-center bg-background z-10">
                    <span class="text-sm text-muted-foreground" v-if="total > 0">
                        {{ mediaList.length }} sur {{ total }} médias
                    </span>
                    <Button @click="confirmSelection" :disabled="multiple ? !(Array.isArray(selectedMediaIds) && selectedMediaIds.length > 0) : !selectedMediaIds" size="sm" class="text-white">
                        Sélectionner
                    </Button>
                </div>
            </TabsContent>
          </Tabs>
      </div>
    </template>
  </CompositionModal>
</template>
