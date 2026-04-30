<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type { AnyComponentInstance } from '../../../type/component';
import type { AnySectionInstance } from '../../../type/section';
import PropertyGroup from '../ui/PropertyGroup.vue';
import CompositionMediaPicker from '../../composition/CompositionMediaPicker.vue';
import { useStyleEditor } from '../../../hook/useStyleEditor';
import { Image as ImageIcon } from 'lucide-vue-next';

const props = defineProps<{
  element: AnyComponentInstance | AnySectionInstance;
}>();

const { updateStyle, getRawValue } = useStyleEditor(props.element);

const styles = () => props.element.styles as any;

const bgImage = () => styles()?.bgImage;
const bgVideo = () => styles()?.bgVideo;

const hasBg = () => !!bgImage() || !!bgVideo();

const currentUrl = () => {
  const img = bgImage();
  const vid = bgVideo();
  if (img?.value?.url) return img.value.url;
  if (img?.url) return img.url;
  if (typeof img === 'string') return img;
  if (vid?.value?.url) return vid.value.url;
  return null;
};

const isVideo = () => !!bgVideo()?.value?.url || !!bgVideo()?.url;

const onMediaSelected = (media: any) => {
  if (!media) return;
  const mediaProp = {
    type: 'media',
    id: media.id,
    url: media.file_path,
    mediaType: media.type,
    value: { url: media.file_path }
  };
  if (media.type === 'video') {
    updateStyle('bgVideo', mediaProp);
    updateStyle('bgImage', undefined);
  } else {
    updateStyle('bgImage', mediaProp);
    updateStyle('bgVideo', undefined);
  }
  // Valeurs par défaut
  if (!getRawValue(styles()?.bgSize)) updateStyle('bgSize', 'cover');
  if (!getRawValue(styles()?.bgPosition)) updateStyle('bgPosition', 'center');
  if (!getRawValue(styles()?.bgRepeat)) updateStyle('bgRepeat', 'no-repeat');
};

const removeBg = () => {
  updateStyle('bgImage', undefined);
  updateStyle('bgVideo', undefined);
};
</script>

<template>
  <PropertyGroup title="Arrière-plan" :icon="ImageIcon" :open="true">
    <div class="space-y-2">

      <!-- Preview -->
      <div v-if="hasBg()" class="relative w-full h-20 rounded overflow-hidden border border-builder-bar-border bg-builder-input-bg">
        <video
          v-if="isVideo() && currentUrl()"
          :src="currentUrl()!"
          autoplay
          loop
          muted
          playsinline
          class="w-full h-full object-cover"
        />
        <img
          v-else-if="currentUrl()"
          :src="currentUrl()!"
          class="w-full h-full object-cover"
        />
        <button
          @click="removeBg"
          class="absolute top-1 right-1 bg-red-600/60 hover:bg-red-600 text-white rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-tighter transition-colors"
        >
          Retirer
        </button>
      </div>

      <!-- Picker -->
      <div class="w-full overflow-hidden">
        <CompositionMediaPicker
          :model-value="undefined"
          :allowed-types="['image', 'video']"
          @media-selected="onMediaSelected"
          :trigger-text="hasBg() ? 'Changer le média...' : 'Choisir un média...'"
        />
      </div>

      <!-- Size / Position (si une image est présente) -->
      <div v-if="hasBg()" class="grid grid-cols-2 gap-2 pt-1 border-t border-builder-bar-border/30">
        <div class="space-y-1">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Taille</label>
          <select
            :value="getRawValue(styles()?.bgSize) || 'cover'"
            @input="(e: any) => updateStyle('bgSize', e.target.value)"
            class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="auto">Auto</option>
          </select>
        </div>
        <div class="space-y-1">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Position</label>
          <select
            :value="getRawValue(styles()?.bgPosition) || 'center'"
            @input="(e: any) => updateStyle('bgPosition', e.target.value)"
            class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
          >
            <option value="center">Centre</option>
            <option value="top">Haut</option>
            <option value="bottom">Bas</option>
            <option value="left">Gauche</option>
            <option value="right">Droite</option>
          </select>
        </div>
      </div>

    </div>
  </PropertyGroup>
</template>
