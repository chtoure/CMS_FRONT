<script setup lang="ts">
interface Props {
  columns?: number;
}

const props = withDefaults(defineProps<Props>(), {
  columns: 4
});
</script>

<template>
  <div :class="`grid gap-2`" :style="{ gridTemplateColumns: `repeat(${columns}, 1fr)` }">
    <slot />
  </div>
</template>

<style scoped>
</style>
