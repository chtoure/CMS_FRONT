<script setup lang="ts">
import { ref, watch, nextTick, reactive } from 'vue'
import Button from '@/components/ui/button/Button.vue'
import Select from '@/components/ui/select/Select.vue'
import SelectTrigger from '@/components/ui/select/SelectTrigger.vue'
import SelectValue from '@/components/ui/select/SelectValue.vue'
import SelectContent from '@/components/ui/select/SelectContent.vue'
import SelectItem from '@/components/ui/select/SelectItem.vue'
import { Crop, Wand2, Pencil, RotateCcwSquare, Contrast, Grid3x3, RotateCw, RotateCcw, FlipHorizontal2, Minus, Plus, RefreshCcw } from 'lucide-vue-next'
import { useRoute } from 'vue-router'
import { useGetMedia } from '../../hook/media'

// --- INIT ---
const route = useRoute()
const id = Number(route.params.id)
const { data: media } = useGetMedia(id)

const currentTab = ref<string>('remove-bg')
const canvasRef = ref<HTMLCanvasElement | null>(null)
const imageObj = new Image()

// --- ETATS ---
const brushSize = ref(50)
const hardness = ref(60)
const opacity = ref(100)
const zoom = ref(100)
const aspectRatio = ref('Free')

const filters = reactive({
  blur: 0,
  grayscale: false,
  brightness: 1,
})

// À ajouter dans les états existants
const transform = reactive({
  rotate: 0, // 0, 90, 180, 270
  flipH: false,
  flipV: false
})

const cropState = reactive({
  realX: 0, realY: 0, realW: 0, realH: 0, // Pixels Sharp
  x: 0, y: 0, width: 100, height: 100,     // Pixels Ecran
})

// --- RENDU CANVAS ---

const renderCanvas = () => {
  const canvas = canvasRef.value
  if (!canvas || !imageObj.complete) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const angleRad = (transform.rotate * Math.PI) / 180
  const absCos = Math.abs(Math.cos(angleRad))
  const absSin = Math.abs(Math.sin(angleRad))

  // Dimensions de l'image pivotée totale
  const rotatedW = Math.floor(imageObj.width * absCos + imageObj.height * absSin)
  const rotatedH = Math.floor(imageObj.width * absSin + imageObj.height * absCos)

  // FIX: On garde toujours le canvas à la taille pivotée pour l'édition
  // On ne réduit la taille que si on veut réellement un aperçu "final" rogné
  const isPreview = currentTab.value !== 'crop' && cropState.realW > 0

  if (isPreview) {
    canvas.width = cropState.realW
    canvas.height = cropState.realH
  } else {
    canvas.width = rotatedW
    canvas.height = rotatedH
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Filtres
  let s = ''
  if (filters.grayscale) s += 'grayscale(100%) '
  if (filters.blur > 0) s += `blur(${filters.blur}px) `
  ctx.filter = s.trim() || 'none'

  ctx.save()

  if (isPreview) {
    // Mode APERÇU : On décale le dessin pour que la zone rognée remplisse le canvas
    ctx.translate(-cropState.realX, -cropState.realY)
  }

  // Dessin de l'image (Pivotée par le centre du canvas de base)
  ctx.translate(rotatedW / 2, rotatedH / 2)
  ctx.rotate(angleRad)
  ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1)
  ctx.drawImage(imageObj, -imageObj.width / 2, -imageObj.height / 2)

  ctx.restore()
}
// --- CALCULS COORDINATION ---

const getDisplayData = () => {
  const canvas = canvasRef.value
  if (!canvas) return null
  const rect = canvas.getBoundingClientRect()
  return {
    scale: rect.width / canvas.width,
    rect: rect,
  }
}

const syncCropToDisplay = () => {
  const data = getDisplayData()
  const canvas = canvasRef.value
  if (!data || !canvas) return

  // Si c'est la première fois ou si on veut reset :
  // On adapte le cadre à la taille actuelle du canvas
  cropState.x = 0
  cropState.y = 0
  cropState.width = data.rect.width
  cropState.height = data.rect.height

  updateRealCoords()
}

watch(() => transform.rotate, () => {
  renderCanvas()
  if (currentTab.value === 'crop') {
    nextTick(() => {
      syncCropToDisplay() // Réaligne le cadre sur la nouvelle forme de l'image
    })
  }
})

const updateRealCoords = () => {
  const data = getDisplayData()
  const canvas = canvasRef.value
  if (!data || !canvas) return

  // Le ratio entre la résolution interne du canvas et sa taille affichée
  const internalScale = canvas.width / data.rect.width

  // Coordonnées relatives à la zone de dessin réelle du canvas
  cropState.realX = cropState.x * internalScale
  cropState.realY = cropState.y * internalScale
  cropState.realW = cropState.width * internalScale
  cropState.realH = cropState.height * internalScale
}

// --- MOUSE EVENTS ---

const isDragging = ref(false)
const currentHandle = ref<string | null>(null)
const startPos = { x: 0, y: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 }

const startDrag = (e: MouseEvent) => {
  if (currentHandle.value) return
  isDragging.value = true
  startPos.x = e.clientX; startPos.y = e.clientY
  startPos.cropX = cropState.x; startPos.cropY = cropState.y
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopInteraction)
}

const onDrag = (e: MouseEvent) => {
  const data = getDisplayData()
  if (!data) return
  const dx = e.clientX - startPos.x
  const dy = e.clientY - startPos.y
  cropState.x = Math.max(0, Math.min(startPos.cropX + dx, data.rect.width - cropState.width))
  cropState.y = Math.max(0, Math.min(startPos.cropY + dy, data.rect.height - cropState.height))
  updateRealCoords()
}

const startResize = (handle: string, e: MouseEvent) => {
  e.stopPropagation()
  currentHandle.value = handle
  startPos.x = e.clientX; startPos.y = e.clientY
  startPos.cropX = cropState.x; startPos.cropY = cropState.y
  startPos.cropW = cropState.width; startPos.cropH = cropState.height
  window.addEventListener('mousemove', onResize)
  window.addEventListener('mouseup', stopInteraction)
}

const onResize = (e: MouseEvent) => {
  const data = getDisplayData()
  if (!data || !currentHandle.value) return
  const dx = e.clientX - startPos.x
  const dy = e.clientY - startPos.y

  let nW = startPos.cropW, nH = startPos.cropH, nX = startPos.cropX, nY = startPos.cropY
  const handle = currentHandle.value

  // Calcul des dimensions de base
  if (handle.includes('e')) nW = startPos.cropW + dx
  if (handle.includes('w')) { nX = startPos.cropX + dx; nW = startPos.cropW - dx }
  if (handle.includes('s')) nH = startPos.cropH + dy
  if (handle.includes('n')) { nY = startPos.cropY + dy; nH = startPos.cropH - dy }

  // Gestion du ratio avec sécurité TypeScript
  if (aspectRatio.value !== 'Free') {
    const parts = aspectRatio.value.split(':')
    if (parts.length === 2) {
      const rw = Number(parts[0])
      const rh = Number(parts[1])

      // On vérifie que les nombres sont valides (pas NaN et rh > 0)
      if (!isNaN(rw) && !isNaN(rh) && rh !== 0) {
        const r = rw / rh

        // Si on redimensionne par les côtés Est/Ouest, on ajuste la hauteur
        // Sinon (Nord/Sud), on ajuste la largeur
        if (handle.includes('e') || handle.includes('w')) {
          nH = nW / r
        } else {
          nW = nH * r
        }
      }
    }
  }

  // Validation des limites (Boundaries check)
  // On s'assure que le cadre ne sort pas de l'image (data.rect)
  if (nX >= 0 && nY >= 0 && nX + nW <= data.rect.width && nY + nH <= data.rect.height) {
    cropState.x = nX
    cropState.y = nY
    cropState.width = Math.max(20, nW) // Minimum 20px pour éviter de "perdre" le cadre
    cropState.height = Math.max(20, nH)
    updateRealCoords()
  }
}

const stopInteraction = () => {
  isDragging.value = false; currentHandle.value = null
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mousemove', onResize)
  window.removeEventListener('mouseup', stopInteraction)
}

// --- WATCHERS (Crucial pour les filtres et le rendu) ---

// 1. Quand l'image charge
watch(media, (newVal) => {
  if (newVal?.file_path) {
    imageObj.crossOrigin = 'anonymous'
    imageObj.src = `${newVal.file_path}?t=${Date.now()}`
    imageObj.onload = () => {
      cropState.realW = imageObj.width
      cropState.realH = imageObj.height
      renderCanvas()
    }
  }
}, { immediate: true })

// Remplacez votre watcher currentTab par celui-ci :
watch(currentTab, async () => {
  // 1. D'abord on redessine (change la taille du canvas si besoin)
  renderCanvas()

  // 2. On attend que le navigateur applique les styles CSS (important pour getBoundingClientRect)
  await nextTick()

  if (currentTab.value === 'crop') {
    // On laisse une frame de battement pour que le layout soit stable
    requestAnimationFrame(() => {
      syncCropToDisplay()
    })
  }
})

// 3. Quand on touche aux curseurs de filtres (Blur, Grayscale)
watch(filters, () => {
  renderCanvas()
}, { deep: true })

// 4. Quand on change le ratio, on force une mise à jour des coordonnées réelles
watch(aspectRatio, () => {
  if (aspectRatio.value !== 'Free') {
    const parts = aspectRatio.value.split(':')

    // On vérifie que le format est bien X:Y
    if (parts.length === 2) {
      const rw = Number(parts[0])
      const rh = Number(parts[1])

      // On vérifie que ce sont des nombres valides et que rh n'est pas 0
      if (!isNaN(rw) && !isNaN(rh) && rh !== 0) {
        const ratio = rw / rh
        cropState.height = cropState.width / ratio

        // Optionnel : s'assurer que le nouveau cadre ne dépasse pas du canvas
        const data = getDisplayData()
        if (data && (cropState.y + cropState.height > data.rect.height)) {
            // Si ça dépasse en bas, on réduit la largeur pour compenser
            cropState.height = data.rect.height - cropState.y
            cropState.width = cropState.height * ratio
        }

        updateRealCoords()
      }
    }
  }
})

const rotateLeft = () => {
  transform.rotate = (transform.rotate - 90) // Permet des valeurs négatives pour le slider
  renderCanvas()
}

const rotateRight = () => {
  transform.rotate = (transform.rotate + 90)
  renderCanvas()
}

// Ajoutez ce watcher pour que le slider mette à jour le canvas en temps réel
watch(() => transform.rotate, () => {
  renderCanvas()
})

const toggleFlipH = () => {
  transform.flipH = !transform.flipH
  renderCanvas()
}

const toggleFlipV = () => {
  transform.flipV = !transform.flipV
  renderCanvas()
}

const handleApply = () => {
  // On s'assure que les coordonnées sont bien à jour avant l'envoi
  updateRealCoords()

  const payload = {
    // 1. Rotation & Flip (Opérations de transformation)
    transformation: {
      rotate: transform.rotate, // Angle précis (ex: 45, 92, etc.)
      flipH: transform.flipH,
      flipV: transform.flipV,
      // Note: Le background par défaut de Sharp est noir lors d'une rotation,
      // on peut préciser un fond transparent ou blanc si besoin.
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    },

    // 2. Crop (appliqué sur l'image APRÈS transformation)
    // On arrondit car Sharp n'accepte que des entiers pour les pixels
    crop: {
      left: Math.max(0, Math.round(cropState.realX)),
      top: Math.max(0, Math.round(cropState.realY)),
      width: Math.round(cropState.realW),
      height: Math.round(cropState.realH)
    },

    // 3. Autres filtres
    filters: {
      blur: filters.blur,
      grayscale: filters.grayscale
    }
  }

  console.log('Données envoyées au backend (format Sharp) :', payload)

  // Exemple d'appel API :
  // await api.post(`/media/${id}/edit`, payload)
}
</script>

<template>
  <div class="border border-border bg-card overflow-hidden flex flex-col rounded-lg">
    <!-- Header -->
    <div class="border-b border-border px-6 py-4 flex justify-between items-center">
      <h2 class="huge font-semibold text-text">Edit image</h2>
    </div>

    <!-- Main content -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Left sidebar - Tool icons -->
      <div class="w-20 bg-card border-r border-border flex flex-col items-center py-4 space-y-4">
        <button
          @click="currentTab = 'remove-bg'"
          :class="[
            'w-12 h-12 rounded-md flex items-center justify-center transition-all',
            currentTab === 'remove-bg'
              ? 'bg-accent text-white shadow-md'
              : 'bg-input text-muted-foreground hover:bg-accent/20',
          ]"
          title="Remove BG"
        >
          <Wand2  />
        </button>
        <button
          @click="currentTab = 'crop'"
          :class="[
            'w-12 h-12 rounded-md flex items-center justify-center transition-all',
            currentTab === 'crop'
              ? 'bg-accent text-white shadow-md'
              : 'bg-input text-muted-foreground hover:bg-accent/20',
          ]"
          title="Crop"
        >
          <Crop  />
        </button>
        <button
          @click="currentTab = 'refine'"
          :class="[
            'w-12 h-12 rounded-md flex items-center justify-center transition-all',
            currentTab === 'refine'
              ? 'bg-accent text-white shadow-md'
              : 'bg-input text-muted-foreground hover:bg-accent/20',
          ]"
          title="Refine"
        >
          <Pencil  />
        </button>
        <button
          @click="currentTab = 'rotate'"
          :class="[
            'w-12 h-12 rounded-md flex items-center justify-center transition-all',
            currentTab === 'rotate'
              ? 'bg-accent text-white shadow-md'
              : 'bg-input text-muted-foreground hover:bg-accent/20',
          ]"
          title="Rotate"
        >
          <RotateCcwSquare  />
        </button>
        <button
          @click="currentTab = 'adjust'"
          :class="[
            'w-12 h-12 rounded-md flex items-center justify-center transition-all',
            currentTab === 'adjust'
              ? 'bg-accent text-white shadow-md'
              : 'bg-input text-muted-foreground hover:bg-accent/20',
          ]"
          title="Adjust"
        >
          <Contrast  />
        </button>
        <button
          @click="currentTab = 'filters'"
          :class="[
            'w-12 h-12 rounded-md flex items-center justify-center transition-all',
            currentTab === 'filters'
              ? 'bg-accent text-white shadow-md'
              : 'bg-input text-muted-foreground hover:bg-accent/20',
          ]"
          title="Filters"
        >
          <Grid3x3  />
        </button>
      </div>

      <!-- Center control panel -->
      <div class="w-72 bg-card border-r border-border p-6 overflow-y-auto custom-scrollbar">
        <!-- Remove BG -->
        <div v-if="currentTab === 'remove-bg'" class="space-y-6">
          <div>
            <h3 class="p13 font-semibold text-text mb-4">Refine</h3>
            <div class="flex gap-2 mb-4">
              <button
                class="flex-1 px-3 py-2 bg-card border-2 border-accent rounded p13 text-accent font-medium"
              >
                Restore
              </button>
              <button
                class="flex-1 px-3 py-2 bg-input border border-border rounded p13 text-text hover:bg-accent/10"
              >
                Erase
              </button>
            </div>
          </div>

          <div>
            <label class="p13 font-medium text-text block mb-2">Brush size</label>
            <input
              v-model.number="brushSize"
              type="range"
              min="1"
              max="100"
              class="w-full h-2 bg-border rounded appearance-none cursor-pointer accent-accent"
            />
            <span class="p11 text-muted-foreground">{{ brushSize }}px</span>
          </div>

          <div>
            <label class="p13 font-medium text-text block mb-2">Hardness</label>
            <input
              v-model.number="hardness"
              type="range"
              min="0"
              max="100"
              class="w-full h-2 bg-border rounded appearance-none cursor-pointer accent-accent"
            />
            <span class="p11 text-muted-foreground">{{ hardness }}%</span>
          </div>

          <div>
            <label class="p13 font-medium text-text block mb-2">Opacity</label>
            <input
              v-model.number="opacity"
              type="range"
              min="0"
              max="100"
              class="w-full h-2 bg-border rounded appearance-none cursor-pointer accent-accent"
            />
            <span class="p11 text-muted-foreground">{{ opacity }}%</span>
          </div>

          <div>
            <label class="p13 font-medium text-text block mb-3">Background</label>
            <div class="flex gap-2">
              <button
                class="w-10 h-10 rounded border-2 border-border flex items-center justify-center text-muted-foreground hover:border-accent"
              >
                ⊙
              </button>
              <div class="w-10 h-10 rounded bg-gradient-to-r from-red-400 to-blue-400 cursor-pointer hover:opacity-80"></div>
            </div>
            <button class="text-accent p13 font-medium mt-3">See more backgrounds</button>
          </div>
        </div>

        <!-- Crop -->
        <div v-else-if="currentTab === 'crop'" class="space-y-6">
          <div>
            <label class="p11 font-semibold text-muted-foreground uppercase tracking-wide block mb-2"
              >Aspect ratio</label
            >
            <Select v-model="aspectRatio">
              <SelectTrigger class="h-8 text-p13 !border-border bg-input">
                <SelectValue placeholder="Aspect ratio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="1:1">1:1</SelectItem>
                <SelectItem value="16:9">16:9</SelectItem>
                <SelectItem value="4:3">4:3</SelectItem>
                <SelectItem value="3:2">3:2</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 class="p13 font-semibold text-text mb-3">Rotate</h3>
            <div class="flex gap-2">
              <Button @click="rotateLeft" variant="secondary" class="flex-1 px-3 py-2 h-8">
                <RotateCcw class="size-16" />
              </Button>
              <Button @click="rotateRight" variant="secondary" class="flex-1 px-3 py-2 h-8">
                <RotateCw class="size-16" />
              </Button>
            </div>
          </div>

          <div>
            <h3 class="p13 font-semibold text-text mb-3">Flip</h3>
            <div class="flex gap-2">
              <Button @click="toggleFlipH" variant="secondary" class="flex-1 px-3 py-2 h-8">
                <FlipHorizontal2 class="size-16" />
              </Button>
              <Button @click="toggleFlipV" variant="secondary" class="flex-1 px-3 py-2 h-8">⊣</Button>
            </div>
          </div>
        </div>

        <!-- Refine -->
        <div v-else-if="currentTab === 'refine'" class="space-y-4">
          <p class="p13 text-muted-foreground">Refine tool controls</p>
        </div>

        <!-- Rotate -->
        <div v-else-if="currentTab === 'rotate'" class="space-y-4">
          <div>
            <label class="p13 font-medium text-text block mb-2">Rotation angle</label>
            <input
              v-model.number="transform.rotate"
              type="range"
              min="0"
              max="360"
              class="w-full h-2 bg-border rounded appearance-none cursor-pointer accent-accent"
            />
            <span class="p13 text-muted-foreground">{{ transform.rotate }}°</span>
          </div>
        </div>

        <!-- Adjust -->
        <div v-else-if="currentTab === 'adjust'" class="space-y-4">
          <p class="p13 text-muted-foreground">Adjust tool controls</p>
        </div>

        <!-- Filters -->
        <div v-else-if="currentTab === 'filters'" class="space-y-4">
          <div>
            <label class="p13 font-medium text-text block mb-2">Blur</label>
            <input
              v-model.number="filters.blur"
              type="range"
              min="0"
              max="20"
              step="0.5"
              class="w-full h-2 bg-border rounded appearance-none cursor-pointer accent-accent"
            />
            <span class="p11 text-muted-foreground">{{ filters.blur }}px</span>
          </div>

          <div class="flex items-center gap-2">
            <input
              v-model="filters.grayscale"
              type="checkbox"
              id="gray-check"
              class="w-4 h-4 accent-accent"
            />
            <label for="gray-check" class="p13 text-text">Grayscale</label>
          </div>
        </div>
      </div>

      <!-- Right preview area -->
      <div class="flex-1 bg-input p-6 flex flex-col items-center justify-center overflow-hidden">
        <div class="relative group h-full flex items-center justify-center bg-checkerboard rounded overflow-hidden flex-1">
          <div class="relative">
            <canvas
              ref="canvasRef"
              class="max-w-full max-h-full shadow-lg object-contain block"
            ></canvas>

            <!-- Crop overlay -->
            <div
              v-if="currentTab === 'crop'"
              class="absolute border-2 border-accent bg-accent/10 cursor-move z-30"
              :style="{
                left: cropState.x + 'px',
                top: cropState.y + 'px',
                width: cropState.width + 'px',
                height: cropState.height + 'px',
              }"
              @mousedown="startDrag"
            >
              <div
                class="absolute -top-1.5 -left-1.5 w-3 h-3 bg-accent cursor-nw-resize"
                @mousedown="startResize('nw', $event)"
              ></div>

              <div
                class="absolute -top-1.5 -right-1.5 w-3 h-3 bg-accent cursor-ne-resize"
                @mousedown="startResize('ne', $event)"
              ></div>

              <div
                class="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-accent cursor-sw-resize"
                @mousedown="startResize('sw', $event)"
              ></div>

              <div
                class="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-accent cursor-se-resize"
                @mousedown="startResize('se', $event)"
              ></div>
            </div>
          </div>
        </div>

        <!-- Zoom controls -->
        <div class="flex items-center gap-4 mt-6 text-accent">
          <button class="p-2 hover:text-accent/80">
            <RefreshCcw class="size-18" />
          </button>
          <button class="p-2 hover:text-accent/80">
            <Minus class="size-18" />
          </button>
          <span class="p13 w-12 text-center">{{ zoom }}%</span>
          <button class="p-2 hover:text-accent/80">
            <Plus class="size-18" />
          </button>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="border-t border-border px-6 py-4 flex justify-end gap-3 bg-card">
      <button class="px-6 py-2 p13 text-text border border-border rounded-lg hover:bg-input">
        Cancel
      </button>
      <button
        @click="handleApply"
        class="px-6 py-2 p13 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium"
      >
        Apply
      </button>
    </div>
  </div>
</template>
