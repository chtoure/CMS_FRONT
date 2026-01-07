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
  <div class="flex items-center justify-between w-full gap-4">
    <div class="flex items-center gap-2">
      <span class="text-xs text-sidebar-foreground/60 font-medium tracking-wider">Afficher</span>
      <Input
        type="number"
        :model-value="perPage"
        @update:model-value="handlePerPageChange"
        class="h-9 w-16 input-custom"
      />
    </div>

    <Pagination
      :total="total"
      :items-per-page="perPage"
      :model-value="modelValue"
      @update:model-value="(val: number) => emit('update:modelValue', val)"
    >
      <PaginationContent v-slot="{ items }">
        <PaginationPrevious
          @click="modelValue > 1 && emit('update:modelValue', modelValue - 1)"
          class="hover:bg-sidebar-accent/50 border-sidebar-border/50 transition-colors"
        />

        <template v-for="(item, index) in items">
          <PaginationItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
            <Button
              class="w-9 h-9 p-0 rounded-xl transition-all duration-200"
              :variant="item.value === modelValue ? 'default' : 'outline'"
              :class="item.value === modelValue ? 'bg-sidebar-primary shadow-lg shadow-sidebar-primary/30' : 'border-sidebar-border/50 hover:bg-sidebar-accent/50'"
              @click="emit('update:modelValue', item.value)"
            >
              {{ item.value }}
            </Button>
          </PaginationItem>
          <PaginationEllipsis v-else :key="item.type" :index="index" />
        </template>

        <PaginationNext
          @click="modelValue < Math.ceil(total/perPage) && emit('update:modelValue', modelValue + 1)"
          class="hover:bg-sidebar-accent/50 border-sidebar-border/50 transition-colors"
        />
      </PaginationContent>
    </Pagination>
  </div>
</template>
