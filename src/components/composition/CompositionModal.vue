<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

  const props = defineProps<{ title: string, description?: string, open?: boolean }>()
  const emit = defineEmits(['update:open'])

  const localOpen = ref(false)

  // Sync internal state with prop
  watch(() => props.open, (newVal) => {
    if (newVal !== undefined) {
      localOpen.value = newVal
    }
  }, { immediate: true })

  // Sync prop with internal state
  watch(localOpen, (newVal) => {
    emit('update:open', newVal)
  })

  const handleTriggerClick = () => {
    localOpen.value = true
  }

</script>


<template>
  <Dialog v-model:open="localOpen">
    <DialogTrigger as-child>
      <div @click="handleTriggerClick" class="cursor-pointer w-fit h-fit">
        <slot name="trigger"></slot>
      </div>
    </DialogTrigger>

    <DialogContent
      class="fixed left-1/2 top-1/2 z-50 flex flex-col -translate-x-1/2 -translate-y-1/2
             border border-border shadow-2xl bg-background rounded-none
             h-auto max-w-[90vw] w-[90%] max-h-[90vh] overflow-hidden gap-0 p-0"
    >
      <DialogHeader class="p-6 pb-4 flex-shrink-0 border-b border-border">
        <DialogTitle>{{ props.title }}</DialogTitle>
        <DialogDescription :class="{ 'sr-only': !props.description }">
          {{ props.description || 'Détails de la fenêtre modale' }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 min-h-0 overflow-y-auto p-6 custom-scrollbar" >
        <slot name="content"></slot>
      </div>
    </DialogContent>
  </Dialog>
</template>
