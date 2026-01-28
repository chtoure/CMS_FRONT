<script setup lang="ts">
import { computed } from 'vue'
import { FieldType, type IFieldDefinition } from '../../type/field'
import type { IContentData } from '../../type/content-entry'
import InputText from './InputText.vue'
import InputNumber from './InputNumber.vue'
import InputBoolean from './InputBoolean.vue'
import InputSelect from './InputSelect.vue'
import InputMedia from './InputMedia.vue'
import InputRichText from './InputRichText.vue'
import InputTaxonomy from './InputTaxonomy.vue'
import InputRelation from './InputRelation.vue'

const props = defineProps<{
  fields: IFieldDefinition[]
  modelValue: IContentData
  errors?: Record<string, string>
}>()

const emit = defineEmits(['update:modelValue'])

const formData = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const getComponent = (type: FieldType) => {
  switch (type) {
    case FieldType.TEXT: return InputText
    case FieldType.NUMBER: return InputNumber
    case FieldType.BOOLEAN: return InputBoolean
    case FieldType.SELECT: return InputSelect
    case FieldType.MEDIA: return InputMedia
    case FieldType.RICH_TEXT: return InputRichText
    case FieldType.TAXONOMY: return InputTaxonomy
    case FieldType.RELATION: return InputRelation
    default: return null
  }
}
</script>

<template>
  <div class="flex flex-col divide-y divide-border border border-border">
    <div
      v-for="field in fields"
      :key="field.name"
      class="flex flex-col md:flex-row"
    >
      <!-- Label Column -->
      <div class="w-full md:w-1/4 lg:w-1/5 bg-muted/20 p-4 border-r border-border flex items-start pt-6">
        <label :for="field.name" class="text-sm font-semibold text-foreground/80 leading-none">
          {{ field.label }}
          <span v-if="field.required" class="text-destructive">*</span>
        </label>
      </div>

      <!-- Input Column -->
      <div class="flex-1 p-4 min-w-0">
        <component
          :is="getComponent(field.type)"
          v-if="getComponent(field.type)"
          :config="field"
          v-model="formData[field.name]"
          :error="errors?.[field.name]"
          :hideLabel="true"
        />
      </div>
    </div>
  </div>
</template>
