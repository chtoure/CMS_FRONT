<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type { AnyComponentInstance } from '../../../type/component';
import PropertyGroup from '../ui/PropertyGroup.vue';
import PropertyInput from '../ui/PropertyInput.vue';
import Select from '../../../components/ui/select/Select.vue';
import SelectTrigger from '../../../components/ui/select/SelectTrigger.vue';
import SelectValue from '../../../components/ui/select/SelectValue.vue';
import SelectContent from '../../../components/ui/select/SelectContent.vue';
import SelectItem from '../../../components/ui/select/SelectItem.vue';
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
          <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Ajustement</label>
          <Select :model-value="getDataValue(element.data.objectFit)" :modal="false" @update:model-value="(val) => val && updateData('objectFit', val as string)">
            <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
              <SelectValue placeholder="Fit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in objectFitOptions" :key="opt.value" :value="opt.value">
                 <span class="text-[10px]">{{ opt.label }}</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </PropertyGroup>
  </div>
</template>
