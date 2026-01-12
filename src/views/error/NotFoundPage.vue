<script setup lang="ts">
import { Home } from "lucide-vue-next";
import { RouterLink } from "vue-router";
import Button from "@/components/ui/button/Button.vue";
</script>

<template>
  <div class="h-full w-full flex items-center justify-center p-6 font-sans">
    <div class="max-w-md w-full text-center space-y-6">
      <h1 class="text-9xl font-black text-text opacity-50 tracking-tighter">
        404
      </h1>

      <div class="space-y-2">
        <h2 class="text-2xl font-bold text-text">
          Page introuvable
        </h2>
        <p class="text-text">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
      </div>

      <div class="pt-4">
        <RouterLink :to="{ name: 'admin.dashboard' }">
          <Button size="lg" class="px-8 rounded-xl bg-primary hover:bg-primary/95 text-white font-semibold transition-all active:scale-95">
            <Home class="w-4 h-4 mr-2" />
            Retour au Dashboard
          </Button>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
