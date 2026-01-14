<script setup lang="ts">
import { computed } from 'vue'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select'
import { Label } from '../../components/ui/label'
import { type IFieldDefinition, type ISelectConfig, type IBaseField } from '../../type/field'
import { type JsonValue } from '../../type/content-entry'

const props = defineProps<{
  config: IFieldDefinition
  modelValue?: JsonValue
  error?: string
}>()

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get: () => String(props.modelValue ?? ''),
  set: (val) => {
    const originalOption = selectConfig.value.options.find(opt => String(opt) === val);
    emit('update:modelValue', originalOption !== undefined ? originalOption : val);
  }
})

const selectConfig = computed(() => props.config as IBaseField & ISelectConfig)
</script>

<template>
  <div class="grid w-full items-center gap-1.5">
    <Label :for="config.name" class="block text-text font-medium mb-2" :class="{ 'text-destructive': error }">
      {{ config.label }}
      <span v-if="config.required" class="text-destructive">*</span>
    </Label>
    <Select v-model="value">
      <SelectTrigger :id="config.name" class="border-border" :class="{ 'border-destructive': error }">
        <SelectValue :placeholder="config.placeholder || 'Sélectionner une option'" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem
          v-for="(option, index) in selectConfig.options"
          :key="index"
          :value="String(option)"
          class="select-item-custom"
        >
          {{ option }}
        </SelectItem>
      </SelectContent>
    </Select>
    <p v-if="config.description" class="text-xs text-muted-foreground">
      {{ config.description }}
    </p>
    <p v-if="error" class="mt-2 text-xs text-destructive font-medium italic">
      {{ error }}
    </p>
  </div>
</template>
