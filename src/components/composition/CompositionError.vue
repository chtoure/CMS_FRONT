<script setup lang="ts">
import { CloudAlert } from 'lucide-vue-next';

defineProps<{
  error: string | undefined;
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full w-full flex-1 gap-4 py-20">
    <CloudAlert class="h-16 w-16 text-destructive drop-shadow-lg" />
    <p class="text-sm font-semibold text-destructive animate-pulse">
      {{error || 'Une erreur est survenue.'}}.
    </p>
  </div>
</template>
