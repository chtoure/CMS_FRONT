<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type { AnyComponentInstance } from '../../../type/component';
import PropertyGroup from '../ui/PropertyGroup.vue';
import PropertyInput from '../ui/PropertyInput.vue';
import IconPicker from '../ui/IconPicker.vue';
import { MousePointerClick } from 'lucide-vue-next';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{ element: AnyComponentInstance }>();
const emit = defineEmits(['update-data', 'update-data-param']);

const updateData = (key: string, value: any) => emit('update-data', key, value);
const updateDataAndParam = (key: string, value: any) => emit('update-data-param', key, value);

const getDataValue = (val: any): any => {
  if (val && typeof val === 'object' && 'value' in val) return val.value;
  return val;
};
</script>

<template>
  <div v-if="element.tag === 'ButtonBuilder'" class="pt-4 border-t border-builder-bar-border/30">
    <PropertyGroup title="Système Bouton" :icon="MousePointerClick" :open="true">
      <div class="space-y-4">

        <!-- ══ CARTE : Par défaut ══ -->
        <div class="rounded-md border border-builder-bar-border/20 bg-builder-input-bg p-2 space-y-2">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-builder-bar-text/20 shrink-0"></span>
            <p class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter">Par défaut</p>
          </div>

          <div class="space-y-1">
            <PropertyInput
              label="Texte"
              :model-value="getDataValue(element.data.content)"
              @update:model-value="(val) => updateDataAndParam('content', String(val))"
            />
          </div>

          <div class="space-y-1">
            <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Icône</label>
            <IconPicker
              :model-value="(getDataValue(element.data.icon) as string | null)"
              @update:model-value="(val) => updateData('icon', val ?? '')"
            />
          </div>

          <div v-if="getDataValue(element.data.icon)" class="space-y-1">
            <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Position</label>
            <select
              :value="getDataValue(element.data.iconPosition) || 'left'"
              @change="(e) => updateData('iconPosition', (e.target as HTMLSelectElement).value)"
              class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
            >
              <option value="left">Gauche</option>
              <option value="right">Droite</option>
              <option value="only">Icône seule</option>
            </select>
          </div>
        </div>

        <!-- ══ CARTE : Si masqué (TOGGLE_VISIBILITY uniquement) ══ -->
        <div
          v-if="getDataValue(element.data.cliquable)?.action === 'TOGGLE_VISIBILITY'"
          class="rounded-md border border-blue-500/25 bg-blue-500/5 p-2 space-y-2"
        >
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0"></span>
            <p class="text-[10px] font-mono font-bold text-primary/70 uppercase tracking-tighter">Si masqué (True)</p>
          </div>

          <div class="space-y-1">
            <PropertyInput
              label="Texte"
              :model-value="getDataValue(element.data.contentVisible)"
              @update:model-value="(val) => updateData('contentVisible', String(val))"
            />
          </div>

          <div class="space-y-1">
            <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Icône</label>
            <IconPicker
              :model-value="(getDataValue(element.data.iconVisible) as string | null)"
              @update:model-value="(val) => updateData('iconVisible', val ?? '')"
            />
          </div>

          <div v-if="getDataValue(element.data.iconVisible)" class="space-y-1">
            <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Position</label>
            <select
              :value="getDataValue(element.data.iconPositionVisible) || 'left'"
              @change="(e) => updateData('iconPositionVisible', (e.target as HTMLSelectElement).value)"
              class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
            >
              <option value="left">Gauche</option>
              <option value="right">Droite</option>
              <option value="only">Icône seule</option>
            </select>
          </div>
        </div>

      </div>
    </PropertyGroup>
  </div>
</template>
