<script setup lang="ts">
import { ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import DropdownMenu from '../ui/dropdown-menu/DropdownMenu.vue';
import DropdownMenuTrigger from '../ui/dropdown-menu/DropdownMenuTrigger.vue';
import DropdownMenuContent from '../ui/dropdown-menu/DropdownMenuContent.vue';

interface Props {
  isOpen: boolean
  initialColor: string
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'colorChange'])

// --- Logique de conversion (Inchangée) ---
function hexToHsv(hex: string) {
  hex = hex.replace("#", "")
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const delta = max - min
  let h = 0
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / delta + 2) / 6
    else h = ((r - g) / delta + 4) / 6
  }
  return { h: h * 360, s: (max === 0 ? 0 : delta / max) * 100, v: max * 100 }
}

function hsvToHex(h: number, s: number, v: number): string {
  const c = (v / 100) * (s / 100)
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v / 100 - c
  let r = 0, g = 0, b = 0
  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]
  const toHex = (val: number) => {
    const hex = Math.round((val + m) * 255).toString(16)
    return hex.padStart(2, '0').toUpperCase()
  }
  return toHex(r) + toHex(g) + toHex(b)
}

// --- État ---
const activeTab = ref<'custom' | 'libraries'>('custom')
const hexInput = ref(props.initialColor.replace("#", ""))
const hsv = ref(hexToHsv(props.initialColor))
const recentColors = ref<string[]>([])

watch(() => [props.initialColor, props.isOpen], () => {
  hexInput.value = props.initialColor.replace("#", "")
  hsv.value = hexToHsv(props.initialColor)
}, { immediate: true })

// --- Méthodes ---
const handleHexInput = (value: string) => {
  const cleanHex = value.replace("#", "").toUpperCase()
  hexInput.value = cleanHex
  if (cleanHex.length === 6 && /^[0-9A-F]{6}$/.test(cleanHex)) {
    hsv.value = hexToHsv(cleanHex)
    emit('colorChange', cleanHex)
  }
}

const handleSaturationChange = (e: MouseEvent) => {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
  const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
  hsv.value.s = x
  hsv.value.v = 100 - y
  const newHex = hsvToHex(hsv.value.h, hsv.value.s, hsv.value.v)
  hexInput.value = newHex
  emit('colorChange', newHex)
}

const handleHueChange = (e: Event) => {
  const val = parseFloat((e.target as HTMLInputElement).value)
  hsv.value.h = val
  const newHex = hsvToHex(val, hsv.value.s, hsv.value.v)
  hexInput.value = newHex
  emit('colorChange', newHex)
}
</script>

<template>
  <DropdownMenu :open="isOpen" @update:open="(val) => !val && emit('close')">
    <DropdownMenuTrigger as-child>
      <slot name="trigger"></slot>
    </DropdownMenuTrigger>

    <DropdownMenuContent
      align="start"
      :side-offset="8"
      class="p-3 w-60 bg-popover border border-border shadow-2xl rounded-md z-50"
      @pointer-down-outside="emit('close')"
    >
      <div class="flex items-center justify-between mb-3">
        <div class="flex bg-muted/50 p-0.5 rounded-md">
          <button
            @click="activeTab = 'custom'"
            :class="['px-2 py-0.5 text-[11px] font-medium rounded-sm transition', activeTab === 'custom' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground']"
          >
            Custom
          </button>
          <button
            @click="activeTab = 'libraries'"
            :class="['px-2 py-0.5 text-[11px] font-medium rounded-sm transition', activeTab === 'libraries' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground']"
          >
            Libraries
          </button>
        </div>
        <button @click="emit('close')" class="text-muted-foreground hover:text-foreground transition">
          <X :size="14" />
        </button>
      </div>

      <div v-if="activeTab === 'custom'" class="space-y-3">
        <div
          @mousedown="handleSaturationChange"
          class="relative w-full h-32 rounded-sm cursor-crosshair border border-border overflow-hidden"
          :style="{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hsv.h}, 100%, 50%))` }"
        >
          <div
            class="absolute w-3 h-3 rounded-full border border-white shadow-md -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            :style="{ left: `${hsv.s}%`, top: `${100 - hsv.v}%`, backgroundColor: `#${hexInput}` }"
          />
        </div>

        <div class="space-y-2">
          <input
            type="range"
            min="0" max="360" step="0.1"
            :value="hsv.h"
            @input="handleHueChange"
            class="hue-slider w-full h-2 rounded-full appearance-none cursor-pointer"
          />
        </div>

        <div class="flex items-center gap-2">
          <div class="flex-1 flex items-center bg-muted/30 border border-input rounded px-1.5 py-1 text-xs">
            <span class="text-[10px] text-muted-foreground uppercase pr-1 mr-1 border-r border-border">Hex</span>
            <input
              type="text"
              :value="hexInput"
              @input="handleHexInput(($event.target as HTMLInputElement).value)"
              class="w-full bg-transparent text-foreground font-mono focus:outline-none"
            />
          </div>
          <div
            class="w-6 h-6 rounded-sm border border-border flex-shrink-0"
            :style="{ backgroundColor: `#${hexInput}` }"
          />
        </div>

        <div v-if="recentColors.length > 0" class="pt-1">
          <div class="grid grid-cols-6 gap-1.5">
            <button
              v-for="(color, i) in recentColors.slice(0, 12)"
              :key="i"
              @click="handleHexInput(color)"
              class="w-full aspect-square rounded-sm border border-border/50 hover:scale-110 transition-transform"
              :style="{ backgroundColor: `#${color}` }"
            />
          </div>
        </div>
      </div>

      <div v-else class="text-center py-6 text-[11px] text-muted-foreground">
        <p>A voir plus tard</p>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<style scoped>
.hue-slider {
  background: linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%);
}
.hue-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 10px; height: 10px;
  background: white; border-radius: 50%;
  border: 1px solid #666;
}
.hue-slider::-moz-range-thumb {
  width: 10px; height: 10px;
  background: white; border-radius: 50%;
  border: 1px solid #666;
}
</style>
