<script setup lang="ts">
import { ref, reactive, watch, onMounted, nextTick } from 'vue';
import {
  Scissors,
  RotateCw,
  Sliders,
  Sparkles,
  Wand2,
  Image as ImageIcon,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  Check,
  Undo2,
  ArrowLeft,
} from 'lucide-vue-next';
import type {
  Tool,
  AspectRatio,
  Transform,
  Filters,
  CropState,
  ImageState,
  ResizeHandle,
  Media,
  AppliedModifications,
  SaveMediaPayload,
} from '../../type/media';
import { useGetMedia, useUpdateMedia } from '../../hook/media';
import { useRoute } from 'vue-router';
import Tabs from '@/components/ui/tabs/Tabs.vue';
import TabsList from '@/components/ui/tabs/TabsList.vue';
import TabsTrigger from '@/components/ui/tabs/TabsTrigger.vue';
import TabsContent from '@/components/ui/tabs/TabsContent.vue';
import Select from '@/components/ui/select/Select.vue';
import SelectTrigger from '@/components/ui/select/SelectTrigger.vue';
import SelectValue from '@/components/ui/select/SelectValue.vue';
import SelectContent from '@/components/ui/select/SelectContent.vue';
import SelectItem from '@/components/ui/select/SelectItem.vue';
import CompositionPageHeader from '@/components/composition/CompositionPageHeader.vue';
import router from '../../router';
import { showToast } from '../../lib/toast';
import { getErrorMessage } from '../../lib/errorMessage';

const route = useRoute()
const id = Number(route.params.id)
const { data: mediaData } = useGetMedia(id)
const { mutate: updateMedia, isPending: isSaving } = useUpdateMedia();

watch(mediaData, (newData) => {
  if (newData) {
    loadMediaImage(newData);
  }
}, { immediate: true });


const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const cropOverlayRef = ref<HTMLDivElement | null>(null);
const maskCanvas = document.createElement('canvas'); // Hors écran
const maskCtx = maskCanvas.getContext('2d');


const activeTool = ref<Tool>('remove-bg');
const imageState = reactive<ImageState>({
  url: null,
  loaded: false,
  originalWidth: 0,
  originalHeight: 0,
});

const transform = reactive<Transform>({
  rotate: 0,
  flipH: false,
  flipV: false,
  zoom: 1,
});

const filters = reactive<Filters>({
  blur: 0,
  grayscale: false,
  brightness: 100,
  contrast: 100,
  saturation: 100,
});

const cropState = reactive<CropState>({
  x: 50,
  y: 50,
  width: 300,
  height: 300,
  realX: 0,
  realY: 0,
  realWidth: 0,
  realHeight: 0,
});

const aspectRatio = ref<AspectRatio>('free');
const imageElement = ref<HTMLImageElement | null>(null);
const isDragging = ref(false);
const isResizing = ref(false);
const activeHandle = ref<ResizeHandle | null>(null);
// MediaUpdateView.vue
const dragStart = reactive({
  x: 0,
  y: 0,
  cropX: 0,
  cropY: 0,
  cropWidth: 0,  // Ajoutez ceci
  cropHeight: 0  // Ajoutez ceci
});

const tools = [
  { id: 'remove-bg' as Tool, icon: Wand2, label: 'Remove BG' },
  { id: 'crop' as Tool, icon: Scissors, label: 'Crop' },
  { id: 'refine' as Tool, icon: Sparkles, label: 'Refine' },
  { id: 'rotate' as Tool, icon: RotateCw, label: 'Rotate' },
  { id: 'adjust' as Tool, icon: Sliders, label: 'Adjust' },
  { id: 'filters' as Tool, icon: ImageIcon, label: 'Filters' },
];

const aspectRatios: { value: AspectRatio; label: string }[] = [
  { value: 'free', label: 'Free' },
  { value: '1:1', label: '1:1' },
  { value: '16:9', label: '16:9' },
  { value: '4:3', label: '4:3' },
  { value: '3:2', label: '3:2' },
];

const canvasWidth = ref(800);
const canvasHeight = ref(600);

const bgRemovalMode = ref<'select' | 'restore' | 'erase'>('select');
const tolerance = ref(20);
const brushSize = ref(15);
const hardness = ref(100);
const removedPixels = reactive(new Set<string>());
const appliedRemovedPixels = reactive(new Set<string>());
const maskHistory = ref<ImageData[]>([]);

const appliedModifications = reactive<AppliedModifications>({
  transform: {
    rotate: 0,
    flipH: false,
    flipV: false,
    zoom: 1,
  },
  filters: {
    blur: 0,
    grayscale: false,
    brightness: 100,
    contrast: 100,
    saturation: 100,
  },
  bgRemoved: false,
});

onMounted(() => {
  if (mediaData.value) {
    loadMediaImage(mediaData.value);
  } else {
    loadSampleImage();
  }
});

function loadMediaImage(media: Media) {
  if (!media || !media.file_path) {
    console.error('Media ou file_path invalide:', media);
    return;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = media.file_path;

  img.onload = () => {
    initializeImage(img, media.file_path);
  };

  img.onerror = () => {
    console.error('Échec du chargement de l\'image depuis le média:', media);
  };
}

async function loadSampleImage() {
  const filePath = mediaData.value?.file_path;
  if (!filePath) {
    console.error('Aucun chemin de fichier disponible pour le média');
    return;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = filePath;

  img.onload = () => {
    initializeImage(img, img.src);
  };

  img.onerror = () => {
    console.error('Échec du chargement de l\'image');
  };
}

function initializeImage(img: HTMLImageElement, url: string) {
  imageElement.value = img;
  imageState.url = url;
  imageState.loaded = true;
  imageState.originalWidth = img.naturalWidth;
  imageState.originalHeight = img.naturalHeight;

  // Le canvas support est fixe (ex: 800x600) pour servir de conteneur
  canvasWidth.value = 800;
  canvasHeight.value = 600;

  // Initialiser le canvas de masque à la taille de l'image originale
  maskCanvas.width = img.naturalWidth;
  maskCanvas.height = img.naturalHeight;
  if (maskCtx) {
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
  }

  // Centrer le crop box par défaut
  cropState.width = 300;
  cropState.height = 300;
  cropState.x = (canvasWidth.value - cropState.width) / 2;
  cropState.y = (canvasHeight.value - cropState.height) / 2;

  nextTick(() => {
    renderCanvas();
  });
}

function renderCanvas() {
  if (!canvasRef.value || !imageElement.value) return;

  const canvas = canvasRef.value;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = canvasWidth.value;
  canvas.height = canvasHeight.value;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  // 1. Centrer le canvas
  ctx.translate(canvas.width / 2, canvas.height / 2);

  // 2. Appliquer les transformations
  const totalRotation = (appliedModifications.transform.rotate + transform.rotate) % 360;
  ctx.rotate((totalRotation * Math.PI) / 180);

  const totalFlipH = appliedModifications.transform.flipH !== transform.flipH;
  const totalFlipV = appliedModifications.transform.flipV !== transform.flipV;
  ctx.scale(totalFlipH ? -1 : 1, totalFlipV ? -1 : 1);

  const totalZoom = appliedModifications.transform.zoom * transform.zoom;

  // 3. Calculer l'échelle pour "Contain" l'image sans étirement
  const isOddRotation = Math.round(totalRotation / 90) % 2 !== 0;
  const origW = imageState.originalWidth;
  const origH = imageState.originalHeight;

  // Dimensions "visuelles" après rotation
  const visualW = isOddRotation ? origH : origW;
  const visualH = isOddRotation ? origW : origH;

  const baseScale = Math.min(canvas.width / visualW, canvas.height / visualH);
  const finalScale = baseScale * totalZoom;

  ctx.scale(finalScale, finalScale);

  // 4. Appliquer les filtres
  const finalFilters = {
    blur: Math.max(appliedModifications.filters.blur, filters.blur),
    grayscale: appliedModifications.filters.grayscale || filters.grayscale,
    brightness: (appliedModifications.filters.brightness / 100) * (filters.brightness / 100) * 100,
    contrast: (appliedModifications.filters.contrast / 100) * (filters.contrast / 100) * 100,
    saturation: (appliedModifications.filters.saturation / 100) * (filters.saturation / 100) * 100,
  };

  let filterString = '';
  if (finalFilters.blur > 0) filterString += `blur(${finalFilters.blur}px) `;
  if (finalFilters.brightness !== 100) filterString += `brightness(${finalFilters.brightness}%) `;
  if (finalFilters.contrast !== 100) filterString += `contrast(${finalFilters.contrast}%) `;
  if (finalFilters.saturation !== 100) filterString += `saturate(${finalFilters.saturation}%) `;
  if (finalFilters.grayscale) filterString += 'grayscale(100%) ';
  ctx.filter = filterString.trim() || 'none';

  // 5. Dessiner l'image (origW et origH sont les dimensions natives)
  ctx.drawImage(imageElement.value, -origW / 2, -origH / 2, origW, origH);

  // 6. Masque Remove BG
  if (appliedModifications.bgRemoved || removedPixels.size > 0 || appliedRemovedPixels.size > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    ctx.filter = 'none';
    ctx.drawImage(maskCanvas, -origW / 2, -origH / 2, origW, origH);
    ctx.restore();
  }

  ctx.restore();
  updateRealCropCoordinates();
}

// function updateRealCropCoordinates() {
//   if (!imageElement.value) return;

//   const scaleX = imageState.originalWidth / canvasWidth.value;
//   const scaleY = imageState.originalHeight / canvasHeight.value;

//   cropState.realX = Math.round(cropState.x * scaleX);
//   cropState.realY = Math.round(cropState.y * scaleY);
function updateRealCropCoordinates() {
  if (!imageElement.value || !canvasRef.value) return;

  const totalRotation = (appliedModifications.transform.rotate + transform.rotate) % 360;
  const totalZoom = appliedModifications.transform.zoom * transform.zoom;

  const origW = imageState.originalWidth;
  const origH = imageState.originalHeight;

  const isOddRotation = Math.round(totalRotation / 90) % 2 !== 0;
  const visualW = isOddRotation ? origH : origW;
  const visualH = isOddRotation ? origW : origH;

  const baseScale = Math.min(canvasWidth.value / visualW, canvasHeight.value / visualH);
  const finalScale = baseScale * totalZoom;

  const centerX = canvasWidth.value / 2;
  const centerY = canvasHeight.value / 2;

  const mapPoint = (cx: number, cy: number) => {
    // 1. Relatif au centre du canvas
    let x = cx - centerX;
    let y = cy - centerY;

    // 2. Rotation inverse
    const rad = (-totalRotation * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;

    // 3. Mirror inverse
    const totalFlipH = appliedModifications.transform.flipH !== transform.flipH;
    const totalFlipV = appliedModifications.transform.flipV !== transform.flipV;
    const mx = totalFlipH ? -rx : rx;
    const my = totalFlipV ? -ry : ry;

    // 4. Échelle inverse
    const finalX = mx / finalScale + origW / 2;
    const finalY = my / finalScale + origH / 2;

    return { x: finalX, y: finalY };
  };

  const p1 = mapPoint(cropState.x, cropState.y);
  const p2 = mapPoint(cropState.x + cropState.width, cropState.y + cropState.height);

  cropState.realX = Math.round(Math.min(p1.x, p2.x));
  cropState.realY = Math.round(Math.min(p1.y, p2.y));
  cropState.realWidth = Math.round(Math.abs(p2.x - p1.x));
  cropState.realHeight = Math.round(Math.abs(p2.y - p1.y));

  // Sécurité
  cropState.realX = Math.max(0, Math.min(cropState.realX, origW));
  cropState.realY = Math.max(0, Math.min(cropState.realY, origH));
  if (cropState.realX + cropState.realWidth > origW) cropState.realWidth = origW - cropState.realX;
  if (cropState.realY + cropState.realHeight > origH) cropState.realHeight = origH - cropState.realY;
}


function rotate90(direction: 1 | -1) {
  transform.rotate = (transform.rotate + direction * 90) % 360;
  if (transform.rotate < 0) transform.rotate += 360;

  // Recalculer le fit optimal basé sur la rotation TOTALE
  const totalRotation = (appliedModifications.transform.rotate + transform.rotate) % 360;
  const isOddRotation = Math.round(totalRotation / 90) % 2 !== 0;

  const visualW = isOddRotation ? imageState.originalHeight : imageState.originalWidth;
  const visualH = isOddRotation ? imageState.originalWidth : imageState.originalHeight;

  const maxWidth = 800;
  const maxHeight = 600;
  const ratio = Math.min(maxWidth / visualW, maxHeight / visualH);

  canvasWidth.value = visualW * ratio;
  canvasHeight.value = visualH * ratio;

  // Réinitialiser le cadre de crop pour l'adapter aux nouvelles dimensions
  cropState.width = canvasWidth.value * 0.6;
  cropState.height = canvasHeight.value * 0.6;
  cropState.x = (canvasWidth.value - cropState.width) / 2;
  cropState.y = (canvasHeight.value - cropState.height) / 2;
}

function flipHorizontal() {
  transform.flipH = !transform.flipH;
}

function flipVertical() {
  transform.flipV = !transform.flipV;
}

function applyModifications() {
  appliedModifications.transform.rotate = (appliedModifications.transform.rotate + transform.rotate) % 360;
  if (appliedModifications.transform.rotate < 0) appliedModifications.transform.rotate += 360;

  appliedModifications.transform.flipH = appliedModifications.transform.flipH !== transform.flipH;
  appliedModifications.transform.flipV = appliedModifications.transform.flipV !== transform.flipV;
  appliedModifications.transform.zoom *= transform.zoom;

  appliedModifications.filters.blur = Math.max(appliedModifications.filters.blur, filters.blur);
  appliedModifications.filters.grayscale = appliedModifications.filters.grayscale || filters.grayscale;
  appliedModifications.filters.brightness = (appliedModifications.filters.brightness / 100) * (filters.brightness / 100) * 100;
  appliedModifications.filters.contrast = (appliedModifications.filters.contrast / 100) * (filters.contrast / 100) * 100;
  appliedModifications.filters.saturation = (appliedModifications.filters.saturation / 100) * (filters.saturation / 100) * 100;

  if (removedPixels.size > 0) {
    removedPixels.forEach((pixel) => {
      appliedRemovedPixels.add(pixel);
    });
    appliedModifications.bgRemoved = true;
  }

  transform.rotate = 0;
  transform.flipH = false;
  transform.flipV = false;
  transform.zoom = 1;

  filters.blur = 0;
  filters.grayscale = false;
  filters.brightness = 100;
  filters.contrast = 100;
  filters.saturation = 100;

  removedPixels.clear();

  // Si on a appliqué une rotation impaire, les dimensions du canvas sont déjà permutées
  // Rien de plus à faire ici car rotate90 s'en est chargé visuellement
  renderCanvas();
}

function applyCrop() {
  if (!canvasRef.value || !imageElement.value) return;

  applyModifications();

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.width = cropState.realWidth;
  canvas.height = cropState.realHeight;

  ctx.drawImage(
    imageElement.value,
    cropState.realX,
    cropState.realY,
    cropState.realWidth,
    cropState.realHeight,
    0,
    0,
    cropState.realWidth,
    cropState.realHeight
  );

  const croppedImage = new Image();
  croppedImage.src = canvas.toDataURL();
  croppedImage.onload = () => {
    imageElement.value = croppedImage;
    imageState.originalWidth = cropState.realWidth;
    imageState.originalHeight = cropState.realHeight;

    const maxWidth = 800;
    const maxHeight = 600;
    const ratio = Math.min(maxWidth / cropState.realWidth, maxHeight / cropState.realHeight);

    canvasWidth.value = cropState.realWidth * ratio;
    canvasHeight.value = cropState.realHeight * ratio;

    cropState.width = canvasWidth.value * 0.6;
    cropState.height = canvasHeight.value * 0.6;
    cropState.x = (canvasWidth.value - cropState.width) / 2;
    cropState.y = (canvasHeight.value - cropState.height) / 2;

    nextTick(() => {
      renderCanvas();
    });
  };
}

function colorDistance(c1: number[], c2: number[]): number {
  const r1 = c1[0] ?? 0;
  const g1 = c1[1] ?? 0;
  const b1 = c1[2] ?? 0;
  const r2 = c2[0] ?? 0;
  const g2 = c2[1] ?? 0;
  const b2 = c2[2] ?? 0;

  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function floodFillBG(x: number, y: number) {
  if (!canvasRef.value || !imageElement.value || !maskCtx) return;

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = canvasWidth.value;
  tempCanvas.height = canvasHeight.value;

  const ctx = tempCanvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  ctx.drawImage(imageElement.value, 0, 0, canvasWidth.value, canvasHeight.value);
  const imageData = ctx.getImageData(0, 0, canvasWidth.value, canvasHeight.value);
  const data = imageData.data;

  const pixelIndex = (y * canvasWidth.value + x) * 4;
  const targetColor: number[] = [
    data[pixelIndex] ?? 0,
    data[pixelIndex + 1] ?? 0,
    data[pixelIndex + 2] ?? 0
  ];

  const queue: [number, number][] = [[x, y]];
  const visited = new Set<string>();

  const scaleX = imageState.originalWidth / canvasWidth.value;
  const scaleY = imageState.originalHeight / canvasHeight.value;

  maskCtx.save();
  maskCtx.fillStyle = 'black';

  while (queue.length > 0) {
    const [cx, cy] = queue.shift()! ;
    const key = `${cx},${cy}`;

    if (visited.has(key)) continue;
    visited.add(key);

    if (cx < 0 || cx >= canvasWidth.value || cy < 0 || cy >= canvasHeight.value) continue;

    const idx = (cy * canvasWidth.value + cx) * 4;
    const pixelColor: number[] = [
      data[idx] ?? 0,
      data[idx + 1] ?? 0,
      data[idx + 2] ?? 0
    ];

    if (colorDistance(pixelColor, targetColor) <= tolerance.value) {
      // Dessiner sur le masque original
      maskCtx.fillRect(cx * scaleX, cy * scaleY, scaleX, scaleY);
      removedPixels.add('modified');

      queue.push([cx + 1, cy]);
      queue.push([cx - 1, cy]);
      queue.push([cx, cy + 1]);
      queue.push([cx, cy - 1]);
    }
  }
  maskCtx.restore();

  renderCanvas();
}

function brushRemoveBG(x: number, y: number) {
  if (!maskCtx || !imageElement.value) return;

  const radius = brushSize.value / 2;
  const hardnessValue = hardness.value / 100;

  // Conversion des coordonnées du canvas d'affichage vers l'image originale
  const scaleX = imageState.originalWidth / canvasWidth.value;
  const scaleY = imageState.originalHeight / canvasHeight.value;

  const origX = x * scaleX;
  const origY = y * scaleY;
  const origRadius = radius * scaleX;

  maskCtx.save();
  maskCtx.beginPath();
  const gradient = maskCtx.createRadialGradient(origX, origY, 0, origX, origY, origRadius);
  gradient.addColorStop(0, `rgba(0, 0, 0, 1)`);
  gradient.addColorStop(hardnessValue, `rgba(0, 0, 0, 1)`);
  gradient.addColorStop(1, `rgba(0, 0, 0, 0)`);

  maskCtx.fillStyle = gradient;
  maskCtx.arc(origX, origY, origRadius, 0, Math.PI * 2);
  maskCtx.fill();
  maskCtx.restore();

  // On garde un moyen de savoir si le masque a été modifié pour le rendu (optionnel si on check le contenu du canvas)
  removedPixels.add('modified');

  renderCanvas();
}

function brushRestoreBG(x: number, y: number) {
  if (!maskCtx || !imageElement.value) return;

  const radius = brushSize.value / 2;

  const scaleX = imageState.originalWidth / canvasWidth.value;
  const scaleY = imageState.originalHeight / canvasHeight.value;

  const origX = x * scaleX;
  const origY = y * scaleY;
  const origRadius = radius * scaleX;

  maskCtx.save();
  maskCtx.globalCompositeOperation = 'destination-out';
  maskCtx.beginPath();
  maskCtx.arc(origX, origY, origRadius, 0, Math.PI * 2);
  maskCtx.fill();
  maskCtx.restore();

  renderCanvas();
}

function undoBGRemoval() {
  if (maskHistory.value.length > 0) {
    maskHistory.value.pop();
    renderCanvas();
  }
}

function resetBGRemoval() {
  if (maskCtx) {
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
  }
  removedPixels.clear();
  maskHistory.value = [];
  renderCanvas();
}

function handleCanvasMouseDown(e: MouseEvent) {
  if (activeTool.value === 'remove-bg') {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) * (canvasWidth.value / rect.width));
    const y = Math.round((e.clientY - rect.top) * (canvasHeight.value / rect.height));

    if (bgRemovalMode.value === 'select') {
      floodFillBG(x, y);
    } else if (bgRemovalMode.value === 'erase') {
      brushRemoveBG(x, y);
    } else if (bgRemovalMode.value === 'restore') {
      brushRestoreBG(x, y);
    }
  }
}

function handleCanvasMouseMove(e: MouseEvent) {
  if (activeTool.value === 'remove-bg' && (bgRemovalMode.value === 'erase' || bgRemovalMode.value === 'restore')) {
    const canvas = canvasRef.value;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) * (canvasWidth.value / rect.width));
    const y = Math.round((e.clientY - rect.top) * (canvasHeight.value / rect.height));

    if (e.buttons === 1) {
      if (bgRemovalMode.value === 'erase') {
        brushRemoveBG(x, y);
      } else if (bgRemovalMode.value === 'restore') {
        brushRestoreBG(x, y);
      }
    }
  }
}

function startDrag(e: MouseEvent) {
  if (activeTool.value !== 'crop') return;

  const target = e.target as HTMLElement;
  if (target.classList.contains('resize-handle')) return;

  isDragging.value = true;
  dragStart.x = e.clientX;
  dragStart.y = e.clientY;
  dragStart.cropX = cropState.x;
  dragStart.cropY = cropState.y;
}

function startResize(e: MouseEvent, handle: ResizeHandle) {
  e.stopPropagation();
  isResizing.value = true;
  activeHandle.value = handle;
  dragStart.x = e.clientX;
  dragStart.y = e.clientY;
  dragStart.cropX = cropState.x;
  dragStart.cropY = cropState.y;
  dragStart.cropWidth = cropState.width;  // Capturer la largeur initiale
  dragStart.cropHeight = cropState.height; // Capturer la hauteur initiale
}

function onMouseMove(e: MouseEvent) {
  if (isDragging.value) {
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    cropState.x = Math.max(0, Math.min(canvasWidth.value - cropState.width, dragStart.cropX + dx));
    cropState.y = Math.max(0, Math.min(canvasHeight.value - cropState.height, dragStart.cropY + dy));

    updateRealCropCoordinates();
  } else if (isResizing.value && activeHandle.value) {
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    const handle = activeHandle.value;
    let newX = dragStart.cropX;
    let newY = dragStart.cropY;
    // On part des dimensions au moment du clic (stockées dans dragStart si besoin,
    // ou on utilise des variables temporaires stables)
    let newWidth = cropState.width;
    let newHeight = cropState.height;

    // Calcul plus stable basé sur le déplacement initial
    if (handle.includes('w')) {
      newX = dragStart.cropX + dx;
      newWidth = dragStart.cropWidth - dx;
    } else if (handle.includes('e')) {
      newWidth = Math.max(50, dragStart.cropWidth + dx);
    }

    if (handle.includes('n')) {
      newY = dragStart.cropY + dy;
      newHeight = dragStart.cropHeight - dy;
    } else if (handle.includes('s')) {
      newHeight = Math.max(50, dragStart.cropHeight + dy);
    }

    // Contraintes de bordures du Canvas
    if (newX < 0) { newWidth += newX; newX = 0; }
    if (newY < 0) { newHeight += newY; newY = 0; }
    if (newX + newWidth > canvasWidth.value) newWidth = canvasWidth.value - newX;
    if (newY + newHeight > canvasHeight.value) newHeight = canvasHeight.value - newY;

    cropState.x = newX;
    cropState.y = newY;
    cropState.width = newWidth;
    cropState.height = newHeight;

    updateRealCropCoordinates();
  }
}

function onMouseUp() {
  isDragging.value = false;
  isResizing.value = false;
  activeHandle.value = null;
}

function getAspectRatioValue(ratio: AspectRatio): number {
  const ratios: Record<AspectRatio, number> = {
    'free': 1,
    '1:1': 1,
    '16:9': 16 / 9,
    '4:3': 4 / 3,
    '3:2': 3 / 2,
  };
  return ratios[ratio];
}

watch(() => transform.rotate, renderCanvas);
watch(() => transform.flipH, renderCanvas);
watch(() => transform.flipV, renderCanvas);
watch(() => transform.zoom, renderCanvas);
watch(() => filters.blur, renderCanvas);
watch(() => filters.grayscale, renderCanvas);
watch(() => filters.brightness, renderCanvas);
watch(() => filters.contrast, renderCanvas);
watch(() => filters.saturation, renderCanvas);

watch(aspectRatio, (newRatio) => {
  if (newRatio !== 'free') {
    const ratio = getAspectRatioValue(newRatio);
    cropState.height = cropState.width / ratio;

    if (cropState.y + cropState.height > canvasHeight.value) {
      cropState.height = canvasHeight.value - cropState.y;
      cropState.width = cropState.height * ratio;
    }

    updateRealCropCoordinates();
  }
});

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
});

const saveModifications = async () => {
  const currentMedia = mediaData.value;
  if (!currentMedia?.id) return;

  const payload: SaveMediaPayload = {
    operations: {
      geometry: {
        rotation: (appliedModifications.transform.rotate + transform.rotate) % 360,
        flipH: appliedModifications.transform.flipH !== transform.flipH,
        flipV: appliedModifications.transform.flipV !== transform.flipV,
        // Les coordonnées de crop sont en pixels de l'image originale
        // Elles sont calculées par updateRealCropCoordinates() qui convertit
        // les coordonnées du canvas affiché vers l'image originale
        crop: {
          x: cropState.realX,
          y: cropState.realY,
          width: cropState.realWidth,
          height: cropState.realHeight
        }
      },
      adjustments: {
        brightness: (appliedModifications.filters.brightness / 100) * (filters.brightness / 100), // En facteur (1.0 = normal)
        contrast: (appliedModifications.filters.contrast / 100) * (filters.contrast / 100),
        saturation: (appliedModifications.filters.saturation / 100) * (filters.saturation / 100),
        blur: Math.max(appliedModifications.filters.blur, filters.blur),
        grayscale: appliedModifications.filters.grayscale || filters.grayscale
      },
      bgRemoved: appliedModifications.bgRemoved || removedPixels.size > 0
    }
  };


  updateMedia({payload, mediaId: currentMedia.id}, {
    onSuccess: () => {
      showToast('success', 'Image mise à jour avec succès');
      router.back();
    },
    onError: (error) => {
      showToast('error', `${getErrorMessage(error)}`);
    }
  });
};
</script>

<template >
  <div class="space-y-8 w-fit min-w-full">

    <CompositionPageHeader>
      <template #content>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div class="flex gap-4 items-center">
            <div
              class="hover:cursor-pointer hover:text-primary"
              @click="$router.back()"
            >
              <ArrowLeft />
          </div>
            <div class="space-y-2">
              <h1 class="text-huge font-black tracking-tighter leading-none"> <span class="text-primary italic">Médiathèque Galerie</span></h1>
              <p class="text-background opacity-80 text-lg font-medium">Gérez vos contenus visuels avec une précision chirurgicale.</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
          </div>
        </div>
      </template>
    </CompositionPageHeader>

    <div class="card rounded-none w-fit min-w-full overflow-x-auto custom-scrollbar">
      <div class="border-b border-border px-6 py-4 flex items-center justify-between">
        <h1 class="h2 font-semibold text-text">Edit Image</h1>
        <div class="flex items-center gap-3">
            <button @click="$router.back()" class="px-4 py-2 text-text hover:bg-background rounded-lg transition-colors">
              Cancel
            </button>
            <button
              @click="saveModifications"
              :disabled="isSaving"
              class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <component
                :is="isSaving ? 'Loader2' : Check"
                :class="['w-4 h-4', isSaving ? 'animate-spin' : '']"
                :stroke-width="3"
              />
              {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
                    </div>
      </div>
      <Tabs v-model="activeTool">

        <div class="flex">

          <TabsList class="h-full ">

            <div class="h-full w-16  border-r border-border flex flex-col items-center py-4 space-y-2">

              <TabsTrigger
                v-for="tool in tools"
                :key="tool.id"
                :value="tool.id"
                :class="[
                  'w-12 h-12 rounded-lg flex items-center justify-center transition-colors',
                  'text-text hover:bg-background',
                  'data-[state=active]:bg-primary data-[state=active]text-white'
                ]"
              >
                <component :is="tool.icon" :size="20" />
              </TabsTrigger>
            </div>
          </TabsList>



          <div class="col-span-3 min-w-[280px] border-r border-border p-6 overflow-y-auto">
            <TabsContent value="remove-bg">
              <div class="space-y-6">
                <h2 class="text-xl font-semibold text-text">Remove BG</h2>

                <div>
                  <h3 class="text-sm font-medium text-text mb-3">Tools</h3>
                  <div class="grid grid-cols-3 gap-2">
                    <button
                      @click="bgRemovalMode = 'select'"
                      :class="[
                        'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        bgRemovalMode === 'select'
                          ? 'bg-primary text-white'
                          : 'bg-background text-text hover:bg-gray-200'
                      ]"
                    >
                      Select
                    </button>
                    <button
                      @click="bgRemovalMode = 'erase'"
                      :class="[
                        'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        bgRemovalMode === 'erase'
                          ? 'bg-primary text-white'
                          : 'bg-background text-text hover:bg-gray-200'
                      ]"
                    >
                      Erase
                    </button>
                    <button
                      @click="bgRemovalMode = 'restore'"
                      :class="[
                        'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        bgRemovalMode === 'restore'
                          ? 'bg-primary text-white'
                          : 'bg-background text-text hover:bg-gray-200'
                      ]"
                    >
                      Restore
                    </button>
                  </div>
                </div>

                <div v-if="bgRemovalMode === 'select'">
                  <label class="block text-sm italic text-text mb-2">
                    Tolerance: {{ tolerance }}
                  </label>
                  <input
                    type="range"
                    v-model.number="tolerance"
                    min="0"
                    max="100"
                    class="w-full"
                  />
                  <p class="text-xs text-text-muted mt-2">Click on the background to remove it</p>
                </div>

                <div v-if="bgRemovalMode === 'erase' || bgRemovalMode === 'restore'">
                  <label class="block text-sm italic text-text mb-2">
                    Brush size: {{ brushSize }}px
                  </label>
                  <input
                    type="range"
                    v-model.number="brushSize"
                    min="5"
                    max="100"
                    class="w-full"
                  />

                  <label class="block text-sm italic text-text mb-2 mt-4">
                    Hardness: {{ hardness }}%
                  </label>
                  <input
                    type="range"
                    v-model.number="hardness"
                    min="10"
                    max="100"
                    class="w-full"
                  />
                </div>

                <div class="flex gap-2 pt-4">
                  <button
                    @click="undoBGRemoval"
                    class="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-background flex items-center justify-center gap-2"
                  >
                    <Undo2 :size="18" />
                  </button>
                  <button
                    @click="resetBGRemoval"
                    class="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-background"
                  >
                    Reset
                  </button>
                </div>

                <button
                  @click="applyModifications"
                  class="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                >
                  Apply
                </button>
              </div>

            </TabsContent>

            <TabsContent value="crop">

              <div class="space-y-6">
                <h2 class="text-xl font-semibold text-text">Crop</h2>

                <div>
                  <label class="block text-sm italic text-text mb-2">Aspect ratio</label>
                  <Select v-model="aspectRatio">
                    <SelectTrigger class="h-8 text-p13 border border-border input-custom">
                      <SelectValue placeholder="Aspect ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        v-for="ratio in aspectRatios"
                        :key="ratio.value"
                        :value="ratio.value"
                        class="select-item-custom"
                      >
                        {{ ratio.label }}
                      </SelectItem>

                    </SelectContent>
                  </Select>
                  <!-- <select
                    v-model="aspectRatio"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option v-for="ratio in aspectRatios" :key="ratio.value" :value="ratio.value">
                      {{ ratio.label }}
                    </option>
                  </select> -->
                </div>

                <div>
                  <h3 class="text-sm italic text-text mb-3">Rotate</h3>
                  <div class="flex gap-2">
                    <button
                      @click="rotate90(-1)"
                      class="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-background flex items-center justify-center gap-2"
                    >
                      <RotateCcw :size="18" />
                    </button>
                    <button
                      @click="rotate90(1)"
                      class="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-background flex items-center justify-center gap-2"
                    >
                      <RotateCw :size="18" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 class="text-sm italic text-text mb-3">Flip</h3>
                  <div class="flex gap-2">
                    <button
                      @click="flipHorizontal"
                      :class="[
                        'flex-1 px-4 py-2 border rounded-lg flex items-center justify-center gap-2',
                        transform.flipH ? 'bg-background border-border' : 'border-border hover:bg-background'
                      ]"
                    >
                      <FlipHorizontal :size="18" />
                    </button>
                    <button
                      @click="flipVertical"
                      :class="[
                        'flex-1 px-4 py-2 border rounded-lg flex items-center justify-center gap-2',
                        transform.flipV ? 'bg-background border-border' : 'border-border hover:bg-background'
                      ]"
                    >
                      <FlipVertical :size="18" />
                    </button>
                  </div>
                </div>

                <div>
                  <label class="block text-sm italic text-text mb-2">
                    Rotation: {{ transform.rotate }}°
                  </label>
                  <input
                    type="range"
                    v-model.number="transform.rotate"
                    min="0"
                    max="360"
                    class="w-full"
                  />
                </div>

                <button
                  @click="applyCrop"
                  class="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                >
                  Apply Crop
                </button>
              </div>

            </TabsContent>
            <TabsContent value="refine">
              <div class="space-y-6">
                <h2 class="text-xl font-semibold text-text">Refine</h2>
                <p class="text-sm text-text">Refinement tools (demo)</p>
              </div>
            </TabsContent>
            <TabsContent value="rotate">
              <div class="space-y-6">
                <h2 class="text-xl font-semibold text-text">Rotate</h2>

                <div>
                  <label class="block text-sm italic text-text mb-2">
                    Angle: {{ transform.rotate }}°
                  </label>
                  <input
                    type="range"
                    v-model.number="transform.rotate"
                    min="0"
                    max="360"
                    class="w-full"
                  />
                </div>

                <div class="flex gap-2">
                  <button
                    @click="rotate90(-1)"
                    class="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-background"
                  >
                    -90°
                  </button>
                  <button
                    @click="rotate90(1)"
                    class="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-background"
                  >
                    +90°
                  </button>
                </div>

                <div class="space-y-2">
                  <button
                    @click="flipHorizontal"
                    class="w-full px-4 py-2 border border-border rounded-lg hover:bg-background flex items-center justify-center gap-2"
                  >
                    <FlipHorizontal :size="18" />
                    Flip Horizontal
                  </button>
                  <button
                    @click="flipVertical"
                    class="w-full px-4 py-2 border border-border rounded-lg hover:bg-background flex items-center justify-center gap-2"
                  >
                    <FlipVertical :size="18" />
                    Flip Vertical
                  </button>
                </div>

                <button
                  @click="applyModifications"
                  class="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                >
                  Apply
                </button>
              </div>
            </TabsContent>
            <TabsContent value="adjust">
              <div class="space-y-6">
                <h2 class="text-xl font-semibold text-text">Adjust</h2>

                <div>
                  <label class="block text-sm italic text-text mb-2">
                    Brightness: {{ filters.brightness }}%
                  </label>
                  <input
                    type="range"
                    v-model.number="filters.brightness"
                    min="0"
                    max="200"
                    class="w-full"
                  />
                </div>

                <div>
                  <label class="block text-sm italic text-text mb-2">
                    Contrast: {{ filters.contrast }}%
                  </label>
                  <input
                    type="range"
                    v-model.number="filters.contrast"
                    min="0"
                    max="200"
                    class="w-full"
                  />
                </div>

                <div>
                  <label class="block text-sm italic text-text mb-2">
                    Saturation: {{ filters.saturation }}%
                  </label>
                  <input
                    type="range"
                    v-model.number="filters.saturation"
                    min="0"
                    max="200"
                    class="w-full"
                  />
                </div>

                <div>
                  <label class="block text-sm italic text-text mb-2">
                    Zoom: {{ transform.zoom.toFixed(2) }}x
                  </label>
                  <input
                    type="range"
                    v-model.number="transform.zoom"
                    min="0.5"
                    max="3"
                    step="0.1"
                    class="w-full"
                  />
                </div>

                <button
                  @click="applyModifications"
                  class="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                >
                  Apply
                </button>
              </div>
            </TabsContent>
            <TabsContent value="filters">
              <div class="space-y-6">
                <h2 class="text-xl font-semibold text-text">Filters</h2>

                <div>
                  <label class="block text-sm italic text-text mb-2">
                    Blur: {{ filters.blur }}px
                  </label>
                  <input
                    type="range"
                    v-model.number="filters.blur"
                    min="0"
                    max="20"
                    class="w-full"
                  />
                </div>

                <div class="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="grayscale"
                    v-model="filters.grayscale"
                    class="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <label for="grayscale" class="text-sm italic text-text">
                    Grayscale
                  </label>
                </div>

                <button
                  @click="applyModifications"
                  class="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                >
                  Apply
                </button>
              </div>
            </TabsContent>




          </div>

          <div class="flex-1 flex flex-col ">
            <div class="flex-1 flex items-center justify-center p-8 bg-background">
              <div
                ref="containerRef"
                class="relative"
                :style="{
                  width: `${canvasWidth}px`,
                  height: `${canvasHeight}px`
                }"
              >
                <canvas
                  ref="canvasRef"
                  class="border border-border bg-white shadow-sm"
                  @mousedown="handleCanvasMouseDown"
                  @mousemove="handleCanvasMouseMove"
                  :class="activeTool === 'remove-bg' && bgRemovalMode === 'select' ? 'cursor-crosshair' : 'cursor-default'"
                />

                <div
                  v-if="activeTool === 'crop'"
                  ref="cropOverlayRef"
                  @mousedown="startDrag"
                  class="absolute border-2 border-orange-500 cursor-move"
                  :style="{
                    left: `${cropState.x}px`,
                    top: `${cropState.y}px`,
                    width: `${cropState.width}px`,
                    height: `${cropState.height}px`
                  }"
                >
                  <div class="absolute inset-0 bg-orange-500 bg-opacity-10"></div>

                  <div
                    v-for="handle in ['nw', 'ne', 'sw', 'se']"
                    :key="handle"
                    @mousedown="startResize($event, handle as ResizeHandle)"
                    class="resize-handle absolute w-4 h-4 bg-orange-500 rounded-full border-2 border-white shadow-lg cursor-pointer z-10"
                    :class="{
                      'top-0 left-0 -translate-x-1/2 -translate-y-1/2': handle === 'nw',
                      'top-0 right-0 translate-x-1/2 -translate-y-1/2': handle === 'ne',
                      'bottom-0 left-0 -translate-x-1/2 translate-y-1/2': handle === 'sw',
                      'bottom-0 right-0 translate-x-1/2 translate-y-1/2': handle === 'se',
                    }"
                  ></div>

                  <div class="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                    <div v-for="i in 9" :key="i" class="border border-white border-opacity-50"></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="border-t border-border px-6 py-4 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div v-if="activeTool === 'crop'" class="text-sm text-gray-600">
                  {{ cropState.realWidth }} × {{ cropState.realHeight }} px
                </div>
              </div>
            </div>
          </div>
        </div>

      </Tabs>


    </div>

  </div>



</template>

<style scoped>
input[type="range"] {
  @apply h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer;
}

input[type="range"]::-webkit-slider-thumb {
  @apply appearance-none w-4 h-4 bg-orange-500 rounded-full cursor-pointer;
}

input[type="range"]::-moz-range-thumb {
  @apply w-4 h-4 bg-orange-500 rounded-full cursor-pointer border-0;
}

canvas {
  background-image: linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0),
                    linear-gradient(45deg, #f0f0f0 25%, transparent 25%, transparent 75%, #f0f0f0 75%, #f0f0f0);
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
  background-color: white;
}
</style>
