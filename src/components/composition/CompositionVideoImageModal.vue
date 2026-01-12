<script setup lang="ts">
import Dialog from '../ui/dialog/Dialog.vue';
import DialogContent from '../ui/dialog/DialogContent.vue';
import DialogDescription from '../ui/dialog/DialogDescription.vue';
import DialogHeader from '../ui/dialog/DialogHeader.vue';
import DialogTitle from '../ui/dialog/DialogTitle.vue';
import DialogTrigger from '../ui/dialog/DialogTrigger.vue';

  defineProps<{
    type: 'video' | 'image',
    href: string,
    alt: string | null,
  }>()


</script>


<template>
  <Dialog>
    <DialogTrigger as-child>
      <slot name="trigger"></slot>
    </DialogTrigger>

    <DialogContent
      class="fixed z-50 flex flex-col p-0 overflow-hidden border-none shadow-2xl bg-background
             left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
             w-auto h-auto
             max-w-[90vw] max-h-[90vh]
             gap-0"
    >
      <DialogHeader class="p-3 border-b border-border hidden">
        <DialogTitle class="text-sm font-medium">
          {{ type === 'image' ? 'Image' : 'Video' }}
        </DialogTitle>
        <DialogDescription :class="{ 'sr-only': !alt }">
          {{ alt || 'Preview' }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 flex items-center justify-center min-h-0 overflow-hidden bg-black/5">
        <img
          v-if="type === 'image'"
          :src="href"
          :alt="alt || 'image'"
          class="block max-w-full max-h-[70vh] object-contain"
        />

        <video
          v-else
          :src="href"
          controls
          autoplay
          class="block max-w-full max-h-[70vh] object-contain"
        />
      </div>
    </DialogContent>
  </Dialog>
</template>
