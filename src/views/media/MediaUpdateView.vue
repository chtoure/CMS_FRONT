<script setup lang="ts">
import { ref, reactive, watch, nextTick } from 'vue';
import { Scissors, RotateCw, Image as ImageIcon, FlipHorizontal, FlipVertical, RotateCcw, Check, ArrowLeft, Loader2 } from 'lucide-vue-next';
import { useRoute } from 'vue-router';
import { useGetMedia, useEditMedia } from '../../hook/media';
import router from '../../router';
import { showToast } from '../../lib/toast';
import { getErrorMessage } from '../../lib/errorMessage';
import Select from '../../components/ui/select/Select.vue';
import SelectTrigger from '../../components/ui/select/SelectTrigger.vue';
import SelectContent from '../../components/ui/select/SelectContent.vue';
import SelectItem from '../../components/ui/select/SelectItem.vue';
import type { Media, SaveMediaPayload } from '../../type/media';
import SelectValue from '../../components/ui/select/SelectValue.vue';
import CompositionPageHeader from '../../components/composition/CompositionPageHeader.vue';
import BaseSwitch from '../../components/base/BaseSwitch.vue';

const ASPECT_RATIOS: Record<string, number | null> = { 'free': null, '1:1': 1, '16:9': 16/9, '4:3': 4/3, '3:2': 3/2 };

const route = useRoute();
const id = Number(route.params.id);
const { data: mediaData } = useGetMedia(id);
const { mutate: updateMedia, isPending: isSaving } = useEditMedia();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const imageElement = ref<HTMLImageElement | null>(null);
const aspectRatio = ref('free');

const state = reactive({
  transform: { rotate: 0, flipH: false, flipV: false },
  filters: { blur: 0, grayscale: false },
  crop: { x: 0, y: 0, width: 200, height: 200, realX: 0, realY: 0, realW: 0, realH: 0 },
  canvas: { w: 0, h: 0 }
});

const interaction = reactive({
  active: false,
  type: 'move' as 'move' | 'resize',
  startX: 0, startY: 0,
  startCrop: { x: 0, y: 0, w: 0, h: 0 }
});

const startInteraction = (e: MouseEvent, type: 'move' | 'resize') => {
  e.stopPropagation();
  interaction.active = true;
  interaction.type = type;
  interaction.startX = e.clientX;
  interaction.startY = e.clientY;
  interaction.startCrop = { ...state.crop, w: state.crop.width, h: state.crop.height };
  window.addEventListener('mousemove', handleInteraction);
  window.addEventListener('mouseup', stopInteraction);
};

const handleInteraction = (e: MouseEvent) => {
  if (!interaction.active) return;
  const dx = e.clientX - interaction.startX;
  const dy = e.clientY - interaction.startY;

  if (interaction.type === 'move') {
    state.crop.x = Math.max(0, Math.min(state.canvas.w - state.crop.width, interaction.startCrop.x + dx));
    state.crop.y = Math.max(0, Math.min(state.canvas.h - state.crop.height, interaction.startCrop.y + dy));
  } else if (interaction.type === 'resize') {
    let newW = Math.max(50, interaction.startCrop.w + dx);
    let newH = Math.max(50, interaction.startCrop.h + dy);

    if (interaction.startCrop.x + newW > state.canvas.w) newW = state.canvas.w - interaction.startCrop.x;
    if (interaction.startCrop.y + newH > state.canvas.h) newH = state.canvas.h - interaction.startCrop.y;

    const ratio = ASPECT_RATIOS[aspectRatio.value];
    if (ratio) {
      const adjustedH = newW / ratio;
      if (interaction.startCrop.y + adjustedH <= state.canvas.h) {
        newH = adjustedH;
      } else {
        newH = state.canvas.h - interaction.startCrop.y;
        newW = newH * ratio;
      }
    }
    state.crop.width = newW;
    state.crop.height = newH;
  }
  updateRealCoords();
};

const stopInteraction = () => {
  interaction.active = false;
  window.removeEventListener('mousemove', handleInteraction);
  window.removeEventListener('mouseup', stopInteraction);
};

const loadMediaImage = (media: Media) => {
  if (!media?.file_path) return;
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = media.file_path;
  img.onload = () => {
    imageElement.value = img;
    const containerRatio = Math.min(800 / img.naturalWidth, 500 / img.naturalHeight);
    state.canvas.w = img.naturalWidth * containerRatio;
    state.canvas.h = img.naturalHeight * containerRatio;
    nextTick(() => { render(); centerCropBox(); });
  };
};

const handleRotate = (deg: number) => {
  state.transform.rotate += deg;
  const oldW = state.canvas.w;
  state.canvas.w = state.canvas.h;
  state.canvas.h = oldW;

  nextTick(() => {
    centerCropBox();
    render();
  });
};

const centerCropBox = () => {
  const ratio = ASPECT_RATIOS[aspectRatio.value];
  state.crop.width = state.canvas.w * 0.6;
  state.crop.height = ratio ? state.crop.width / ratio : state.canvas.h * 0.6;

  if (state.crop.height > state.canvas.h) {
    state.crop.height = state.canvas.h;
    state.crop.width = ratio ? state.crop.height * ratio : state.crop.width;
  }
  state.crop.x = (state.canvas.w - state.crop.width) / 2;
  state.crop.y = (state.canvas.h - state.crop.height) / 2;
  updateRealCoords();
};

const render = () => {
  const canvas = canvasRef.value;
  if (!canvas || !imageElement.value) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = state.canvas.w;
  canvas.height = state.canvas.h;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((state.transform.rotate * Math.PI) / 180);
  ctx.scale(state.transform.flipH ? -1 : 1, state.transform.flipV ? -1 : 1);

  const filters: string[] = [];
  if (state.filters.blur > 0) filters.push(`blur(${state.filters.blur}px)`);
  if (state.filters.grayscale) filters.push(`grayscale(100%)`);
  ctx.filter = filters.join(' ') || 'none';

  const angle = ((state.transform.rotate % 360) + 360) % 360;
  const isVertical = angle === 90 || angle === 270;

  const drawW = isVertical ? state.canvas.h : state.canvas.w;
  const drawH = isVertical ? state.canvas.w : state.canvas.h;

  ctx.drawImage(imageElement.value, -drawW / 2, -drawH / 2, drawW, drawH);
  ctx.restore();
};

const updateRealCoords = () => {
  if (!imageElement.value) return;

  const img = imageElement.value;
  const cw = state.canvas.w;
  const ch = state.canvas.h;
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;

  const angle = ((state.transform.rotate % 360) + 360) % 360;
  const isVertical = angle === 90 || angle === 270;

  const scaleX = (isVertical ? nh : nw) / cw;
  const scaleY = (isVertical ? nw : nh) / ch;

  let x = state.crop.x;
  let y = state.crop.y;

  if (state.transform.flipH) {
    x = cw - (x + state.crop.width);
  }
  if (state.transform.flipV) {
    y = ch - (y + state.crop.height);
  }

  let finalX, finalY, finalW, finalH;
  const w = state.crop.width;
  const h = state.crop.height;

  if (angle === 90) {
    finalX = y * scaleX;
    finalY = (cw - (x + w)) * scaleY;
    finalW = h * scaleX;
    finalH = w * scaleY;
  } else if (angle === 180) {
    finalX = (cw - (x + w)) * scaleX;
    finalY = (ch - (y + h)) * scaleY;
    finalW = w * scaleX;
    finalH = h * scaleY;
  } else if (angle === 270) {
    finalX = (ch - (y + h)) * scaleX;
    finalY = x * scaleY;
    finalW = h * scaleX;
    finalH = w * scaleY;
  } else {
    finalX = x * scaleX;
    finalY = y * scaleY;
    finalW = w * scaleX;
    finalH = h * scaleY;
  }

  state.crop.realX = Math.round(finalX);
  state.crop.realY = Math.round(finalY);
  state.crop.realW = Math.round(finalW);
  state.crop.realH = Math.round(finalH);
};

watch([() => state.filters, () => state.transform], render, { deep: true });
watch(mediaData, (val) => val && loadMediaImage(val), { immediate: true });

const onSave = () => {
  updateRealCoords();
  const payload: SaveMediaPayload = {
    operations: {
      geometry: {
        rotation: state.transform.rotate,
        flipH: state.transform.flipH,
        flipV: state.transform.flipV,
        crop: { x: state.crop.realX, y: state.crop.realY, width: state.crop.realW, height: state.crop.realH }
      },
      adjustments: state.filters
    }
  };
  updateMedia({ payload, mediaId: id }, {
    onSuccess: () => { showToast('success', 'Image mise à jour'); router.back(); },
    onError: (err) => showToast('error', getErrorMessage(err))
  });
};
</script>

<template>
  <div class="space-y-8 w-fit min-w-full">
    <CompositionPageHeader>
      <template #content>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div class="flex gap-4 items-center">
            <div class="hover:cursor-pointer hover:text-primary" @click="$router.back()">
              <ArrowLeft />
            </div>
            <div class="space-y-2">
              <h1 class="text-huge font-black tracking-tighter leading-none"> <span class="text-primary italic">Médiathèque Galerie</span></h1>
              <p class="text-background opacity-80 text-lg font-medium">Gérez vos contenus visuels avec une précision chirurgicale.</p>
            </div>
          </div>
        </div>
      </template>
    </CompositionPageHeader>

    <div class="flex flex-col max-h-screen overflow-hidden card rounded-none w-fit min-w-full">
      <header class="border-b border-border px-6 py-3 flex justify-between items-center bg-sidebar z-20 shrink-0">
        <h1 class="text-lg font-bold tracking-tight text-text">Éditeur</h1>
        <div class="flex gap-2">
          <button @click="router.back()" class="px-4 py-2 text-sm font-medium rounded-md bg-transparent text-text">Annuler</button>
          <button @click="onSave" :disabled="isSaving" class="px-4 py-2 bg-primary text-text text-sm font-medium rounded-md flex items-center gap-2 shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-all text-white">
            <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
            <Check v-else class="w-4 h-4" />
            Enregistrer
          </button>
        </div>
      </header>

      <div class="flex flex-1 overflow-hidden">
        <aside class="w-72 border-r border-border p-6 overflow-y-auto bg-sidebar space-y-10 shrink-0">
          <div class="space-y-4">
            <div class="flex items-center gap-2 text-primary">
              <Scissors :size="16" />
              <h2 class="text-xs font-bold capitalize tracking-widest">Recadrage</h2>
            </div>
            <Select v-model="aspectRatio" @update:modelValue="centerCropBox" class="input-custom">
              <SelectTrigger class="w-full h-9 select-item-custom"><SelectValue /></SelectTrigger>
              <SelectContent class="border-border">
                <SelectItem
                  v-for="(v, k) in ASPECT_RATIOS"
                  :key="k"
                  :value="k"
                  class="select-item-custom [data-selected]:text-white hover:text-white"
                >{{ k === 'free' ? 'Libre' : k }}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-2 text-primary">
              <RotateCw :size="16" />
              <h2 class="text-xs font-bold capitalize tracking-widest">Orientation</h2>
            </div>
            <div class="grid grid-cols-4 gap-2">
              <button @click="handleRotate(-90)" class="border border-border h-9 flex items-center justify-center rounded-md hover:bg-gray-50 text-gray-600"><RotateCcw :size="14"/></button>
              <button @click="handleRotate(90)" class="border border-border h-9 flex items-center justify-center rounded-md hover:bg-gray-50 text-gray-600"><RotateCw :size="14"/></button>
              <button @click="state.transform.flipH = !state.transform.flipH" :class="['border border-border h-9 flex items-center justify-center rounded-md', state.transform.flipH ? 'bg-primary/10 border-primary text-primary' : '']"><FlipHorizontal :size="14"/></button>
              <button @click="state.transform.flipV = !state.transform.flipV" :class="['border border-border h-9 flex items-center justify-center rounded-md', state.transform.flipV ? 'bg-primary/10 border-primary text-primary' : '']"><FlipVertical :size="14"/></button>
            </div>
          </div>

          <div class="space-y-4">
            <div class="flex items-center gap-2 text-primary">
              <ImageIcon :size="16" />
              <h2 class="text-xs font-bold capitalize tracking-widest">Filtres</h2>
            </div>
            <div class="space-y-4">
              <div class="space-y-2">
                <label class="text-[10px] text-gray-400 font-bold">Flou: {{ state.filters.blur }}px</label>
                <input type="range" v-model.number="state.filters.blur" min="0" max="15" class="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary">
              </div>
              <label class="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer">
                <span class="text-xs font-medium">Noir et Blanc</span>
                <BaseSwitch v-model="state.filters.grayscale"/>
                <!-- <input type="checkbox" v-model="state.filters.grayscale" class="w-4 h-4 rounded text-primary"> -->
              </label>
            </div>
          </div>
        </aside>

        <main class="flex-1 bg-gray-50 flex items-center justify-center p-8 overflow-hidden relative">
          <div class="relative shadow-2xl bg-white select-none transition-all duration-300" :style="{ width: state.canvas.w + 'px', height: state.canvas.h + 'px' }">
            <canvas ref="canvasRef" class="w-full h-full block" />
            <div
              @mousedown="startInteraction($event, 'move')"
              class="absolute border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] cursor-move"
              :style="{ left: state.crop.x + 'px', top: state.crop.y + 'px', width: state.crop.width + 'px', height: state.crop.height + 'px' }">
              <div class="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-40">
                <div v-for="i in 9" :key="i" class="border-[0.5px] border-white"></div>
              </div>
              <div @mousedown="startInteraction($event, 'resize')" class="absolute -right-2 -bottom-2 w-5 h-5 bg-primary border-2 border-white rounded-full cursor-nwse-resize shadow-lg z-30"></div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>
