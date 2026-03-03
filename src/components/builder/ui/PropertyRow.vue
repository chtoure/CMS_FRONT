<script setup lang="ts">
interface Props {
  cols?: number;
  gap?: 'sm' | 'md' | 'lg';
}

withDefaults(defineProps<Props>(), {
  cols: 2,
  gap: 'md'
});
</script>

<template>
  <div :class="['property-row', `cols-${cols}`, `gap-${gap}`]">
    <slot />
  </div>
</template>

<style scoped>
.property-row {
  display: grid;
}

.property-row.cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.property-row.cols-3 {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.property-row.cols-4 {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.property-row.gap-sm {
  gap: 0.5rem;
}

.property-row.gap-md {
  gap: 0.625rem;
}

.property-row.gap-lg {
  gap: 0.75rem;
}
</style>
