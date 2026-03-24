<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import type { AnyComponentInstance } from '../../../type/component';
import PropertyGroup from '../ui/PropertyGroup.vue';
import PropertyInput from '../ui/PropertyInput.vue';
import IconPicker from '../ui/IconPicker.vue';
import Select from '../../../components/ui/select/Select.vue';
import SelectTrigger from '../../../components/ui/select/SelectTrigger.vue';
import SelectValue from '../../../components/ui/select/SelectValue.vue';
import SelectContent from '../../../components/ui/select/SelectContent.vue';
import SelectItem from '../../../components/ui/select/SelectItem.vue';
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
            <span class="w-1.5 h-1.5 rounded-full bg-builder-bar-text/40 shrink-0"></span>
            <p class="text-[9px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-widest">Par défaut</p>
          </div>

          <!-- Texte -->
          <div class="space-y-1">
            <label class="text-[9px] font-mono font-semibold text-builder-bar-text/40 ml-1">Texte</label>
            <PropertyInput
              label="Texte"
              :model-value="getDataValue(element.data.content)"
              @update:model-value="(val) => updateDataAndParam('content', String(val))"
            />
          </div>

          <!-- Icône -->
          <div class="space-y-1">
            <label class="text-[9px] font-mono font-semibold text-builder-bar-text/40 ml-1">Icône</label>
            <IconPicker
              :model-value="(getDataValue(element.data.icon) as string | null)"
              @update:model-value="(val) => updateData('icon', val ?? '')"
            />
          </div>

          <!-- Position -->
          <div v-if="getDataValue(element.data.icon)" class="space-y-1">
            <label class="text-[9px] font-mono font-semibold text-builder-bar-text/40 ml-1">Position</label>
            <Select
              :model-value="getDataValue(element.data.iconPosition) || 'left'"
              @update:model-value="(val) => val && updateData('iconPosition', val as string)"
            >
              <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
                <SelectValue placeholder="Position..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left"><span class="text-[10px]">Gauche</span></SelectItem>
                <SelectItem value="right"><span class="text-[10px]">Droite</span></SelectItem>
                <SelectItem value="only"><span class="text-[10px]">Icône seule</span></SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- ══ CARTE : Si masqué (TOGGLE_VISIBILITY uniquement) ══ -->
        <div
          v-if="getDataValue(element.data.cliquable)?.action === 'TOGGLE_VISIBILITY'"
          class="rounded-md border border-blue-500/25 bg-blue-500/5 p-2 space-y-2"
        >
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
            <p class="text-[9px] font-mono font-bold text-blue-400/70 uppercase tracking-widest">Si masqué (True)</p>
          </div>

          <!-- Texte alternatif -->
          <div class="space-y-1">
            <label class="text-[9px] font-mono font-semibold text-builder-bar-text/40 ml-1">Texte</label>
            <PropertyInput
              label="Texte"
              :model-value="getDataValue(element.data.contentVisible)"
              @update:model-value="(val) => updateData('contentVisible', String(val))"
            />
          </div>

          <!-- Icône alternative -->
          <div class="space-y-1">
            <label class="text-[9px] font-mono font-semibold text-builder-bar-text/40 ml-1">Icône</label>
            <IconPicker
              :model-value="(getDataValue(element.data.iconVisible) as string | null)"
              @update:model-value="(val) => updateData('iconVisible', val ?? '')"
            />
          </div>

          <!-- Position alternative -->
          <div v-if="getDataValue(element.data.iconVisible)" class="space-y-1">
            <label class="text-[9px] font-mono font-semibold text-builder-bar-text/40 ml-1">Position</label>
            <Select
              :model-value="getDataValue(element.data.iconPositionVisible) || 'left'"
              @update:model-value="(val) => val && updateData('iconPositionVisible', val as string)"
            >
              <SelectTrigger class="h-7 text-[10px] bg-builder-input-bg border-builder-bar-border">
                <SelectValue placeholder="Position..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left"><span class="text-[10px]">Gauche</span></SelectItem>
                <SelectItem value="right"><span class="text-[10px]">Droite</span></SelectItem>
                <SelectItem value="only"><span class="text-[10px]">Icône seule</span></SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      </div>
    </PropertyGroup>
  </div>
</template>
