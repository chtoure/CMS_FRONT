<script setup lang="ts">
import Button from '../ui/button/Button.vue';
import Pagination from '../ui/pagination/Pagination.vue';
import PaginationContent from '../ui/pagination/PaginationContent.vue';
import PaginationEllipsis from '../ui/pagination/PaginationEllipsis.vue';
import PaginationItem from '../ui/pagination/PaginationItem.vue';
import PaginationNext from '../ui/pagination/PaginationNext.vue';
import PaginationPrevious from '../ui/pagination/PaginationPrevious.vue';



interface Props {
  total: number
  limit: number
  modelValue: number
}

defineProps<Props>()
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <Pagination
    v-slot="{ page }"
    :total="total"
    :items-per-page="limit"
    :model-value="modelValue"
    @update:model-value="(val: number) => emit('update:modelValue', val)"
  >
    <PaginationContent v-slot="{ items }">
      <PaginationPrevious @click="emit('update:modelValue', modelValue - 1)" />

      <template v-for="(item, index) in items">
        <PaginationItem
          v-if="item.type === 'page'"
          :key="index"
          :value="item.value"
          as-child
        >
          <Button
            class="w-8 h-8 p-0 rounded-xl"
            :variant="item.value === page ? 'default' : 'outline'"
            @click="emit('update:modelValue', item.value)"
          >
            {{ item.value }}
          </Button>
        </PaginationItem>

        <PaginationEllipsis v-else :key="item.type" :index="index" />
      </template>

      <PaginationNext @click="emit('update:modelValue', modelValue + 1)" />
    </PaginationContent>
  </Pagination>
</template>
