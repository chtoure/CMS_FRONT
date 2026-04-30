<script setup lang="ts">
// PageFormView détecte automatiquement le mode édition via route.params.id
// On passe juste :is-editing pour forcer la logique d'édition
import PageFormView from './PageFormView.vue';
</script>

<template>
  <PageFormView :is-editing="true" />
</template>
