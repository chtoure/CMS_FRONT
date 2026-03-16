<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type { AnyComponentInstance } from '../../../type/component';
import PropertyGroup from '../ui/PropertyGroup.vue';
import PropertyInput from '../ui/PropertyInput.vue';
import { Type } from 'lucide-vue-next';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ element: AnyComponentInstance; }>();
const emit = defineEmits(['update-data']);

const updateData = (key: string, value: any) => emit('update-data', key, value);
</script>

<template>
  <div v-if="element.tag === 'IconBuilder'" class="pt-4 border-t border-builder-bar-border/30">
    <PropertyGroup title="Système Icône" :icon="Type" :open="true">
      <div class="grid grid-cols-2 gap-2">
        <PropertyInput
          type="number"
          label="Taille (px)"
          :model-value="(element.data.size as number)"
          @update:model-value="(val) => updateData('size', parseInt(val.toString()))"
        />
        <PropertyInput
          type="number"
          label="Épaisseur"
          :model-value="(element.data.strokeWidth as number)"
          @update:model-value="(val) => updateData('strokeWidth', parseInt(val.toString()))"
        />
      </div>
    </PropertyGroup>
  </div>
</template>
