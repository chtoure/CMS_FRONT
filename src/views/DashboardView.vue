<script setup lang="ts">
  import CompositionLoading from "@/components/composition/CompositionLoading.vue";
  import { useTodoList } from "../hook/todo"
  import Button from "@/components/ui/button/Button.vue";
import { showToast } from "../lib/toast";

  const {
    isPending,
    isError,
    data:todos,
    error,
    isFetched
  } = useTodoList();



</script>

<template>

  <div class="text-text">
    <div class="flex gap-2">
      <Button @click="showToast('success', 'Données chargées avec succès!')">Success</Button>
      <Button @click="showToast('error', 'Données chargées avec succès!')">Error</Button>
      <Button @click="showToast('info', 'Données chargées avec succès!')">Info</Button>
      <Button @click="showToast('warning', 'Données chargées avec succès!')">Warning</Button>
    </div>
    <CompositionLoading v-if="isPending" />

    <div v-else-if="isError">Error: {{ error }}</div>
    <div v-else-if="isFetched">
      <ul >
        <li v-for="todo in todos" :key="todo.id">
          {{ todo.title }}
        </li>
      </ul>
    </div>
  </div>

</template>
