<template>
  <div class="relative flex flex-col items-center justify-center h-full w-full min-h-[500px] bg-background text-foreground overflow-hidden">
    
    <!-- Effet lumineux sophistiqué en arrière-plan -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div class="w-[40vw] h-[40vw] bg-primary/5 rounded-full blur-[100px] animate-pulse"></div>
    </div>

    <div class="relative z-10 flex flex-col items-center gap-10">
      
      <!-- Logo / Spinner de chargement -->
      <div class="relative flex items-center justify-center w-24 h-24">
        <!-- Anneaux rotatifs -->
        <div class="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
        <div class="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
        
        <!-- Anneau intérieur inversé (facultatif, donne un côté plus "tech") -->
        <div class="absolute inset-3 border-4 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_1.5s_linear_infinite_reverse] opacity-70"></div>
        
        <!-- Point central -->
        <div class="w-3 h-3 bg-foreground rounded-full animate-pulse shadow-[0_0_15px_rgba(var(--foreground),0.5)]"></div>
      </div>

      <!-- Textes et progression -->
      <!-- <div class="flex flex-col items-center gap-4 text-center">
        <div>
          <h2 class="text-2xl font-bold tracking-tight mb-1">Préparation de l'éditeur</h2>
          <p class="text-sm text-muted-foreground">
            Chargement de vos composants et de vos paramètres...
          </p>
        </div>
        
        <div class="w-64 h-1.5 bg-secondary/50 rounded-full overflow-hidden relative">
          <div class="absolute top-0 bottom-0 left-0 bg-primary rounded-full animate-progress-indeterminate"></div>
        </div>
      </div> -->

    </div>
  </div>
</template>

<style scoped>
@keyframes progress-indeterminate {
  0% {
    width: 0%;
    left: -10%;
  }
  50% {
    width: 40%;
    left: 30%;
  }
  100% {
    width: 0%;
    left: 110%;
  }
}

.animate-progress-indeterminate {
  animation: progress-indeterminate 2s ease-in-out infinite;
}
</style>