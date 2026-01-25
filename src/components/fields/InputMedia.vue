<script setup lang="ts">
import MediaPreview from '../../components/composition/MediaPreview.vue'
import { computed } from 'vue'
import { Label } from '../../components/ui/label'
import CompositionMediaPicker from '../../components/composition/CompositionMediaPicker.vue'
import { type IFieldDefinition, type IMediaConfig, type IBaseField } from '../../type/field'
import { type JsonValue } from '../../type/content-entry'
import type { Media } from '../../type/media'

const props = defineProps<{
  config: IFieldDefinition
  modelValue?: JsonValue
  error?: string
  hideLabel?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get: () => {
    if (!props.modelValue) return null
    if (Array.isArray(props.modelValue)) {
      return props.modelValue.map((item) => {
          if (typeof item === 'object' && item !== null && 'id' in item) {
              return ((item as unknown) as Media).id
          }
          return item as number
      })
    }
    if (typeof props.modelValue === 'object' && props.modelValue !== null && 'id' in props.modelValue) {
        return ((props.modelValue as unknown) as Media).id
    }
    return props.modelValue as number | null
  },
  set: (val) => {
    emit('update:modelValue', val as JsonValue)
  }
})

const mediaConfig = computed(() => props.config as IBaseField & IMediaConfig)

const ids = computed(() => {
    const v = value.value
    if (v === null || v === undefined) return []
    return Array.isArray(v) ? v : [v]
})

const removeMedia = (id: number) => {
    const v = value.value
    if (Array.isArray(v)) {
        value.value = v.filter(i => i !== id)
    } else if (v === id) {
        value.value = null
    }
}
</script>

<template>
  <div class="grid w-full items-center gap-1.5">
    <Label v-if="!hideLabel" :for="config.name" class="block text-text font-medium mb-2" :class="{ 'text-destructive': error }">
      {{ config.label }}
      <span v-if="config.required" class="text-destructive">*</span>
    </Label>

    <div class="mt-2 space-y-3">
       <!-- Selected Media Cards -->
       <div v-if="ids.length > 0" class="flex flex-wrap gap-4">
            <MediaPreview
                v-for="id in ids"
                :key="id"
                :media-id="id"
                @remove="removeMedia"
            />
       </div>

      <CompositionMediaPicker
        v-model="value"
        :multiple="mediaConfig.multiple"
        :allowed-types="mediaConfig.allowedTypes"
        :trigger-text="ids.length > 0 ? (mediaConfig.multiple ? 'Modifier la sélection' : 'Changer le média') : 'Sélectionner ' + (mediaConfig.multiple ? 'des médias' : 'un média')"
      />
    </div>

    <p v-if="config.description" class="text-xs text-muted-foreground">
      {{ config.description }}
    </p>
    <p v-if="error" class="mt-2 text-xs text-destructive font-medium italic">
      {{ error }}
    </p>
  </div>
</template>
