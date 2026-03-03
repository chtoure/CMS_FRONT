<script setup lang="ts">
interface Props {
  label?: string;
  icon?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  labelPosition?: 'top' | 'left';
}

const props = withDefaults(defineProps<Props>(), {
  labelPosition: 'top'
});
</script>

<template>
  <div :class="{
    'flex flex-col gap-1.5': labelPosition === 'top',
    'flex items-center gap-2': labelPosition === 'left',
  }">
    <label v-if="label" class="text-[10px] font-bold uppercase text-builder-bar-text/80 tracking-wider flex items-center gap-1">
      <component v-if="icon" :is="icon" class="w-3 h-3 opacity-60" />
      {{ label }}
    </label>
    <div :class="{ 'flex-1': labelPosition === 'left' }">
      <slot />
    </div>
  </div>
</template>

<style scoped>
</style>
