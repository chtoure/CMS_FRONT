<script setup lang="ts">
import { FolderOpen } from 'lucide-vue-next'

defineProps<{
  label: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-xl bg-muted/30 text-center">
    <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
      <FolderOpen class="w-6 h-6 text-muted-foreground" />
    </div>
    <p class="text-sm text-muted-foreground font-medium">{{ label }}</p>
  </div>
</template>