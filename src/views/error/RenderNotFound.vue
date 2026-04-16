<template>
  <div class="relative flex flex-col items-center justify-center h-full w-full min-h-[500px] bg-background text-foreground overflow-hidden">
    
    <!-- Grand filigrane 404 subtil en arrière-plan -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none opacity-[0.03]">
      <span class="text-[20rem] font-black tracking-tighter">404</span>
    </div>

    <!-- Éléments décoratifs : blocs de composition "vides" flottants -->
    <div class="absolute w-32 h-32 border-2 border-dashed border-muted-foreground/20 rounded-xl top-[15%] left-[20%] -rotate-12 animate-[pulse_4s_infinite]"></div>
    <div class="absolute w-48 h-16 border-2 border-dashed border-muted-foreground/15 rounded-xl bottom-[20%] right-[15%] rotate-6 animate-[pulse_5s_infinite]"></div>
    <div class="absolute w-20 h-20 border-2 border-dashed border-muted-foreground/20 rounded-full top-[30%] right-[25%] animate-[pulse_6s_infinite]"></div>

    <div class="relative z-10 flex flex-col items-center gap-8 max-w-lg text-center p-8">
      
      <!-- Icône de recherche / introuvable élégante -->
      <div class="relative flex items-center justify-center w-28 h-28 rounded-full bg-muted/20 border border-muted/50 backdrop-blur-md">
        <!-- Anneau pointillé rotatif interne (rappel de la construction de l'UI) -->
        <div class="absolute inset-3 border-2 border-dashed border-muted-foreground/40 rounded-full animate-[spin_25s_linear_infinite]"></div>
        
        <!-- Icône de recherche vide -->
        <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground/80 relative z-10">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
          <line x1="8" y1="11" x2="14" y2="11" />
        </svg>
      </div>

      <!-- Textes -->
      <div class="flex flex-col gap-3">
        <h2 class="text-sm font-semibold tracking-widest uppercase text-muted-foreground">Erreur de structure</h2>
        <h1 class="text-4xl font-bold tracking-tight">Page Introuvable</h1>
        <p class="text-muted-foreground text-base mt-2 leading-relaxed">
          Il semblerait que nous cherchions dans le vide. La page que vous demandez est inexistant(e) ou a été désintégré(e) de l'espace de travail.
        </p>
      </div>

      <!-- Out / Action -->
      <div class="mt-6">
        <button 
          @click="$emit('back')" 
          class="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full border border-border bg-card px-8 font-medium text-foreground transition-all hover:bg-muted hover:border-muted-foreground/30 active:scale-95 shadow-sm"
        >
          <span class="mr-2 transition-transform group-hover:-translate-x-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </span>
          Retourner en lieu sûr
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits(['back'])
</script>
