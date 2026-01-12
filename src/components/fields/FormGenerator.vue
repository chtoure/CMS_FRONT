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
const getColSpan = (field: IFieldDefinition) => {
  if (field.colSpan) return field.colSpan === 2 ? 'md:col-span-2' : 'md:col-span-1'

  // Default logic based on type
  const fullWidthTypes = [FieldType.RICH_TEXT, FieldType.RELATION]
  if (fullWidthTypes.includes(field.type)) return 'md:col-span-2'

  if (field.type === FieldType.MEDIA && field.multiple) return 'md:col-span-2'
  if (field.type === FieldType.TAXONOMY && (field.multiple || field.renderType === 'badges')) return 'md:col-span-2'

  return 'md:col-span-1'
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 grid-flow-dense items-start gap-4">
    <div
      v-for="field in fields"
      :key="field.name"
      class="py-2"
      :class="getColSpan(field)"
    >
      <component
        :is="getComponent(field.type)"
        v-if="getComponent(field.type)"
        :config="field"
        v-model="formData[field.name]"
        :error="errors?.[field.name]"
      />
    </div>
  </div>
</template>
