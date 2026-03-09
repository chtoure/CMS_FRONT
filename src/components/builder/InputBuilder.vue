<script setup lang="ts">
import { computed } from 'vue';
import type { InputStyles, AnyComponentInstance } from '../../type/component';
import { buildInputStyles, buildInputInlineStyles } from '../../lib/style/inputProcessor';
import { useVariableResolver } from '../../hook/variable';
import { inject } from 'vue';

interface Props {
  styles?: InputStyles;
  data?: {
    type?: any;
    placeholder?: any;
    label?: any;
    name?: any;
    id?: any;
    defaultValue?: any;
    required?: any;
    disabled?: any;
  };
  element?: AnyComponentInstance;
  children?: AnyComponentInstance[];
}

const props = defineProps<Props>();

const builderState = inject<{
  currentBreakpoint: { value: 'default' | 'sm' | 'md' | 'lg' }
}>('builderState', { currentBreakpoint: { value: 'default' } } as any);

const { resolveValue } = useVariableResolver();

const computedClasses = computed(() => {
  return buildInputStyles(props.styles as Record<string, unknown>, resolveValue);
});

const computedInlineStyles = computed(() => {
  const bp = builderState.currentBreakpoint.value;
  return buildInputInlineStyles(props.styles as Record<string, unknown>, bp, resolveValue);
});

const type = computed(() => (resolveValue(props.data?.type) as string) || 'text');
const placeholder = computed(() => resolveValue(props.data?.placeholder) as string);
const label = computed(() => resolveValue(props.data?.label) as string);
const name = computed(() => resolveValue(props.data?.name) as string);
const inputId = computed(() => (resolveValue(props.data?.id) as string) || name.value);
const defaultValue = computed(() => resolveValue(props.data?.defaultValue) as string | number);
const required = computed(() => !!resolveValue(props.data?.required));
const disabled = computed(() => !!resolveValue(props.data?.disabled));
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label
      v-if="label"
      :for="inputId"
      class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {{ label }}
    </label>
    <input
      :type="type"
      :name="name"
      :id="inputId"
      :placeholder="placeholder"
      :value="defaultValue"
      :required="required"
      :disabled="disabled"
      :class="[
        'flex h-10 w-full rounded-md border border-input ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all',
        !props.styles?.bg && 'bg-background',
        !props.styles?.padding && 'px-3 py-2',
        !props.styles?.fontSize && 'text-sm',
        computedClasses
      ]"
      :style="computedInlineStyles"
    />
  </div>
</template>
