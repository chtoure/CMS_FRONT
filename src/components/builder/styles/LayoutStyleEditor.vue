<script lang="ts" setup>
import { computed } from 'vue';
import type { AnyComponentInstance } from '../../../type/component';
import type { AnySectionInstance } from '../../../type/section';
import { useStyleEditor } from '../../../hook/useStyleEditor';
import Label from '../../ui/label/Label.vue';
import Select from '../../ui/select/Select.vue';
import SelectTrigger from '../../ui/select/SelectTrigger.vue';
import SelectValue from '../../ui/select/SelectValue.vue';
import SelectContent from '../../ui/select/SelectContent.vue';
import SelectItem from '../../ui/select/SelectItem.vue';
import Input from '../../ui/input/Input.vue';
import DimensionInput from '../DimensionInput.vue';

const props = defineProps<{
  element: AnyComponentInstance | AnySectionInstance;
}>();

const { getRawValue, updateStyle } = useStyleEditor(props.element);

const styles = computed(() => props.element.styles as any);
const isSection = computed(() => props.element.family === 'section');

const displayOptions = [
  { label: 'Bloc', value: 'block' },
  { label: 'Flex', value: 'flex' },
  { label: 'Grille', value: 'grid' },
  { label: 'Masqué', value: 'hidden' },
];

const justifyOptions = [
  { label: 'Début', value: 'start' },
  { label: 'Centre', value: 'center' },
  { label: 'Fin', value: 'end' },
  { label: 'Entre', value: 'between' },
];

const alignOptions = [
  { label: 'Début', value: 'start' },
  { label: 'Centre', value: 'center' },
  { label: 'Fin', value: 'end' },
];

const showFlexGrid = computed(() => {
  const display = getRawValue(styles.value.display);
  return display === 'flex' || display === 'grid';
});
</script>

<template>
  <div class="space-y-6">
    <div class="space-y-3">
      <h4 class="text-[10px] tracking-wider text-primary font-black border-b border-white/10 pb-1">Structure & Flux</h4>
      
      <div class="grid grid-cols-2 gap-3">
        <div class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Affichage</Label>
          <Select :model-value="(getRawValue(styles.display) as string)" @update:model-value="(val) => updateStyle('display', val)">
            <SelectTrigger class="h-8 input-custom">
              <SelectValue placeholder="Display" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="opt in displayOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div v-if="getRawValue(styles.display) === 'grid'" class="space-y-1.5">
          <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Colonnes</Label>
          <Input type="number" :model-value="getRawValue(styles.columns)" @update:model-value="(val) => updateStyle('columns', parseInt(val.toString()))" class="h-8 input-custom" />
        </div>
      </div>

      <div v-if="showFlexGrid" class="space-y-4 pt-2">
        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Gap</Label>
            <DimensionInput :model-value="getRawValue(styles.gap)" @update:model-value="(val: any) => updateStyle('gap', val)" />
          </div>
          <div v-if="getRawValue(styles.display) === 'flex'" class="space-y-1.5">
            <Label class="text-[11px] text-builder-bar-text !font-bold !font-mono">Direction</Label>
            <Select :model-value="(getRawValue(styles.direction) as string)" @update:model-value="(val) => updateStyle('direction', val)">
              <SelectTrigger class="h-8 input-custom">
                <SelectValue placeholder="Direction" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="horizontal">Horizontal</SelectItem>
                <SelectItem value="vertical">Vertical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="space-y-1.5">
            <Label class="text-[11px] text-builder-bar-text !font-bold">Justifier</Label>
            <Select :model-value="(getRawValue(styles.justify) as string)" @update:model-value="(val) => updateStyle('justify', val)">
              <SelectTrigger class="h-8 input-custom">
                <SelectValue placeholder="Justify" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="opt in justifyOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-1.5">
            <Label class="text-[11px] text-builder-bar-text !font-bold">Aligner</Label>
            <Select :model-value="(getRawValue(styles.align) as string)" @update:model-value="(val) => updateStyle('align', val)">
              <SelectTrigger class="h-8 input-custom">
                <SelectValue placeholder="Align" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="opt in alignOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-custom {
  @apply h-8 w-full !rounded px-3 py-1 text-[11px] shadow-sm transition-all outline-none !font-mono;
  background-color: var(--builder-input-bg);
  border: 1px solid var(--builder-input-border);
  color: var(--builder-input-text);
}
</style>
