<script setup lang="ts">
  import Dialog from '../ui/dialog/Dialog.vue';
  import DialogContent from '../ui/dialog/DialogContent.vue';
  import DialogDescription from '../ui/dialog/DialogDescription.vue';
  import DialogHeader from '../ui/dialog/DialogHeader.vue';
  import DialogTitle from '../ui/dialog/DialogTitle.vue';
  import DialogTrigger from '../ui/dialog/DialogTrigger.vue';

  defineProps<{ title: string, description?: string }>()

</script>


<template>
  <Dialog>
    <DialogTrigger as-child>
      <slot name="trigger"></slot>
    </DialogTrigger>

    <DialogContent
      class="fixed inset-6 z-50 flex flex-col p-0 overflow-hidden border-none shadow-2xl bg-background
             w-auto h-auto max-w-none max-h-none
             left-6 top-6 right-6 bottom-6 translate-x-0 translate-y-0 gap-0"
    >
      <DialogHeader class="p-6 pb-4 flex-shrink-0 border-b border-border">
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription :class="{ 'sr-only': !description }">
          {{ description || 'Détails de la fenêtre modale' }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
        <slot name="content"></slot>
      </div>
    </DialogContent>
  </Dialog>
</template>
