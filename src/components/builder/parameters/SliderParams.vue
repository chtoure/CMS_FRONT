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
import { Checkbox } from '../../../components/ui/checkbox';
import { Layout } from 'lucide-vue-next';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ element: AnyComponentInstance; }>();
const emit = defineEmits(['update-data']);

const updateData = (key: string, value: any) => {
  console.log("update autoplay ", key);

  const current = props.element.data[key];
  console.log(current, value);

  if (current && typeof current === 'object' && 'type' in current) {
    emit('update-data', key, { ...current, value });
  } else {
    emit('update-data', key, { type: 'static', value });
  }
};

const easeOptions = [
  { label: 'Ease', value: 'ease-in-out' },
  { label: 'Linear', value: 'linear' },
  { label: 'In', value: 'ease-in' },
  { label: 'Out', value: 'ease-out' },
];

const getDataValue = (val: any): any => {
  if (val && typeof val === 'object' && 'value' in val) {
    return val.value;
  }
  return val;
};
</script>

<template>
  <div v-if="element.tag === 'SliderBuilder'" class="pt-4 border-t border-builder-bar-border/30">
    <PropertyGroup title="Système Slider" :icon="Layout" :open="true">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-2">
          <div class="space-y-1 flex flex-col">
            <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Pause Autoplay</label>
            <PropertyInput
              type="number"
              label=""
              :model-value="getDataValue(element.data.speed) ?? 3000"
              @update:model-value="(val) => updateData('speed', parseInt(val.toString()) || 3000)"
            />
          </div>
          <div class="space-y-1 flex flex-col">
            <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Durée transition</label>
            <PropertyInput
              type="number"
              label=""
              :model-value="getDataValue(element.data.transitionDuration) ?? 500"
              @update:model-value="(val) => updateData('transitionDuration', parseInt(val.toString()) || 500)"
            />
          </div>
        </div>
        <div class="grid grid-cols-1 gap-2">
          <div class="space-y-1 flex flex-col">
            <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Lissage</label>
            <Select :model-value="getDataValue(element.data.transitionEase) || 'ease-in-out'" @update:model-value="(val) => val && updateData('transitionEase', val as string)">
              <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
                <SelectValue placeholder="Ease" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="opt in easeOptions" :key="opt.value" :value="opt.value">
                  <span class="text-[10px]">{{ opt.label }}</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
           <div class="flex items-center space-x-2">
              <Checkbox id="slider-autoplay" :model-value="!!getDataValue(element.data.autoPlay)" @update:model-value="(val: any) => updateData('autoPlay', !!val)" />
              <label for="slider-autoplay" class="text-[10px] font-mono font-bold text-builder-bar-text/60 uppercase tracking-tighter cursor-pointer">Autoplay</label>
           </div>
           <div class="flex items-center space-x-2">
              <Checkbox id="slider-loop" :model-value="!!getDataValue(element.data.loop)" @update:model-value="(val: any) => updateData('loop', !!val)" />
              <label for="slider-loop" class="text-[10px] font-mono font-bold text-builder-bar-text/60 uppercase tracking-tighter cursor-pointer">Boucle</label>
           </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
           <div class="flex items-center space-x-2">
              <Checkbox id="slider-pagination" :model-value="getDataValue(element.data.showPagination) === true" @update:model-value="(val: any) => updateData('showPagination', !!val)" />
              <label for="slider-pagination" class="text-[10px] font-mono font-bold text-builder-bar-text/60 uppercase tracking-tighter cursor-pointer">Pagination</label>
           </div>
           <div class="flex items-center space-x-2">
              <Checkbox id="slider-arrows" :model-value="getDataValue(element.data.showArrows) === true" @update:model-value="(val: any) => updateData('showArrows', !!val)" />
              <label for="slider-arrows" class="text-[10px] font-mono font-bold text-builder-bar-text/60 uppercase tracking-tighter cursor-pointer">Flèches</label>
           </div>
        </div>
      </div>
    </PropertyGroup>
  </div>
</template>
