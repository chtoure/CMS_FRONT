<script setup lang="ts">
import Dialog from '../ui/dialog/Dialog.vue';
import DialogContent from '../ui/dialog/DialogContent.vue';
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

    <DialogContent class="max-w-[95vw] sm:max-w-4xl w-full p-0 overflow-hidden border-none bg-black/95">

      <div class="relative w-full h-full flex items-center justify-center max-h-[85vh]">

        <img
          v-if="type === 'image'"
          :src="href"
          :alt="alt || 'image'"
          class="w-full h-full object-contain"
        />

        <video
          v-else
          :src="href"
          controls
          autoplay
          class="w-full h-full object-contain"
        />

      </div>

    </DialogContent>
  </Dialog>
</template>
