<script setup lang="ts">
import { computed } from 'vue'
import { useGetMedia } from '../../hook/media'
import { X, FileVideo, Image as ImageIcon, Loader2 } from 'lucide-vue-next'
import Button from '@/components/ui/button/Button.vue'

const props = defineProps<{
  mediaId: number
}>()

defineEmits(['remove'])

// Fetch media detail by ID
// Note: useGetMedia returns a generic Ref/Query structure.
// Based on hook/media.ts: useGetMedia(id) return useQuery(...)
// So we destructure { data, isLoading }
const { data: media, isLoading } = useGetMedia(props.mediaId)

const isVideo = computed(() => media.value?.type === 'video')
</script>

<template>
  <div class="relative group overflow-hidden border border-border bg-muted w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center flex-shrink-0">
    <div v-if="isLoading" class="p12 text-muted-foreground flex flex-col items-center">
        <Loader2 class="w-4 h-4 animate-spin mb-1"/>
        Chargement...
    </div>
    <template v-else-if="media">
        <img
            v-if="!isVideo"
            :src="media.file_path"
            :alt="media.alt || 'Image'"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div v-else class="w-full h-full flex items-center justify-center bg-black/10">
            <FileVideo class="w-8 h-8 text-muted-foreground" />
             <video :src="media.file_path" class="absolute inset-0 w-full h-full object-cover opacity-50" />
        </div>

        <!-- Hover Overlay with Actions -->
        <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-start justify-end p-2 z-10">
             <Button
                variant="outline"
                size="icon"
                class="h-8 w-8 bg-muted"
                @click.prevent.stop="$emit('remove', mediaId)"
                type="button"
            >
                <X class="w-4 h-4" />
             </Button>
        </div>

        <!-- Caption -->
        <div v-if="media.alt" class="absolute bottom-0 left-0 right-0 p-1 bg-black/60 text-[10px] text-white truncate px-2 z-10">
            {{ media.alt }}
        </div>
    </template>

    <!-- Error/Not Found State -->
    <div v-else class="p-2 text-center">
        <ImageIcon class="w-6 h-6 text-muted-foreground/30 mx-auto mb-1" />
        <span class="text-[10px] text-muted-foreground">Introuvable</span>
    </div>
  </div>
</template>
