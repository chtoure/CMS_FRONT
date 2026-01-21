<script setup lang="ts">
import { FileText, Archive, Download, ExternalLink, FileType } from 'lucide-vue-next';
import Dialog from '../ui/dialog/Dialog.vue';
import DialogContent from '../ui/dialog/DialogContent.vue';
import DialogDescription from '../ui/dialog/DialogDescription.vue';
import DialogHeader from '../ui/dialog/DialogHeader.vue';
import DialogTitle from '../ui/dialog/DialogTitle.vue';
import DialogTrigger from '../ui/dialog/DialogTrigger.vue';

defineProps<{
  type: 'video' | 'image' | 'document' | 'archive',
  href: string,
  alt: string | null,
}>()

const getFileName = (url: string) => {
  return url.split('/').pop() || 'Fichier';
}
</script>

<template>
  <Dialog>
    <DialogTrigger as-child>
      <slot name="trigger"></slot>
    </DialogTrigger>

    <DialogContent
      class="fixed z-50 flex flex-col p-0 overflow-hidden border-none shadow-2xl bg-background
             left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
             w-full sm:w-auto h-auto
             max-w-[95vw] sm:max-w-[90vw] max-h-[90vh]
             gap-0 rounded-lg"
    >
      <DialogHeader class="p-4 border-b border-border bg-muted/20">
        <DialogTitle class="text-sm font-semibold flex items-center gap-2">
          <FileType :size="16" class="text-primary" />
          {{ alt || getFileName(href) }}
        </DialogTitle>
        <DialogDescription class="text-xs">
          Type: {{ type.charAt(0).toUpperCase() + type.slice(1) }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 flex items-center justify-center min-h-[300px] overflow-hidden bg-black/[0.02] p-4">

        <img
          v-if="type === 'image'"
          :src="href"
          :alt="alt || 'image'"
          class="block max-w-full max-h-[70vh] object-contain shadow-lg rounded-sm"
        />

        <video
          v-else-if="type === 'video'"
          :src="href"
          controls
          autoplay
          class="block max-w-full max-h-[70vh] shadow-lg rounded-sm"
        />

        <div v-else class="flex flex-col items-center justify-center p-12 text-center space-y-6">
          <div class="relative">
            <div class="p-8 bg-background rounded-2xl shadow-sm border border-border">
              <FileText v-if="type === 'document'" :size="80" class="text-blue-500" />
              <Archive v-else :size="80" class="text-amber-500" />
            </div>
            <div class="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-full shadow-lg">
              <Download :size="16" />
            </div>
          </div>

          <div class="space-y-2">
            <h3 class="font-medium text-lg leading-tight max-w-xs truncate">
              {{ getFileName(href) }}
            </h3>
            <p class="text-sm text-muted-foreground">
              La prévisualisation n'est pas disponible pour ce type de fichier.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 w-full">
            <a
              :href="href"
              target="_blank"
              download
              class="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              <Download :size="18" />
              Télécharger
            </a>
            <a
              :href="href"
              target="_blank"
              class="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-secondary text-secondary-foreground rounded-md font-medium hover:bg-secondary/80 transition-colors"
            >
              <ExternalLink :size="18" />
              Ouvrir
            </a>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
