<script setup lang="ts">
import CompositionLoading from "@/components/composition/CompositionLoading.vue";
import { useTodoList } from "../hook/todo";
import Button from "@/components/ui/button/Button.vue";
import { showToast, type ToastType } from "../lib/toast";

const {
  isPending,
  isError,
  data: todos,
  error,
  isFetched
} = useTodoList();

// Function to handle button clicks
const handleButtonClick = (type: ToastType, message: string) => {
  showToast(type, message);
};
</script>

<template>
  <div class="">
    <div class="mb-6">
      <h1 class="text-xl font-semibold text-foreground mb-2">Dashboard</h1>
      <p class="text-[13px] text-muted-foreground">Bienvenue dans votre tableau de bord</p>
    </div>

    <div class=" mb-4">
      <h2 class="text-sm font-semibold text-text mb-3">Actions rapides</h2>
      <div class="flex gap-2">
        <Button size="sm" @click="handleButtonClick('success', 'Données chargées avec succès!')">Success</Button>
        <Button size="sm" variant="destructive" @click="handleButtonClick('error', 'Erreur!')">Error</Button>
        <Button size="sm" variant="secondary" @click="handleButtonClick('info', 'Information')">Info</Button>
        <Button size="sm" variant="outline" @click="handleButtonClick('warning', 'Attention!')">Warning</Button>
      </div>
    </div>

    <CompositionLoading v-if="isPending" />

    <div v-else-if="isError" class="">
      <p class="text-destructive text-[13px]">Error: {{ error?.message }}</p>
    </div>

    <div v-else-if="isFetched" class="">
      <h2 class="text-sm font-semibold text-text mb-3">Liste des tâches</h2>
      <ul class="space-y-2">
        <li v-for="todo in todos" :key="todo.id" class="text-[13px] text-text py-1.5 px-2.5 hover:bg-muted rounded-md transition-colors">
          {{ todo.title }}
        </li>
      </ul>
    </div>
  </div>
</template>
