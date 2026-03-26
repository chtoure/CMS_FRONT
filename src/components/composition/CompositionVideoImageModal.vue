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
      class="fixed z-50 flex flex-col p-0 overflow-hidden border-none shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] bg-background
             left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
             w-[90vw] h-[90vh] sm:max-w-[90vw]
             gap-0 rounded-2xl"
    >
      <DialogHeader class="px-6 py-4 border-b border-border bg-muted/30 backdrop-blur-md shrink-0">
        <div class="flex items-center justify-between">
          <div class="space-y-1 overflow-hidden">
            <DialogTitle class="text-base font-bold flex items-center gap-2 truncate">
              <div class="p-1.5 bg-primary/10 rounded-md">
                <FileType :size="16" class="text-primary" />
              </div>
              <span class="truncate">{{ alt || getFileName(href) }}</span>
            </DialogTitle>
            <DialogDescription class="text-[10px] uppercase tracking-widest font-bold opacity-60">
              Format: {{ type }}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div class="flex-1 flex items-center justify-center overflow-hidden bg-muted/10 relative group/preview p-2 sm:p-8">
        
        <img
          v-if="type === 'image'"
          :src="href"
          :alt="alt || 'image'"
          class="block w-full h-full object-contain animate-in zoom-in-95 duration-300"
        />

        <video
          v-else-if="type === 'video'"
          :src="href"
          controls
          autoplay
          class="block max-w-full w-full max-h-full bg-black"
        />

        <div v-else class="flex flex-col items-center justify-center p-6 text-center animate-in fade-in slide-in-from-bottom-4">
          <div class="relative mb-8">
            <div class="p-12 bg-background rounded-[2.5rem] shadow-xl border border-border/50 relative z-10">
              <FileText v-if="type === 'document'" :size="100" class="text-blue-500" />
              <Archive v-else :size="100" class="text-amber-500" />
            </div>
            <div class="absolute -bottom-4 -right-4 p-4 bg-primary text-white rounded-2xl shadow-2xl z-20">
              <Download :size="24" />
            </div>
          </div>

          <div class="space-y-4 max-w-sm">
            <h3 class="font-black text-2xl tracking-tight truncate">
              {{ getFileName(href) }}
            </h3>
            <p class="text-muted-foreground font-medium">
              Ce fichier ne peut pas être prévisualisé directement.
            </p>
            
            <div class="flex flex-col sm:flex-row gap-3 pt-4">
              <a :href="href" target="_blank" download class="flex-1 h-12 flex items-center justify-center gap-2 px-8 bg-primary text-white rounded-xl font-bold hover:scale-[1.02] active:scale-95 transition-all">
                <Download :size="18" /> Télécharger
              </a>
              <a :href="href" target="_blank" class="flex-1 h-12 flex items-center justify-center gap-2 px-8 bg-secondary text-foreground rounded-xl font-bold hover:bg-secondary/80 transition-all">
                <ExternalLink :size="18" /> Ouvrir
              </a>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
