<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type { AnyComponentInstance } from '../../../type/component';
import PropertyGroup from '../ui/PropertyGroup.vue';
import PropertyInput from '../ui/PropertyInput.vue';
import { Checkbox } from '../../../components/ui/checkbox';
import { List } from 'lucide-vue-next';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ element: AnyComponentInstance; }>();
const emit = defineEmits(['update-data']);

const updateData = (key: string, value: any) => emit('update-data', key, value);

const getDataValue = (val: any): any => {
  if (val && typeof val === 'object' && 'value' in val) {
    return val.value;
  }
  return val;
};
</script>

<template>
  <div v-if="element.tag === 'AccordionBuilder'" class="pt-4 border-t border-builder-bar-border/30">
    <PropertyGroup title="Système Accordéon" :icon="List" :open="true">
      <div class="space-y-4">
        <PropertyInput
          label="Titre / Question"
          :model-value="getDataValue(element.data.title ?? element.data.titre ?? element.data.label ?? element.data.question)"
          @update:model-value="(val) => updateData('title', val.toString())"
        />
        <div class="space-y-1 flex flex-col">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Contenu / Réponse</label>
          <textarea
            :value="getDataValue(element.data.content ?? element.data.reponse ?? element.data.response ?? element.data.description) || ''"
            @input="(e: Event) => updateData('content', (e.target as HTMLTextAreaElement).value)"
            rows="4"
            class="w-full text-[10px] px-2 py-1.5 bg-builder-input-bg border border-builder-bar-border rounded text-builder-bar-text placeholder-builder-bar-text/30 resize-none focus:outline-none focus:border-primary transition-colors leading-relaxed font-mono"
            placeholder="Entrez le contenu ici..."
          />
        </div>
        <div class="grid grid-cols-2 gap-2 items-end">
          <PropertyInput
            type="number"
            label="Transition (ms)"
            :model-value="getDataValue(element.data.transitionSpeed)"
            @update:model-value="(val) => updateData('transitionSpeed', parseInt(val.toString()))"
          />
          <div class="flex items-center space-x-2 pb-1.5">
            <Checkbox id="accordion-open" :checked="!!getDataValue(element.data.isOpen)" @update:checked="(val: any) => updateData('isOpen', !!val)" />
            <label for="accordion-open" class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter cursor-pointer">Ouvert</label>
          </div>
        </div>
      </div>
    </PropertyGroup>
  </div>
</template>
