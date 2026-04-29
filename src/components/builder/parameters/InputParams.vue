<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type { AnyComponentInstance } from '../../../type/component';
import PropertyGroup from '../ui/PropertyGroup.vue';
import { Checkbox } from '../../../components/ui/checkbox';
import { MousePointer2 } from 'lucide-vue-next';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ element: AnyComponentInstance; }>();
const emit = defineEmits(['update-data']);

const updateData = (key: string, value: any) => emit('update-data', key, value);

const getDataValue = (val: any): any => {
  if (val && typeof val === 'object' && 'value' in val) return val.value;
  return val;
};

const inputTypeOptions = [
  { label: 'Texte', value: 'text' },
  { label: 'Email', value: 'email' },
  { label: 'Mot de passe', value: 'password' },
  { label: 'Nombre', value: 'number' },
  { label: 'Téléphone', value: 'tel' },
  { label: 'URL', value: 'url' },
];
</script>

<template>
  <div v-if="element.family === 'input'" class="pt-4 border-t border-builder-bar-border/30">
    <PropertyGroup title="Système Champ" :icon="MousePointer2" :open="true">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1 flex flex-col">
            <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Type de saisie</label>
            <select
              :value="getDataValue(element.data.type) || 'text'"
              @change="(e) => updateData('type', (e.target as HTMLSelectElement).value)"
              class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
            >
              <option v-for="opt in inputTypeOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div class="flex items-center space-x-2 pt-4">
            <Checkbox id="required-sys" :checked="!!getDataValue(element.data.required)" @update:checked="(val: boolean | 'indeterminate') => updateData('required', !!val)" />
            <label for="required-sys" class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter cursor-pointer">Requis</label>
          </div>
        </div>
      </div>
    </PropertyGroup>
  </div>
</template>
