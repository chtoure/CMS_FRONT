
<script setup lang="ts">
interface Props {
  if?: boolean;         // Une condition personnalisée (ex: row.id !== me.id)
}

const props = defineProps<Props>();

</script>

<template>
  <slot v-if="props.if !== false" />
</template>
