<script setup lang="ts" generic="T">
import { cn } from '../../lib/utils';
import Table from '../ui/table/Table.vue';
import TableBody from '../ui/table/TableBody.vue';
import TableCell from '../ui/table/TableCell.vue';
import TableHead from '../ui/table/TableHead.vue';
import TableHeader from '../ui/table/TableHeader.vue';
import TableRow from '../ui/table/TableRow.vue';
import CompositionPagination from './CompositionPagination.vue'

interface Column {
  key: string
  label: string
  class?: string
}

interface Props {
  columns: Column[]
  data: T[]
  total?: number
  limit: number
  currentPage?: number
}

withDefaults(defineProps<Props>(), {
  total: 0,
  limit: 10,
  currentPage: 1
})

const emit = defineEmits(['update:currentPage', 'update:limit', 'row-click'])

const handlePageChange = (val: number) => {
  emit('update:currentPage', val)
}
</script>

<template>
  <div class="space-y-4">
    <div class="border border-sidebar-border bg-sidebar/30 backdrop-blur-sm overflow-hidden">
      <Table class="border-collapse">
        <TableHeader class="bg-sidebar-accent">
          <TableRow class="hover:bg-transparent">
            <TableHead
              v-for="(col, idx) in columns"
              :key="col.key"
              :class="cn(
                'font-bold text-sidebar-foreground h-12 px-4',
                'border-b border-sidebar-border',
                idx < columns.length - 1 ? 'border-r border-sidebar-border' : '',
                col.class
              )"
            >
              {{ col.label }}
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow
            v-for="(row, rowIndex) in data"
            :key="rowIndex"
            class="group hover:bg-sidebar-accent/30 transition-colors cursor-pointer"
            @click="emit('row-click', row)"
          >
            <TableCell
              v-for="(col, colIndex) in columns"
              :key="col.key"
              :class="cn(
                'p-4 transition-colors',
                'border-b border-sidebar-border',
                colIndex < columns.length - 1 ? 'border-r border-sidebar-border' : '',
                col.class
              )"
            >
              <slot :name="`cell-${col.key}`" :value="row[col.key as keyof T]" :row="row">
                {{ row[col.key as keyof T] }}
              </slot>
            </TableCell>
          </TableRow>

          <TableRow v-if="data.length === 0">
            <TableCell :colspan="columns.length" class="h-32 text-center text-muted-foreground">
              Aucune donnée disponible.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex items-center justify-end px-2">
      <CompositionPagination
        :total="total"
        :limit="limit"
        :perPage="limit"
        :model-value="currentPage"
        @update:model-value="handlePageChange"
        @update:per-page="(val) => emit('update:limit', val)"
      />
    </div>
  </div>
</template>
