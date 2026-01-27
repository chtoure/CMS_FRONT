<script setup lang="ts">
import { computed } from 'vue'
import { useGetMedia } from '../../hook/media'
import { X, Image as ImageIcon, Loader2, FileText, Archive, File } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'
import type { Media } from '../../type/media';

const props = defineProps<{
  mediaId?: number,
  closeButton?: boolean,
  media?: Media
}>()

defineEmits(['remove'])

const { data: fetchedMedia, isLoading: isFetching } = useGetMedia(props.mediaId as number)

const media = computed(() => props.media || fetchedMedia.value)
const isLoading = computed(() => !props.media && isFetching.value)

const isImage = computed(() => media.value?.type === 'image')
const isVideo = computed(() => media.value?.type === 'video')
const isDocument = computed(() => media.value?.type === 'document')
const isArchive = computed(() => media.value?.type === 'archive')
const effectiveId = computed(() => props.media?.id || props.mediaId)
</script>

<template>
  <div class="relative group overflow-hidden border border-border bg-muted w-full h-full flex items-center justify-center flex-shrink-0 transition-all">

    <div v-if="isLoading" class="p-2 text-muted-foreground flex flex-col items-center">
        <Loader2 class="w-4 h-4 animate-spin mb-1"/>
        <span class="text-[10px]">Chargement...</span>
    </div>

    <template v-else-if="media">
        <img
            v-if="isImage"
            :src="media.file_path"
            :alt="media.alt || 'Image'"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        <div v-else-if="isVideo" class="w-full h-full flex items-center justify-center bg-black/10">
             <video :src="media.file_path" autoplay loop muted class="absolute inset-0 w-full h-full object-cover" />
        </div>

        <div v-else-if="isDocument" class="w-full h-full flex flex-col items-center justify-center bg-background p-2">
            <FileText :size="32" class="text-blue-500 mb-1" />
            <span class="text-[9px] font-bold text-blue-600 uppercase">Document</span>
        </div>

        <div v-else-if="isArchive" class="w-full h-full flex flex-col items-center justify-center bg-background p-2">
            <Archive :size="32" class="text-amber-500 mb-1" />
            <span class="text-[9px] font-bold text-amber-600 uppercase">Archive</span>
        </div>

        <div v-else class="w-full h-full flex items-center justify-center bg-background">
            <File :size="32" class="text-muted-foreground/40" />
        </div>

        <div v-if="closeButton" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2 z-10">
             <Button
                variant="outline"
                size="icon"
                class="h-8 w-8 bg-muted"
                @click.prevent.stop="$emit('remove', effectiveId)"
                type="button"
            >
                <X class="w-4 h-4" />
             </Button>
        </div>

        <div v-if="media.alt" class="absolute bottom-0 left-0 right-0 p-1 bg-black/70 text-[9px] text-white truncate px-2 z-10 translate-y-full group-hover:translate-y-0 transition-transform">
            {{ media.alt }}
        </div>
    </template>

    <div v-else class="p-2 text-center flex flex-col items-center">
        <ImageIcon class="w-6 h-6 text-muted-foreground/20 mb-1" />
        <span class="text-[9px] text-muted-foreground font-medium uppercase">Introuvable</span>
    </div>
  </div>
</template>
