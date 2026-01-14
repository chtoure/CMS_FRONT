<script setup lang="ts">
  import Dialog from '../ui/dialog/Dialog.vue';
  import DialogContent from '../ui/dialog/DialogContent.vue';
  import DialogDescription from '../ui/dialog/DialogDescription.vue';
  import DialogHeader from '../ui/dialog/DialogHeader.vue';
  import DialogTitle from '../ui/dialog/DialogTitle.vue';
  import DialogTrigger from '../ui/dialog/DialogTrigger.vue';

  defineProps<{ title: string, description?: string, open?: boolean }>()
  defineEmits(['update:open'])

</script>


<template>
  <Dialog :open="open" @update:open="(val) => $emit('update:open', val)" class="!rounded-none">
    <DialogTrigger as-child>
      <slot name="trigger"></slot>
    </DialogTrigger>

    <DialogContent
      class="fixed left-1/2 top-1/2 z-50 flex flex-col -translate-x-1/2 -translate-y-1/2
             border border-border shadow-2xl bg-background rounded-none
             w-auto h-auto max-w-[90vw] max-h-[90vh] overflow-hidden gap-0 p-0"
    >
      <DialogHeader class="p-6 pb-4 flex-shrink-0 border-b border-border">
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription :class="{ 'sr-only': !description }">
          {{ description || 'Détails de la fenêtre modale' }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 min-h-0 overflow-y-auto p-6 custom-scrollbar" >
        <slot name="content"></slot>
      </div>
    </DialogContent>
  </Dialog>
</template>
