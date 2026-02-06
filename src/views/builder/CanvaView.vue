<template>
  <div class="min-h-full w-full bg-builder-background relative overflow-hidden">
    <!-- Background Grid/Pattern could go here -->
    <div class="absolute inset-0 pattern-grid opacity-10 pointer-events-none"></div>

    <div class="w-full h-full flex items-center justify-center">
       <!-- Content of the canvas goes here.
            For now, keeping the placeholder structure but expanded
       -->
       <div class="relative w-full h-full">
          <!-- <p class="text-zinc-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            Zone de construction
          </p> -->
          <!-- Actual canvas draggable/droppable area would be here -->
       </div>
    </div>
  </div>
</template>

<style scoped>
.pattern-grid {
  background-image: radial-gradient(#4b5563 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
