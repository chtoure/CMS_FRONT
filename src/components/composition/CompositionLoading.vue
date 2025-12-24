<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full w-full flex-1 gap-4 py-20">
    <!-- Enhanced loading spinner with new design system colors -->
    <Loader2 class="h-16 w-16 animate-spin text-primary drop-shadow-lg" />
    <p class="text-sm font-semibold text-muted-foreground animate-pulse">
      Chargement de vos données...
    </p>
  </div>
</template>
