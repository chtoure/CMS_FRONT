<script lang="ts" setup>
import { cn } from '../../lib/utils';

// defineProps<{
//   isOpen: boolean;
// }>();
</script>

<template>
  <div :class="cn(['w-full', 'p-2', 'text-text', 'font-bold', 'h-full', 'flex', 'flex-col'])">
    <div class="relative h-full w-full bg-builder-bar-background rounded-sm overflow-y-auto flex flex-col">
      <div class="sticky top-0 z-10 w-full px-4 py-2 bg-builder-bar-background rounded-sm border-b border-gray-600">
        <div class="flex items-center justify-between">
          <p class="font-bold text-builder-bar-text text-sm sm:text-base">Properties</p>
        </div>
      </div>
      <div class="relative p-4 flex-1 overflow-y-auto">
        <div class="">
          <p>properties</p>
        </div>
      </div>
    </div>
  </div>
</template>
