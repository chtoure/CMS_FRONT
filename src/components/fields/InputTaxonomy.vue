<script setup lang="ts">
import { computed } from 'vue'
import { useVModel } from '@vueuse/core'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Plus, X } from 'lucide-vue-next'
import { type IFieldDefinition, type ITaxonomyConfig, type IBaseField } from '../../type/field'
import { type JsonValue } from '../../type/content-entry'

const props = defineProps<{
  config: IFieldDefinition
  modelValue?: JsonValue
  error?: string
}>()

const emit = defineEmits(['update:modelValue'])

const value = useVModel(props, 'modelValue', emit)

const taxonomyConfig = computed(() => props.config as IBaseField & ITaxonomyConfig)

const removeTerm = (index: number) => {
  if (Array.isArray(value.value)) {
    value.value.splice(index, 1)
  } else {
    value.value = null
  }
}

// Placeholder for taxonomy selection logic
const openTaxonomySelector = () => {
  console.log('Opening taxonomy selector for', taxonomyConfig.value.taxonomy_slug)
}
</script>

<template>
  <div class="grid w-full items-center gap-1.5">
    <Label :for="config.name" class="block text-text font-medium mb-2" :class="{ 'text-destructive': error }">
      {{ config.label }}
      <span v-if="config.required" class="text-destructive">*</span>
    </Label>

    <div class="flex flex-wrap gap-2 mt-1">
      <template v-if="value">
        <Badge
          v-for="(item, index) in (Array.isArray(value) ? value : [value])"
          :key="index"
          variant="secondary"
          class="flex items-center gap-1 pr-1"
        >
          {{ item }}
          <button @click="removeTerm(index)" class="hover:bg-muted rounded-full p-0.5">
            <X class="h-3 w-3" />
          </button>
        </Badge>
      </template>

      <Button
        v-if="taxonomyConfig.multiple || !value"
        variant="outline"
        size="sm"
        class="h-7 border-dashed"
        @click="openTaxonomySelector"
      >
        <Plus class="h-4 w-4 mr-1" />
        Sélect.
      </Button>
    </div>

    <p v-if="config.description" class="text-xs text-muted-foreground">
      {{ config.description }}
    </p>
    <p v-if="error" class="mt-2 text-xs text-destructive font-medium italic">
      {{ error }}
    </p>
  </div>
</template>
