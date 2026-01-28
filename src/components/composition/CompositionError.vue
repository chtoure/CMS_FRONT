<script setup lang="ts">
import { CloudAlert } from 'lucide-vue-next';

defineProps<{
  error: string | undefined | null;
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full w-full flex-1 gap-4 py-20">
    <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
      <CloudAlert class="h-8 w-8 text-destructive" />
    </div>
    <h3 class="text-lg font-semibold text-foreground mb-1">Erreur</h3>
    <p class="text-muted-foreground text-sm max-w-sm">
      {{ error || 'Une erreur est survenue.' }}
    </p>
  </div>
</template>
