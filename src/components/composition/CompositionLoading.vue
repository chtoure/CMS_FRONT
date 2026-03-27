<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Layers } from 'lucide-vue-next'

const progress = ref(0)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let interval: any

onMounted(() => {
  interval = setInterval(() => {
    if (progress.value < 100) {
      const inc = Math.random() * 8
      progress.value = Math.min(progress.value + inc, 100)
    } else {
      clearInterval(interval)
    }
  }, 200)
})

onUnmounted(() => clearInterval(interval))
</script>

<template>
  <div class="relative flex flex-col items-center justify-center h-full w-full min-h-[400px] overflow-hidden bg-background">
    
    <div class="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
      <div class="w-64 h-64 bg-primary rounded-full blur-[100px] animate-pulse"></div>
      <div class="w-48 h-48 bg-emerald-400 rounded-full blur-[80px] -ml-20 mt-20 animate-bounce duration-[4000ms]"></div>
    </div>

    <div class="relative z-10 flex flex-col items-center gap-8">
      
      <div class="relative flex items-center justify-center">
        <div class="absolute inset-0 rounded-full border-2 border-primary/30 animate-[ping_2.5s_infinite]"></div>
        
        <div class="relative p-7 bg-background/60 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-2xl">
          <Layers 
            class="h-12 w-12 text-primary animate-custom-float" 
            :stroke-width="2.5"
          />
        </div>
      </div>

      <div class="flex flex-col items-center gap-4 w-64">
        <div class="text-center">
          <h2 class="text-xl font-black tracking-tighter text-foreground italic">
            <span class="text-primary">COMPOSITOR</span> STARTING
          </h2>
          <p class="text-[10px] font-mono font-bold text-primary mt-1">
            {{ Math.round(progress) }}%
          </p>
        </div>

        <div class="w-full h-1.5 bg-muted rounded-full overflow-hidden border border-border/20 relative shadow-inner">
          <div 
            class="h-full bg-primary transition-all duration-300 ease-out relative"
            :style="{ width: `${progress}%` }"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>

        <p class="text-[9px] font-bold Capitalize tracking-[0.3em] text-muted-foreground animate-pulse">
          Chargement de l'espace de travail...
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes custom-float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(5deg); }
  75% { transform: translateY(5px) rotate(-5deg); }
}

.animate-custom-float {
  animation: custom-float 3s ease-in-out infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}

.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(var(--primary), 0.3);
}
</style>