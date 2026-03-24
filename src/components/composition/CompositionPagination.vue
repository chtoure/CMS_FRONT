<script setup lang="ts">
import Button from '../ui/button/Button.vue';
import Input from '../ui/input/Input.vue';
import {
  Pagination, PaginationContent, PaginationEllipsis,
  PaginationItem, PaginationNext, PaginationPrevious
} from '../ui/pagination';

interface Props {
  total: number
  limit: number
  modelValue: number
  perPage: number
}

defineProps<Props>()
const emit = defineEmits(['update:modelValue', 'update:perPage'])

const handlePerPageChange = (val: string | number) => {
  const numValue = typeof val === 'string' ? parseInt(val, 10) : val
  if (!isNaN(numValue) && numValue > 0) {
    emit('update:perPage', numValue)
    emit('update:modelValue', 1)
  }
}
</script>

<template>
  <div class="flex flex-col md:flex-row items-center justify-between w-full gap-6 md:gap-4">

    <div class="flex items-center gap-2 order-2 md:order-1">
      <span class="text-xs text-sidebar-foreground/60 font-medium tracking-wider">Afficher</span>
      <Input
        type="number"
        :model-value="perPage"
        @update:model-value="handlePerPageChange"
        class="h-9 w-16 input-custom bg-background transition-none"
      />
    </div>

    <Pagination
      :total="total"
      :items-per-page="perPage"
      :page="modelValue"
      @update:page="(val) => emit('update:modelValue', val)"
      :sibling-count="0"
      class="order-1 md:order-2 w-full md:w-auto"
      show-edges
    >
      <PaginationContent v-slot="{ items }" class="justify-center md:justify-end gap-1 md:gap-2">

        <PaginationPrevious
           @click="emit('update:modelValue', modelValue - 1)"
           :disabled="modelValue === 1"
           class="hover:bg-sidebar-accent border-sidebar-border transition-none h-9 px-3"
        />

        <template v-for="(item, index) in items">
          <PaginationItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
            <Button
              class="w-9 h-9 p-0 rounded-xl transition-none text-pagination-item-text border border-border"
              :class="[
                item.value === modelValue
                  ? 'bg-primary text-white pointer-events-none border-none'
                  : 'border-sidebar-border bg-background hover:bg-sidebar-accent hidden sm:flex', // 'hidden sm:flex' cache les non-actifs sur mobile
                item.value === modelValue ? 'flex' : '' // On s'assure que l'actif est toujours visible
              ]"
              @click="emit('update:modelValue', item.value)"
            >
              {{ item.value }}
            </Button>
          </PaginationItem>
          <PaginationEllipsis v-else :key="`ellipsis-${index}`" :index="index" class="hidden sm:flex" />
        </template>

        <PaginationNext
          @click="emit('update:modelValue', modelValue + 1)"
          :disabled="modelValue >= Math.ceil(total / perPage)"
          class="hover:bg-sidebar-accent border-sidebar-border transition-none h-9 px-3"
        />
      </PaginationContent>
    </Pagination>
  </div>
</template>
