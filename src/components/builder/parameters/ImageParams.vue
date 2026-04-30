<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type { AnyComponentInstance } from '../../../type/component';
import PropertyGroup from '../ui/PropertyGroup.vue';
import PropertyInput from '../ui/PropertyInput.vue';
import { Image } from 'lucide-vue-next';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ element: AnyComponentInstance; }>();
const emit = defineEmits(['update-data']);

const updateData = (key: string, value: any) => emit('update-data', key, value);

const getDataValue = (val: any): any => {
  if (val && typeof val === 'object' && 'value' in val) return val.value;
  return val;
};

const objectFitOptions = [
  { label: 'Cover', value: 'cover' },
  { label: 'Contain', value: 'contain' },
  { label: 'Fill', value: 'fill' },
  { label: 'Scale Down', value: 'scale-down' },
  { label: 'None', value: 'none' },
];
</script>

<template>
  <div v-if="element.tag === 'ImageBuilder'" class="pt-4 border-t border-builder-bar-border/30">
    <PropertyGroup title="Système Image" :icon="Image" :open="true">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-2">
          <PropertyInput
            label="Largeur"
            :model-value="getDataValue(element.data.width)"
            @update:model-value="(val) => updateData('width', val)"
            placeholder="ex: 100% ou 300"
          />
          <PropertyInput
            label="Hauteur"
            :model-value="getDataValue(element.data.height)"
            @update:model-value="(val) => updateData('height', val)"
            placeholder="ex: auto ou 300"
          />
        </div>
        <div class="space-y-1 flex flex-col">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Ajustement</label>
          <select
            :value="getDataValue(element.data.objectFit) || 'cover'"
            @change="(e) => updateData('objectFit', (e.target as HTMLSelectElement).value)"
            class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
          >
            <option v-for="opt in objectFitOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>
    </PropertyGroup>
  </div>
</template>
