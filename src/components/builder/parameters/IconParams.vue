<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type { AnyComponentInstance } from '../../../type/component';
import PropertyGroup from '../ui/PropertyGroup.vue';
import PropertyInput from '../ui/PropertyInput.vue';
import IconPicker from '../ui/IconPicker.vue';
import { Type } from 'lucide-vue-next';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ element: AnyComponentInstance; }>();
const emit = defineEmits(['update-data']);

const updateData = (key: string, value: any) => emit('update-data', key, value);

const getDataValue = (val: any): any => {
  const resolved = (val && typeof val === 'object' && 'value' in val) ? val.value : val;
  return resolved;
};

// Résout la valeur de l'icône en s'assurant qu'elle est bien une string ou null
const getIconValue = (val: any): string | null => {
  const resolved = getDataValue(val);
  if (typeof resolved === 'string') return resolved;
  return null;
};
</script>

<template>
  <div v-if="element.tag === 'IconBuilder'" class="pt-4 border-t border-builder-bar-border/30">
    <PropertyGroup title="Système Icône" :icon="Type" :open="true">
      <div class="space-y-4">
        <div class="space-y-1">
          <label class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Icône</label>
          <IconPicker
            :model-value="getIconValue(element.data.icon)"
            @update:model-value="(val) => updateData('icon', val)"
          />
        </div>
        <div class="grid grid-cols-2 gap-2">
          <PropertyInput
            type="number"
            label="Taille (px)"
            :model-value="getDataValue(element.data.size)"
            @update:model-value="(val) => updateData('size', parseInt(val.toString()))"
          />
          <PropertyInput
            type="number"
            label="Épaisseur"
            :model-value="getDataValue(element.data.strokeWidth)"
            @update:model-value="(val) => updateData('strokeWidth', parseInt(val.toString()))"
          />
        </div>
      </div>
    </PropertyGroup>
  </div>
</template>
