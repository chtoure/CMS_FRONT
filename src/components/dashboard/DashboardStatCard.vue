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
  <div class="group card p-3 transition-all duration-500 hover:shadow-primary/5">
    <div class="flex items-start justify-between">
      <div class="space-y-3">
        <div class="p-2.5 w-fit rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-500">
          <component :is="icon" class="w-5 h-5" />
        </div>
        <div class="flex items-center gap-2 mt-1">
          <p class="text-xl font-black tracking-tighter text-sidebar-foreground">{{ value }}</p>
          <span class="text-[10px] font-extrabold text-muted-foreground capitalize tracking-[0.15em] opacity-60">
            {{ title }}
          </span>
        </div>
        <div v-if="description || trend" class="flex items-center gap-2 pt-1 border-t border-sidebar-border/30">
          <span v-if="trend" :class="['text-[9px] font-black px-1.5 py-0.5 rounded-md', trend.positive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500']">
            {{ trend.positive ? '↑' : '↓' }} {{ trend.value }}%
          </span>
          <span class="text-[10px] text-muted-foreground leading-none font-bold opacity-50">{{ description }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
