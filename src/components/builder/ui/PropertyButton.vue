<script setup lang="ts">
interface Props {
  selected?: boolean;
  icon?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  label?: string;
  value?: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  click: [];
}>();
</script>

<template>
  <button
    @click="emit('click')"
    :class="{
      'bg-primary text-white border-primary shadow-md': selected,
      'bg-builder-input-bg text-builder-bar-text/70 border-builder-bar-border hover:bg-builder-input-bg/80 hover:text-builder-bar-text': !selected,
    }"
    class="px-2 py-1.5 rounded border transition-all duration-200 flex flex-col items-center justify-center gap-1 min-h-8"
    :title="label"
  >
    <component v-if="icon" :is="icon" class="w-4 h-4" />
    <span v-if="label" class="text-[10px] font-bold uppercase">{{ label }}</span>
    <span v-else-if="value" class="text-[9px] font-mono opacity-60">{{ value }}</span>
  </button>
</template>

<style scoped>
</style>
