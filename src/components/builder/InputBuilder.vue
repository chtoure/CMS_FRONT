<script setup lang="ts">
import { computed } from 'vue';
import type { CommonStyles } from '../../type/component';
import { buildStyles } from '../../lib/styleProcessor';

interface Props {
  styles?: CommonStyles;
  data?: {
    type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url';
    placeholder?: string;
    label?: string;
    name?: string;
    id?: string;
    defaultValue?: string | number;
    required?: boolean;
    disabled?: boolean;
  };
}

const props = defineProps<Props>();

const computedClasses = computed(() => {
  return buildStyles('input', props.styles as Record<string, unknown>);
});
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label
      v-if="props.data?.label"
      :for="props.data?.id || props.data?.name"
      class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {{ props.data.label }}
    </label>
    <input
      :type="props.data?.type || 'text'"
      :name="props.data?.name"
      :id="props.data?.id || props.data?.name"
      :placeholder="props.data?.placeholder"
      :value="props.data?.defaultValue"
      :required="props.data?.required"
      :disabled="props.data?.disabled"
      :class="[
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        computedClasses
      ]"
    />
  </div>
</template>
