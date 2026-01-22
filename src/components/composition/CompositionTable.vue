<script setup lang="ts" generic="T">
import { cn } from '../../lib/utils';
import { List, Search } from 'lucide-vue-next';
import Table from '../ui/table/Table.vue';
import TableBody from '../ui/table/TableBody.vue';
import TableCell from '../ui/table/TableCell.vue';
import TableHead from '../ui/table/TableHead.vue';
import TableHeader from '../ui/table/TableHeader.vue';
import TableRow from '../ui/table/TableRow.vue';
import CompositionPagination from './CompositionPagination.vue'
import Select from '../../components/ui/select/Select.vue'
import SelectTrigger from '../../components/ui/select/SelectTrigger.vue'
import SelectValue from '../../components/ui/select/SelectValue.vue'
import SelectContent from '../../components/ui/select/SelectContent.vue'
import SelectItem from '../../components/ui/select/SelectItem.vue'
import CompositionListEmpty from './CompositionListEmpty.vue';
import CompositionLoading from './CompositionLoading.vue';

interface Column {
  key: string
  label: string
  class?: string
}

interface FilterOption {
  label: string
  value: string
}

interface Props {
  columns: Column[]
  data: T[]
  total?: number
  limit?: number
  currentPage?: number

  // Search
  searchable?: boolean
  search?: string
  searchPlaceholder?: string

  // Filter
  filterable?: boolean
  filterValue?: string
  filterOptions?: FilterOption[]
  filterPlaceholder?: string,

  // Loading
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  total: 0,
  limit: 10,
  currentPage: 1,
  searchable: false,
  search: '',
  searchPlaceholder: 'Rechercher...',
  filterable: false,
  filterValue: 'all',
  filterPlaceholder: 'Filtrer par',
  isLoading: false,
})

const emit = defineEmits(['update:currentPage', 'update:limit', 'row-click', 'update:search', 'update:filterValue'])

const handlePageChange = (val: number) => {
  emit('update:currentPage', val)
}

const onSearchSubmit = (e: Event) => {
  const value = (e.target as HTMLInputElement).value
  emit('update:search', value)
}



const onFilterChange = (val: string | number | boolean | null | undefined) => {
  emit('update:filterValue', String(val ?? ''))
}
</script>

<template>
  <div class="space-y-4">
    <div v-if="searchable || filterable" class="flex flex-col sm:flex-row justify-between items-center gap-4 py-3">
      <div v-if="filterable" class="w-full sm:w-auto">
        <Select :model-value="filterValue" @update:model-value="(val) => onFilterChange(val as string)">
          <SelectTrigger class="input-custom min-w-[150px]">
            <SelectValue :placeholder="filterPlaceholder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" class="select-item-custom">Tous</SelectItem>
            <SelectItem
              v-for="opt in filterOptions"
              :key="opt.value"
              :value="opt.value"
              class="select-item-custom"
            >
              {{ opt.label }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div v-if="searchable" class="relative w-full sm:w-72 ml-auto">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          :value="search"
          @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
          @keyup.enter="onSearchSubmit"
          :placeholder="searchPlaceholder"
          class="pl-9 input-custom"
        />
      </div>

      <div v-if="$slots['extra-header']" class="flex items-center gap-2">
        <slot name="extra-header" />
      </div>
    </div>

    <div class="border border-sidebar-border bg-sidebar/30 backdrop-blur-sm overflow-hidden">
      <CompositionLoading v-if="isLoading" />
      <Table v-else class="border-collapse">
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
              <slot :name="`cell-${col.key}`" :value="row[col.key as keyof T]" :row="row" :index="rowIndex">
                {{ row[col.key as keyof T] }}
              </slot>
            </TableCell>
          </TableRow>

          <TableRow v-if="data.length === 0">
            <TableCell :colspan="columns.length" class="h-32 text-center text-muted-foreground">
              <CompositionListEmpty title="Aucune donnée disponible." description="Aucune donnée disponible." :icon="List" />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex items-center justify-end px-2">
      <CompositionPagination
        :total="props.total"
        :limit="props.limit"
        :perPage="props.limit"
        :model-value="props.currentPage"
        @update:model-value="handlePageChange"
        @update:per-page="(val) => emit('update:limit', val)"
      />
    </div>
  </div>
</template>
