/* eslint-disable @typescript-eslint/no-explicit-any */
<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { AnyComponentInstance } from '../../../type/component';
import type { AnySectionInstance } from '../../../type/section';
import { useStyleEditor } from '../../../hook/useStyleEditor';
import CompositionColorPicker from '../../composition/CompositionColorPicker.vue';
import PropertyGroup from '../ui/PropertyGroup.vue';
import PropertyRow from '../ui/PropertyRow.vue';
import PropertyInput from '../ui/PropertyInput.vue';
import ButtonGroup from '../ui/ButtonGroup.vue';
import VariableInputControl from '../../../type/VariableInputControl.vue';
import {
  Layers,
  CornerUpLeft,
  Droplets,
  Square,
  Minus
} from 'lucide-vue-next';

const props = defineProps<{
  element: AnyComponentInstance | AnySectionInstance;
  whitelist?: string[];
}>();

const { getRawValue, getHexValue, updateStyle, updateStyles } = useStyleEditor(props.element);

const activePicker = ref<'bg' | 'border' | null>(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const styles = computed(() => props.element.styles as any);

const showField = (fieldName: string) => {
  if (props.whitelist && !props.whitelist.includes(fieldName)) return false;
  return true;
};

const roundedOptions = [
  { label: 'None', value: 'none' },
  { label: 'S', value: 'sm' },
  { label: 'M', value: 'md' },
  { label: 'L', value: 'lg' },
  { label: 'Full', value: 'full' },
];

const shadowOptions = [
  { label: 'None', value: 'none' },
  { label: 'S', value: 'sm' },
  { label: 'M', value: 'default' },
  { label: 'L', value: 'lg' },
];

const borderStyleOptions = [
  { value: 'solid', label: 'Solid' },
  { value: 'dashed', label: 'Dashed' },
  { value: 'dotted', label: 'Dotted' },
];

</script>

<template>
  <div class="space-y-4">
    <!-- Position / Dimensions Section -->
    <PropertyGroup v-if="showField('width') || showField('height') || showField('padding')" title="Position" :open="true" :icon="Layers">
      <div class="space-y-4">
        <PropertyRow v-if="showField('width') || showField('height')">
          <PropertyInput
            v-if="showField('width')"
            type="text"
            label="W"
            :model-value="getRawValue(styles.width)"
            @update:model-value="(val) => updateStyle('width', val)"
            placeholder="auto"
            class="flex-1"
          >
            <template #action>
              <VariableInputControl
                :model-value="styles.width"
                @update:model-value="(val: any) => updateStyle('width', val)"
                variable-type="NUMBER"
              />
            </template>
          </PropertyInput>

          <PropertyInput
            v-if="showField('height')"
            label="H"
            type="text"
            :model-value="getRawValue(styles.height)"
            @update:model-value="(val) => updateStyle('height', val)"
            placeholder="auto"
            class="flex-1"
          >
            <template #action>
              <VariableInputControl
                :model-value="styles.height"
                @update:model-value="(val: any) => updateStyle('height', val)"
                variable-type="NUMBER"
              />
            </template>
          </PropertyInput>
        </PropertyRow>

        <div v-if="showField('padding')" class="space-y-1.5">
          <PropertyInput
            label="Padding"
            type="number"
            :model-value="getRawValue(styles.padding)"
            @update:model-value="(val) => updateStyle('padding', parseInt(val.toString()) || 0)"
            :icon="Layers"
          >
            <template #action>
              <VariableInputControl
                :model-value="styles.padding"
                @update:model-value="(val: any) => updateStyle('padding', val)"
                variable-type="NUMBER"
              />
            </template>
          </PropertyInput>
        </div>

        <PropertyRow v-if="showField('marginTop') || showField('marginBottom')">
          <PropertyInput
            v-if="showField('marginTop')"
            label="Margin T"
            :model-value="getRawValue(styles.marginTop)"
            @update:model-value="(val) => updateStyle('marginTop', parseInt(val.toString()) || 0)"
            type="number"
            class="flex-1"
          >
            <template #action>
              <VariableInputControl
                :model-value="styles.marginTop"
                @update:model-value="(val: any) => updateStyle('marginTop', val)"
                variable-type="NUMBER"
              />
            </template>
          </PropertyInput>

          <PropertyInput
            v-if="showField('marginBottom')"
            label="Margin B"
            :model-value="getRawValue(styles.marginBottom)"
            @update:model-value="(val) => updateStyle('marginBottom', parseInt(val.toString()) || 0)"
            type="number"
            class="flex-1"
          >
            <template #action>
              <VariableInputControl
                :model-value="styles.marginBottom"
                @update:model-value="(val: any) => updateStyle('marginBottom', val)"
                variable-type="NUMBER"
              />
            </template>
          </PropertyInput>
        </PropertyRow>
      </div>
    </PropertyGroup>

    <!-- Appearance Section -->
    <PropertyGroup v-if="showField('shadow') || showField('opacity')" title="Appearance" :open="true" :icon="Droplets">
      <div class="space-y-4">
        <div v-if="showField('opacity')" class="space-y-1.5">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Opacity</label>
          <PropertyInput
            label=""
            :model-value="Math.round((Number(getRawValue(styles.opacity)) || 1) * 100)"
            @update:model-value="(val) => updateStyle('opacity', parseFloat(val.toString()) / 100)"
            :icon="Droplets"
          />
        </div>

        <div v-if="showField('shadow')" class="space-y-1.5">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Shadow</label>
          <ButtonGroup
            :model-value="getRawValue(styles.shadow) as string"
            @update:model-value="(val) => updateStyle('shadow', val)"
            :options="shadowOptions"
            size="sm"
          />
        </div>
      </div>
    </PropertyGroup>

    <!-- Detailed Radius Section (Optional, only if showField('rounded') is true) -->
    <PropertyGroup v-if="showField('rounded')" title="Corners & Radius" :open="false" :icon="CornerUpLeft">
      <div class="space-y-4">
        <div class="space-y-1.5">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">All Corners</label>
          <div class="space-y-2">
            <PropertyInput
              label=""
              type="number"
              :model-value="getRawValue(styles.rounded)"
              @update:model-value="(val) => updateStyle('rounded', parseInt(val.toString()) || 0)"
              class="flex-1"
            >
              <template #action>
                <VariableInputControl
                  :model-value="styles.rounded"
                  @update:model-value="(val) => updateStyle('rounded', val)"
                  variable-type="NUMBER"
                />
              </template>
            </PropertyInput>
            <ButtonGroup
              :model-value="getRawValue(styles.rounded) as string"
              @update:model-value="(val) => updateStyle('rounded', val)"
              :options="roundedOptions"
              size="sm"
            />
          </div>
        </div>

        <div class="space-y-1.5 pt-2 border-t border-builder-bar-border/30">
          <label class="text-[10px] font-mono font-bold text-builder-bar-text/40 uppercase tracking-tighter ml-1">Individual Corners</label>
          <PropertyRow>
            <PropertyInput
              label="TL"
              type="number"
              :model-value="getRawValue(styles.roundedTopLeft)"
              @update:model-value="(val) => updateStyle('roundedTopLeft', parseInt(val.toString()) || 0)"
              class="flex-1"
            >
              <template #action>
                <VariableInputControl
                  :model-value="styles.roundedTopLeft"
                  @update:model-value="(val) => updateStyle('roundedTopLeft', val)"
                  variable-type="NUMBER"
                />
              </template>
            </PropertyInput>
            <PropertyInput
              label="TR"
              type="number"
              :model-value="getRawValue(styles.roundedTopRight)"
              @update:model-value="(val) => updateStyle('roundedTopRight', parseInt(val.toString()) || 0)"
              class="flex-1"
            >
              <template #action>
                <VariableInputControl
                  :model-value="styles.roundedTopRight"
                  @update:model-value="(val) => updateStyle('roundedTopRight', val)"
                  variable-type="NUMBER"
                />
              </template>
            </PropertyInput>
          </PropertyRow>
          <PropertyRow>
            <PropertyInput
              label="BL"
              type="number"
              :model-value="getRawValue(styles.roundedBottomLeft)"
              @update:model-value="(val) => updateStyle('roundedBottomLeft', parseInt(val.toString()) || 0)"
              class="flex-1"
            >
              <template #action>
                <VariableInputControl
                  :model-value="styles.roundedBottomLeft"
                  @update:model-value="(val) => updateStyle('roundedBottomLeft', val)"
                  variable-type="NUMBER"
                />
              </template>
            </PropertyInput>
            <PropertyInput
              label="BR"
              type="number"
              :model-value="getRawValue(styles.roundedBottomRight)"
              @update:model-value="(val) => updateStyle('roundedBottomRight', parseInt(val.toString()) || 0)"
              class="flex-1"
            >
              <template #action>
                <VariableInputControl
                  :model-value="styles.roundedBottomRight"
                  @update:model-value="(val) => updateStyle('roundedBottomRight', val)"
                  variable-type="NUMBER"
                />
              </template>
            </PropertyInput>
          </PropertyRow>
        </div>
      </div>
    </PropertyGroup>


    <!-- Fill Section -->
    <PropertyGroup v-if="showField('bg')" title="Fill" :open="true" :icon="Square">
      <div class="space-y-2">
        <VariableInputControl
          :model-value="styles.bg"
          @update:model-value="(val) => updateStyle('bg', val)"
          variable-type="COLOR"
        >
          <CompositionColorPicker
            :is-open="activePicker === 'bg'"
            :initial-color="'#' + getHexValue(styles.bg)"
            @close="activePicker = null"
            @color-change="(hex) => updateStyle('bg', { type: 'static', value: hex })"
          >
            <template #trigger>
              <button
                @click="activePicker = 'bg'"
                class="w-full h-8 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-xs hover:border-builder-bar-border/80 transition-colors"
              >
                <div
                  class="w-4 h-4 rounded-sm border border-builder-bar-border shrink-0"
                  :style="{ backgroundColor: '#' + getHexValue(styles.bg) }"
                />
                <span class="text-builder-bar-text/60 font-mono text-[10px] flex-1 text-left truncate">{{ getRawValue(styles.bg) || 'Transparent' }}</span>
              </button>
            </template>
          </CompositionColorPicker>
        </VariableInputControl>
      </div>
    </PropertyGroup>

    <!-- Stroke Section -->
    <PropertyGroup v-if="showField('borderWidth')" title="Stroke" :open="false" :icon="Minus">
      <div class="space-y-3">
        <PropertyRow>
          <PropertyInput
            label="Weight"
            :model-value="getRawValue(styles.borderWidth) || 0"
            @update:model-value="(val) => updateStyle('borderWidth', parseInt(val.toString()) || 0)"
            type="number"
            class="flex-1"
          />
          <div class="flex items-end flex-1">
            <select
              :value="getRawValue(styles.borderStyle)"
              @input="(e: any) => updateStyle('borderStyle', e.target.value)"
              class="w-full h-7 bg-builder-input-bg border border-builder-bar-border rounded text-[10px] px-2 outline-none focus:border-primary"
            >
               <option v-for="opt in borderStyleOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
        </PropertyRow>

        <div v-if="showField('borderColor')" class="space-y-2">
          <VariableInputControl
            :model-value="styles.borderColor"
            @update:model-value="(val) => {
              const updates: Record<string, any> = { borderColor: val };
              if (val && !getRawValue(styles.borderWidth)) {
                updates.borderWidth = 1;
              }
              updateStyles(updates);
            }"
            variable-type="COLOR"
          >
            <CompositionColorPicker
              :is-open="activePicker === 'border'"
              :initial-color="'#' + getHexValue(styles.borderColor)"
              @close="activePicker = null"
              @color-change="(hex) => {
                const updates: Record<string, any> = { borderColor: { type: 'static', value: hex } };
                if (!getRawValue(styles.borderWidth)) {
                  updates.borderWidth = 1;
                }
                updateStyles(updates);
              }"
            >
              <template #trigger>
                <button
                  @click="activePicker = 'border'"
                  class="w-full h-8 px-2 flex items-center gap-2 bg-builder-input-bg border border-builder-bar-border rounded text-xs hover:border-builder-bar-border/80 transition-colors"
                >
                  <div
                    class="w-4 h-4 rounded-sm border border-builder-bar-border shrink-0"
                    :style="{ backgroundColor: '#' + getHexValue(styles.borderColor) }"
                  />
                  <span class="text-builder-bar-text/60 font-mono text-[10px] flex-1 text-left truncate">{{ getRawValue(styles.borderColor) || 'Transparent' }}</span>
                </button>
              </template>
            </CompositionColorPicker>
          </VariableInputControl>
        </div>
      </div>
    </PropertyGroup>
  </div>
</template>

<style scoped>
select {
  @apply transition-all duration-200;
}
</style>
