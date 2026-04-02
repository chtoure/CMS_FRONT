<template>
  <div class="relative flex flex-col items-center justify-center h-full w-full min-h-[400px] overflow-hidden bg-background">
    
    <div class="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
      <div class="w-96 h-96 animate-pulse"></div>
    </div>

    <div class="relative z-10 flex flex-col items-center gap-12">
      
      <div class="relative p-8 bg-background/40 backdrop-blur-2xl">
        <div class="absolute inset-0 rounded-[100%] border animate-[ping_3s_infinite]"></div>
        
        <div class="flex items-center justify-center space-x-4 relative z-10">
          <div class="w-4 h-4 rounded-full bg-accent animate-organik-dot [animation-delay:-0.4s]"></div>
          <div class="w-4 h-4 rounded-full bg-primary animate-organik-dot [animation-delay:-0.2s]"></div>
          <div class="w-4 h-4 rounded-full bg-destructive animate-organik-dot"></div>
        </div>
      </div>

      
    </div>
  </div>
</template>

<style scoped>
@keyframes organik-dot {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
    filter: brightness(1);
  }
  50% {
    transform: scale(1.5);
    opacity: 0.4;
    filter: brightness(1.2); /* Simule un changement de couleur sans chercher de clé inexistante */
  }
}

.animate-organik-dot {
  animation: organik-dot 1.5s ease-in-out infinite;
}
</style>