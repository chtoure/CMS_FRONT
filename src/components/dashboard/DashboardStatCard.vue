<script setup lang="ts">
import { type LucideIcon } from 'lucide-vue-next'

interface Props {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: number
    positive: boolean
  }
}

defineProps<Props>()
</script>

<template>
  <div class="group card p-6 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
    <div class="flex items-start justify-between">
      <div class="space-y-4">
        <div class="p-3 w-fit rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500">
          <component :is="icon" class="w-6 h-6" />
        </div>
        <div>
          <p class="text-sm font-medium text-muted-foreground">{{ title }}</p>
          <h3 class="text-3xl font-black tracking-tighter mt-1">{{ value }}</h3>
        </div>
        <div v-if="description || trend" class="flex items-center gap-2">
          <span v-if="trend" :class="['text-xs font-bold px-2 py-0.5 rounded-full', trend.positive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500']">
            {{ trend.positive ? '+' : '' }}{{ trend.value }}%
          </span>
          <span class="text-xs text-muted-foreground leading-none">{{ description }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
