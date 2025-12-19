<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full w-full flex-1 gap-4 py-20">
    <Loader2 class="h-16 w-16 animate-spin text-primary" />
    <p class="text-sm font-medium text-muted-foreground animate-pulse">
      Chargement de vos données...
    </p>
  </div>
</template>
