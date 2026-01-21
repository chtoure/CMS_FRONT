<script setup lang="ts">
import CompositionModal from './CompositionModal.vue'
import { ref, computed, watch } from 'vue'
import { useGetMediaList, useCreateMedia } from '../../hook/media'
import Tabs from '@/components/ui/tabs/Tabs.vue'
import TabsContent from '@/components/ui/tabs/TabsContent.vue'
import TabsList from '@/components/ui/tabs/TabsList.vue'
import TabsTrigger from '@/components/ui/tabs/TabsTrigger.vue'
import Button from '@/components/ui/button/Button.vue'
import { Upload, Check, Loader2, Image as ImageIcon, FileVideo, FileText, Archive, File } from 'lucide-vue-next'
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
  allowedTypes?: ('image' | 'video' | 'document' | 'archive')[]
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
    selectedMediaIds.value = selectedMediaIds.value === media.id ? undefined : media.id
  }
}

const confirmSelection = () => {
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
            return selectedMediaIds.value.map(id => mediaList.value.find(m => m.id === id)).filter(Boolean) as Media[]
        }
        return []
    }
    return mediaList.value.find(m => m.id === selectedMediaIds.value)
})

</script>

<template>
  <CompositionModal v-model:open="open" title="Médiathèque" description="Sélectionnez ou téléversez un média">
    <template #trigger>
      <slot name="trigger">
         <Button variant="outline" class="justify-start text-left font-normal min-w-[200px]" @click="open = true">
            <template v-if="!multiple && selectedMedia && !Array.isArray(selectedMedia)">
                <img v-if="selectedMedia.type === 'image'" :src="selectedMedia.file_path" class="h-6 w-6 mr-2 object-cover rounded-sm" />
                <FileVideo v-else-if="selectedMedia.type === 'video'" class="h-4 w-4 mr-2 text-primary" />
                <FileText v-else-if="selectedMedia.type === 'document'" class="h-4 w-4 mr-2 text-blue-500" />
                <Archive v-else-if="selectedMedia.type === 'archive'" class="h-4 w-4 mr-2 text-amber-500" />
                <span class="truncate">{{ selectedMedia.alt }}</span>
            </template>
            <template v-else-if="multiple && Array.isArray(selectedMedia) && selectedMedia.length > 0">
                 <span class="flex items-center gap-2">
                    <span v-for="media in selectedMedia.slice(0, 3)" :key="media.id" class="relative">
                         <img v-if="media.type === 'image'" :src="media.file_path" class="h-6 w-6 object-cover rounded-sm border border-border" />
                         <FileVideo v-else-if="media.type === 'video'" class="h-4 w-4 text-primary" />
                         <FileText v-else-if="media.type === 'document'" class="h-4 w-4 text-blue-500" />
                         <Archive v-else-if="media.type === 'archive'" class="h-4 w-4 text-amber-500" />
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
      <div class="flex flex-col w-[850px] max-w-full h-[600px]">
          <Tabs v-model="activeTab" class="flex-1 flex flex-col overflow-hidden">
            <div class="px-6 py-4">
                <TabsList class="grid w-full grid-cols-2 gap-2 ">
                    <TabsTrigger value="upload" variant="outline" class="h-10 bg-border text-text data-[state=active]:bg-primary data-[state=active]:text-white">Téléverser des fichiers</TabsTrigger>
                    <TabsTrigger value="library" variant="outline" class="h-10 bg-border text-text data-[state=active]:bg-primary data-[state=active]:text-white">Médiathèque</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="upload" class="flex-1 p-6 mt-0">
                <div
                    class="w-full h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-10 transition-all"
                    :class="isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'"
                    @dragover.prevent="isDragging = true"
                    @dragleave.prevent="isDragging = false"
                    @drop.prevent="onDrop"
                >
                    <div class="bg-primary/10 p-4 rounded-full mb-4">
                        <Upload class="h-8 w-8 text-primary" />
                    </div>
                    <h3 class="text-lg font-semibold mb-1">Déposez vos fichiers ici</h3>
                    <p class="text-sm text-muted-foreground mb-6 max-w-[300px]">
                      Images, Vidéos, Documents (PDF, Word) ou Archives (ZIP, RAR)
                    </p>

                    <input ref="fileInput" type="file" class="hidden" multiple
                           accept="image/*,video/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip,application/x-zip-compressed,application/x-rar-compressed"
                           @change="handleFileUpload" />

                    <Button @click="triggerFileInput" :disabled="isUploading" class="px-8">
                        <Loader2 v-if="isUploading" class="mr-2 h-4 w-4 animate-spin" />
                        {{ isUploading ? 'Téléversement...' : 'Parcourir les fichiers' }}
                    </Button>
                    <p class="text-xs text-muted-foreground mt-4">Taille maximale recommandée : 10 Mo par fichier.</p>
                </div>
            </TabsContent>

            <TabsContent value="library" class="flex-1 flex flex-col mt-0 overflow-hidden px-6 pb-6">
                <div class="flex-1 overflow-y-auto custom-scrollbar pr-2 py-2">
                    <CompositionLoading v-if="isLoading" />
                    <CompositionError v-else-if="isError" :error="getErrorMessage(error)" />
                    <CompositionListEmpty v-else-if="mediaList.length === 0" title="Médiathèque" description="Aucun média trouvé" :icon="ImageIcon" />

                    <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        <div
                            v-for="item in mediaList"
                            :key="item.id"
                            class="group relative aspect-square border border-border overflow-hidden cursor-pointer transition-all bg-muted/20 hover:ring-2 hover:ring-primary/50"
                            @click="selectMedia(item)"
                        >
                            <img
                                v-if="item.type === 'image'"
                                :src="item.file_path"
                                class="w-full h-full object-cover"
                            />
                            <video
                                v-else-if="item.type === 'video'"
                                :src="item.file_path"
                                class="w-full h-full object-cover"
                            />
                            <div v-else class="w-full h-full flex flex-col items-center justify-center bg-background p-4 text-center">
                                <FileText v-if="item.type === 'document'" :size="32" class="text-blue-500 mb-2" />
                                <Archive v-else-if="item.type === 'archive'" :size="32" class="text-amber-500 mb-2" />
                                <File v-else :size="32" class="text-gray-400 mb-2" />
                                <span class="text-[10px] font-medium text-muted-foreground uppercase truncate w-full">
                                  {{ item.type }}
                                </span>
                            </div>

                            <div v-if="multiple ? Array.isArray(selectedMediaIds) && selectedMediaIds.includes(item.id) : selectedMediaIds === item.id"
                                 class="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[1px]">
                                <div class="bg-white rounded-full p-1 shadow-lg">
                                    <Check class="h-6 w-6 text-primary" />
                                </div>
                            </div>

                            <div class="absolute bottom-0 left-0 right-0 bg-black/70 p-1.5 text-[9px] text-white truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                {{ item.alt }}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="pt-4 flex justify-between items-center border-t mt-auto">
                    <span class="text-xs text-muted-foreground" v-if="total > 0">
                        {{ mediaList.length }} sur {{ total }} médias
                    </span>
                    <div class="flex gap-2">
                        <Button variant="ghost" size="sm" @click="open = false">Annuler</Button>
                        <Button @click="confirmSelection"
                                :disabled="multiple ? !(Array.isArray(selectedMediaIds) && selectedMediaIds.length > 0) : !selectedMediaIds"
                                size="sm">
                            Confirmer la sélection
                        </Button>
                    </div>
                </div>
            </TabsContent>
          </Tabs>
      </div>
    </template>
  </CompositionModal>
</template>
