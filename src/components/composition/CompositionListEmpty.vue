<script setup lang="ts">
import type { Component } from 'vue';


defineProps<{
  icon : Component,
  title: string,
  description : string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
    <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
      <component :is="icon" class="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 class="text-lg font-semibold text-foreground mb-1">{{ title }}</h3>
    <p class="text-muted-foreground text-sm max-w-sm">
      {{ description }}
    </p>
  </div>
</template>
