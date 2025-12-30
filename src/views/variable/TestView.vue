<script lang="ts" setup>
  import CompositionModal from '@/components/composition/CompositionModal.vue';
import Button from '@/components/ui/button/Button.vue';
import VariableListView from './VariableListView.vue';
</script>

<template>
  <CompositionModal title="Variables">
    <template #trigger>
      <Button>Open Modal</Button>
    </template>
    <template #content>
      <VariableListView />
    </template>
  </CompositionModal>
</template>
