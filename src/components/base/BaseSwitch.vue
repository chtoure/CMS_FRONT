<script setup lang="ts">
import { cn } from '../../lib/utils'

const props = defineProps<{
  modelValue: boolean
  id?: string
  class?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const toggle = () => {
  emit('update:modelValue', !props.modelValue)
}
</script>

<template>
  <button
    @click="toggle"
    type="button"
    :id="id"
    :class="cn(
      'relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      modelValue ? 'bg-primary' : 'bg-muted border border-border',
      props.class
    )"
  >
    <span
      :class="cn(
        'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-md ring-0 transition-transform duration-300',
        modelValue ? 'translate-x-5' : 'translate-x-0.5'
      )"
    ></span>
  </button>
</template>
