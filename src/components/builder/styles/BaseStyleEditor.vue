/* eslint-disable @typescript-eslint/no-explicit-any */
<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { AnyComponentInstance } from '../../../type/component';
import type { AnySectionInstance } from '../../../type/section';
import { useStyleEditor } from '../../../hook/useStyleEditor';
import CompositionColorPicker from '../../composition/CompositionColorPicker.vue';
import PropertyGroup from '../ui/PropertyGroup.vue';
import PropertyRow from '../ui/PropertyRow.vue';
import PropertyInput from '../ui/PropertyInput.vue';
import PropertyDimension from '../ui/PropertyDimension.vue';
import ButtonGroup from '../ui/ButtonGroup.vue';
import VariableInputControl from '../../../type/VariableInputControl.vue';
import {
  Layers,
  CornerUpLeft,
  Droplets,
  Square,
  PanelTopDashed,
  PanelBottomDashed,
  Spline,
  Image as ImageIcon
} from 'lucide-vue-next';
import CompositionMediaPicker from '../../composition/CompositionMediaPicker.vue';

const props = defineProps<{
  element: AnyComponentInstance | AnySectionInstance;
  whitelist?: string[];
}>();

const { getRawValue, getHexValue, updateStyle, updateStyles } = useStyleEditor(props.element);

const activePicker = ref<'bg' | 'border' | 'color' | null>(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const styles = computed(() => props.element.styles as any);

const showField = (fieldName: string) => {
  if (props.whitelist && !props.whitelist.includes(fieldName)) return false;
  return true;
};

const roundedOptions = [
  { label: 'None', value: 'none' },
  { label: 'S', value: 'sm' },
  { label: 'M', value: 'md' },
  { label: 'L', value: 'lg' },
  { label: 'Full', value: 'full' },
];

const shadowOptions = [
  { label: 'None', value: 'none' },
  { label: 'S', value: 'sm' },
  { label: 'M', value: 'default' },
  { label: 'L', value: 'lg' },
];

const borderStyleOptions = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
];

const bgSizeOptions = [
  { value: 'cover', label: 'Cover' },
  { value: 'contain', label: 'Contain' },
  { value: 'auto', label: 'Auto' },
];

const bgPositionOptions = [
  { value: 'center', label: 'Center' },
  { value: 'top', label: 'Top' },
  { value: 'bottom', label: 'Bottom' },
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
];

const bgRepeatOptions = [
  { value: 'no-repeat', label: 'No Repeat' },
  { value: 'repeat', label: 'Repeat XY' },
  { value: 'repeat-x', label: 'Repeat X' },
  { value: 'repeat-y', label: 'Repeat Y' },
];

</script>

<template>
  <div class="space-y-1.5">
    <!-- Position / Dimensions Section -->
    <PropertyGroup v-if="showField('width') || showField('height') || showField('padding')" title="Position" :open="true" :icon="Layers">
      <div class="space-y-2">
        <PropertyRow v-if="showField('width') || showField('height')">
          <PropertyDimension
            v-if="showField('width')"
            label="W"
            :model-value="getRawValue(styles.width)"
            @update:model-value="(val: any) => updateStyle('width', val)"
          >
            <template #action>
              <VariableInputControl
                :model-value="styles.width"
                @update:model-value="(val: any) => updateStyle('width', val)"
                variable-type="NUMBER"
              />
            </template>
          </PropertyDimension>

          <PropertyDimension
            v-if="showField('height')"
            label="H"
            :model-value="getRawValue(styles.height)"
            @update:model-value="(val: any) => updateStyle('height', val)"
          >
            <template #action>
              <VariableInputControl
                :model-value="styles.height"
                @update:model-value="(val: any) => updateStyle('height', val)"
                variable-type="NUMBER"
              />
            </template>
          </PropertyDimension>
        </PropertyRow>

        <div v-if="showField('padding')" class="space-y-1">
          <PropertyInput 
            label="Espacement"
            type="number"
            :model-value="parseInt(getRawValue(styles.padding) as string) || 0"
            @update:model-value="(val) => updateStyle('padding', parseInt(val.toString()) || 0)"
            :icon="Layers"
          >
            <template #action>
              <VariableInputControl
                :model-value="styles.padding"
                @update:model-value="(val: any) => updateStyle('padding', val)"
                variable-type="NUMBER"
              />
            </template>
          </PropertyInput>
        </div>

        <PropertyRow v-if="showField('marginTop') || showField('marginBottom')">
          <PropertyInput
            v-if="showField('marginTop')"
            label="Marge H"
            :icon="PanelTopDashed"
            :model-value="parseInt(getRawValue(styles.marginTop) as string) || 0"
            @update:model-value="(val) => updateStyle('marginTop', parseInt(val.toString()) || 0)"
            type="number"
            class="flex-1"
          >
            <template #action>
              <VariableInputControl
                :model-value="styles.marginTop"
                @update:model-value="(val: any) => updateStyle('marginTop', val)"
                variable-type="NUMBER"
              />
            </template>
          </PropertyInput>

          <PropertyInput
            v-if="showField('marginBottom')"
            label="Marge B"
            :icon="PanelBottomDashed"
            :model-value="parseInt(getRawValue(styles.marginBottom) as string) || 0"
            @update:model-value="(val) => updateStyle('marginBottom', parseInt(val.toString()) || 0)"
            type="number"
            class="flex-1"
          >
            <template #action>
              <VariableInputControl
                :model-value="styles.marginBottom"
                @update:model-value="(val: any) => updateStyle('marginBottom', val)"
                variable-type="NUMBER"
              />
            </template>
          </PropertyInput>
        </PropertyRow>
      </div>
    </PropertyGroup>

    <!-- ==== Positionnement Avancé ==== -->
    <PropertyGroup v-if="showField('position') || showField('top')" title="Positionnement" :open="false" :icon="Layers">
      <div class="space-y-3">
        <div v-if="showField('position')" class="space-y-1.5 pt-1">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text uppercase tracking-tighter">Type</label>
          <select
            class="w-full bg-builder-bar-item-background border border-border text-builder-bar-text text-xs p-1.5 rounded focus:outline-none focus:border-primary"
            :value="getRawValue(styles.position) || 'static'"
            @change="(e) => {
              const newPos = (e.target as HTMLSelectElement).value;
              const updates: Record<string, any> = { position: newPos };
              if (newPos !== 'static') {
                if (getRawValue(styles.top) === undefined) updates.top = 0;
                if (getRawValue(styles.left) === undefined && newPos === 'fixed') updates.left = 0;
              }
              updateStyles(updates);
            }"
          >
            <option value="static">Static (Défaut)</option>
            <option value="fixed">Fixed</option>
            <option value="sticky">Sticky</option>
          </select>
        </div>

        <div v-if="(getRawValue(styles.position) !== 'static' && getRawValue(styles.position)) || !showField('position')" class="grid grid-cols-2 gap-2">
          
          <PropertyInput
            v-if="showField('top')"
            label="Top"
            :model-value="getRawValue(styles.top) !== undefined ? getRawValue(styles.top) : ''"
            @update:model-value="(val) => updateStyle('top', val !== '' ? Number(val) : undefined)"
            type="number"
            class="flex-1"
          />
          <PropertyInput
            v-if="showField('right')"
            label="Right"
            :model-value="getRawValue(styles.right) !== undefined ? getRawValue(styles.right) : ''"
            @update:model-value="(val) => updateStyle('right', val !== '' ? Number(val) : undefined)"
            type="number"
            class="flex-1"
          />
          <PropertyInput
            v-if="showField('bottom')"
            label="Bottom"
            :model-value="getRawValue(styles.bottom) !== undefined ? getRawValue(styles.bottom) : ''"
            @update:model-value="(val) => updateStyle('bottom', val !== '' ? Number(val) : undefined)"
            type="number"
            class="flex-1"
          />
          <PropertyInput
            v-if="showField('left')"
            label="Left"
            :model-value="getRawValue(styles.left) !== undefined ? getRawValue(styles.left) : ''"
            @update:model-value="(val) => updateStyle('left', val !== '' ? Number(val) : undefined)"
            type="number"
            class="flex-1"
          />

        </div>

        <div v-if="showField('zIndex') && getRawValue(styles.position) !== 'static'" class="space-y-1.5 pt-1">
            <PropertyInput
              label="Z-Index"
              :model-value="parseInt(getRawValue(styles.zIndex) as string) || 0"
              @update:model-value="(val) => updateStyle('zIndex', parseInt(val.toString()) || 0)"
              type="number"
            />
        </div>
      </div>
    </PropertyGroup>

    <!-- Appearance Section -->
    <PropertyGroup v-if="showField('shadow') || showField('opacity')" title="Apparence" :open="true" :icon="Droplets">
      <div class="space-y-2">
        <div v-if="showField('opacity')" class="space-y-1.5">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text uppercase tracking-tighter ml-1">Opacité</label>
          <PropertyInput 
            label=""
            :model-value="Math.round((Number(getRawValue(styles.opacity)) || 1) * 100)"
            @update:model-value="(val) => updateStyle('opacity', parseFloat(val.toString()) / 100)"
            :icon="Droplets"
          />
        </div>

        <div v-if="showField('shadow')" class="space-y-1.5">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text uppercase tracking-tighter ml-1">Ombre</label>
          <ButtonGroup 
            :model-value="getRawValue(styles.shadow) as string" 
            @update:model-value="(val) => updateStyle('shadow', val)"
            :options="shadowOptions"
            size="sm"
          />
        </div>
      </div>
    </PropertyGroup>

    <!-- Detailed Radius Section (Optional, only if showField('rounded') is true) -->
    <PropertyGroup v-if="showField('rounded')" title="Coins & Arrondis" :open="false" :icon="CornerUpLeft">
      <div class="space-y-2">
        <div class="space-y-1">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text uppercase tracking-tighter ml-1">Coins</label>
          <div class="space-y-1">
            <PropertyInput 
              label=""
              type="number"
              :model-value="parseInt(getRawValue(styles.rounded) as string) || 0"
              @update:model-value="(val) => updateStyle('rounded', parseInt(val.toString()) || 0)"
              class="flex-1"
            >
              <template #action>
                <VariableInputControl
                  :model-value="styles.rounded"
                  @update:model-value="(val) => updateStyle('rounded', val)"
                  variable-type="NUMBER"
                />
              </template>
            </PropertyInput>
            <ButtonGroup
              :model-value="getRawValue(styles.rounded) as string"
              @update:model-value="(val) => updateStyle('rounded', val)"
              :options="roundedOptions"
              size="sm"
            />
          </div>
        </div>

        <div class="space-y-1.5 pt-2 border-t border-builder-bar-border">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text uppercase tracking-tighter ml-1">Coin Individuel</label>
          <PropertyRow>
            <PropertyInput 
              label="HG"
              type="number"
              :model-value="parseInt(getRawValue(styles.roundedTopLeft) as string) || 0"
              @update:model-value="(val) => updateStyle('roundedTopLeft', parseInt(val.toString()) || 0)"
              class="flex-1"
            >
              <template #action>
                <VariableInputControl
                  :model-value="styles.roundedTopLeft"
                  @update:model-value="(val) => updateStyle('roundedTopLeft', val)"
                  variable-type="NUMBER"
                />
              </template>
            </PropertyInput>
            <PropertyInput 
              label="HD"
              type="number"
              :model-value="parseInt(getRawValue(styles.roundedTopRight) as string) || 0"
              @update:model-value="(val) => updateStyle('roundedTopRight', parseInt(val.toString()) || 0)"
              class="flex-1"
            >
              <template #action>
                <VariableInputControl
                  :model-value="styles.roundedTopRight"
                  @update:model-value="(val) => updateStyle('roundedTopRight', val)"
                  variable-type="NUMBER"
                />
              </template>
            </PropertyInput>
          </PropertyRow>
          <PropertyRow>
            <PropertyInput 
              label="BG"
              type="number"
              :model-value="parseInt(getRawValue(styles.roundedBottomLeft) as string) || 0"
              @update:model-value="(val) => updateStyle('roundedBottomLeft', parseInt(val.toString()) || 0)"
              class="flex-1"
            >
              <template #action>
                <VariableInputControl
                  :model-value="styles.roundedBottomLeft"
                  @update:model-value="(val) => updateStyle('roundedBottomLeft', val)"
                  variable-type="NUMBER"
                />
              </template>
            </PropertyInput>
            <PropertyInput 
              label="BD"
              type="number"
              :model-value="parseInt(getRawValue(styles.roundedBottomRight) as string) || 0"
              @update:model-value="(val) => updateStyle('roundedBottomRight', parseInt(val.toString()) || 0)"
              class="flex-1"
            >
              <template #action>
                <VariableInputControl
                  :model-value="styles.roundedBottomRight"
                  @update:model-value="(val) => updateStyle('roundedBottomRight', val)"
                  variable-type="NUMBER"
                />
              </template>
            </PropertyInput>
          </PropertyRow>
        </div>
      </div>
    </PropertyGroup>

    <!-- Content Color Section -->
    <PropertyGroup v-if="showField('color')" title="Couleur de l'icône/texte" :open="true" :icon="Droplets">
      <div class="space-y-1">
        <VariableInputControl
          :model-value="styles.color"
          @update:model-value="(val) => updateStyle('color', val)"
          variable-type="COLOR"
        >
          <CompositionColorPicker 
            :is-open="activePicker === 'color'"
            :initial-color="'#' + getHexValue(styles.color)"
            @close="activePicker = null"
            @color-change="(hex) => updateStyle('color', { type: 'static', value: hex })"
          >
            <template #trigger>
              <button 
                @click="activePicker = 'color'" 
                class="w-full h-8 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-xs hover:border-builder-bar-border/80 transition-colors"
              >
                <div 
                  class="w-4 h-4 rounded-sm border border-builder-bar-border shrink-0" 
                  :style="{ backgroundColor: '#' + getHexValue(styles.color) }"
                />
                <span class="text-builder-bar-text font-mono text-[10px] flex-1 text-left truncate">{{ getRawValue(styles.color) || 'Par défaut' }}</span>
              </button>
            </template>
          </CompositionColorPicker>
        </VariableInputControl>
      </div>
    </PropertyGroup>


    <!-- Fill Section -->
    <PropertyGroup v-if="showField('bg')" title="Couleur de fond" :open="true" :icon="Square">
      <div class="space-y-1">
        <VariableInputControl
          :model-value="styles.bg"
          @update:model-value="(val) => updateStyle('bg', val)"
          variable-type="COLOR"
        >
          <CompositionColorPicker
            :is-open="activePicker === 'bg'"
            :initial-color="'#' + getHexValue(styles.bg)"
            @close="activePicker = null"
            @color-change="(hex) => updateStyle('bg', { type: 'static', value: hex })"
          >
            <template #trigger>
              <button
                @click="activePicker = 'bg'"
                class="w-full h-8 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-xs hover:border-builder-bar-border/80 transition-colors"
              >
                <div
                  class="w-4 h-4 rounded-sm border border-builder-bar-border shrink-0"
                  :style="{ backgroundColor: '#' + getHexValue(styles.bg) }"
                />
                <span class="text-builder-bar-text font-mono text-[10px] flex-1 text-left truncate">{{ getRawValue(styles.bg) || 'Transparent' }}</span>
              </button>
            </template>
          </CompositionColorPicker>
        </VariableInputControl>
      </div>
    </PropertyGroup>

    <!-- Background Media Section -->
    <PropertyGroup v-if="showField('bgImage') || showField('bgVideo')" title="Arrière-plan Média" :open="false" :icon="ImageIcon">
      <div class="space-y-3">
        <!-- Media Preview + Picker -->
        <div class="space-y-1">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text uppercase tracking-tighter ml-1">Média (Image/Vidéo)</label>
          
          <!-- Preview of current media (works on refresh because we read directly from stored URL) -->
          <div v-if="styles.bgImage || styles.bgVideo" class="relative w-full h-20 rounded overflow-hidden border border-builder-bar-border bg-builder-input-bg">
            <img
              v-if="styles.bgImage && (styles.bgImage as any)?.value?.url"
              :src="(styles.bgImage as any).value.url"
              class="w-full h-full object-cover"
            />
            <div v-else-if="styles.bgVideo && (styles.bgVideo as any)?.value?.url" class="flex items-center justify-center w-full h-full gap-2">
              <ImageIcon class="w-5 h-5 text-builder-bar-text/50" />
              <span class="text-[10px] text-builder-bar-text/70 truncate max-w-[160px]">{{ (styles.bgVideo as any)?.value?.url?.split('/').pop() }}</span>
            </div>
            <button
              @click="updateStyle('bgImage', undefined); updateStyle('bgVideo', undefined)"
              class="absolute top-1 right-1 bg-red-600/80 hover:bg-red-600 text-white rounded px-1.5 py-0.5 text-[10px] font-bold"
            >
              Retirer
            </button>
          </div>

          <!-- Picker Button -->
          <div class="flex items-center gap-2">
            <CompositionMediaPicker
              :model-value="undefined"
              :allowed-types="['image', 'video']"
              @media-selected="(media) => {
                if (media) {
                   const mediaProp = {
                      type: 'media',
                      id: media.id,
                      url: media.file_path,
                      mediaType: media.type
                   };
                   updateStyle(media.type === 'video' ? 'bgVideo' : 'bgImage', mediaProp);
                   if (media.type === 'video') updateStyle('bgImage', undefined);
                   else updateStyle('bgVideo', undefined);
                }
              }"
              :trigger-text="(styles.bgImage || styles.bgVideo) ? 'Changer le média...' : 'Choisir un média...'"
            />
          </div>
        </div>

        <!-- Position & Size Options -->
        <div v-if="(styles.bgImage || styles.bgVideo) && showField('bgSize')" class="space-y-2 pt-2 border-t border-builder-bar-border">
          <PropertyRow>
            <div class="flex-1 space-y-1">
              <label class="text-[9px] text-builder-bar-text/70 uppercase">Taille</label>
              <select
                :value="getRawValue(styles.bgSize) || 'cover'"
                @input="(e: any) => updateStyle('bgSize', e.target.value)"
                class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
              >
                <option v-for="opt in bgSizeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
            <div class="flex-1 space-y-1">
              <label class="text-[9px] text-builder-bar-text/70 uppercase">Position</label>
              <select
                :value="getRawValue(styles.bgPosition) || 'center'"
                @input="(e: any) => updateStyle('bgPosition', e.target.value)"
                class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
              >
                <option v-for="opt in bgPositionOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>
          </PropertyRow>
          <div class="space-y-1">
            <label class="text-[9px] text-builder-bar-text/70 uppercase">Répétition</label>
            <select
              :value="getRawValue(styles.bgRepeat) || 'no-repeat'"
              @input="(e: any) => updateStyle('bgRepeat', e.target.value)"
              class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
            >
              <option v-for="opt in bgRepeatOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
        </div>
      </div>
    </PropertyGroup>

    <!-- Stroke Section -->
    <PropertyGroup v-if="showField('borderWidth')" title="Contour" :open="false" :icon="Spline">
      <div class="space-y-1">
        <PropertyRow>
          <PropertyInput 
            label="Poids"
            :model-value="parseInt(getRawValue(styles.borderWidth) as string) || 0"
            @update:model-value="(val) => updateStyle('borderWidth', parseInt(val.toString()) || 0)"
            type="number"
            class="flex-1"
          />
          <div class="flex items-end flex-1">
            <select
              :value="getRawValue(styles.borderStyle)"
              @input="(e: any) => updateStyle('borderStyle', e.target.value)"
              class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
            >
               <option v-for="opt in borderStyleOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
        </PropertyRow>

        <div v-if="showField('borderColor')" class="space-y-2">
          <VariableInputControl
            :model-value="styles.borderColor"
            @update:model-value="(val) => {
              const updates: Record<string, any> = { borderColor: val };
              if (val && !getRawValue(styles.borderWidth)) {
                updates.borderWidth = 1;
              }
              updateStyles(updates);
            }"
            variable-type="COLOR"
          >
            <CompositionColorPicker
              :is-open="activePicker === 'border'"
              :initial-color="'#' + getHexValue(styles.borderColor)"
              @close="activePicker = null"
              @color-change="(hex) => {
                const updates: Record<string, any> = { borderColor: { type: 'static', value: hex } };
                if (!getRawValue(styles.borderWidth)) {
                  updates.borderWidth = 1;
                }
                updateStyles(updates);
              }"
            >
              <template #trigger>
                <button
                  @click="activePicker = 'border'"
                  class="w-full h-8 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-xs hover:border-builder-bar-border/80 transition-colors"
                >
                  <div
                    class="w-4 h-4 rounded-sm border border-builder-bar-border shrink-0"
                    :style="{ backgroundColor: '#' + getHexValue(styles.borderColor) }"
                  />
                  <span class="text-builder-bar-text font-mono text-[10px] flex-1 text-left truncate">{{ getRawValue(styles.borderColor) || 'Transparent' }}</span>
                </button>
              </template>
            </CompositionColorPicker>
          </VariableInputControl>
        </div>
      </div>
    </PropertyGroup>
  </div>
</template>

<style scoped>
select {
  @apply transition-all duration-200;
}
</style>
