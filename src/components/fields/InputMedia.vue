<script setup lang="ts">
import { ref, computed } from 'vue'
import { Label } from '../../components/ui/label'
import { Button } from '../../components/ui/button'
import { cn } from '../../lib/utils'
import { Plus, Image as ImageIcon, Video, X, Check } from 'lucide-vue-next'
import { type IFieldDefinition, type IMediaConfig, type IBaseField } from '../../type/field'
import type { Media } from '../../type/media'
import { type JsonValue } from '../../type/content-entry'
import { useGetMediaList } from '../../hook/media'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../../components/ui/command'

const props = defineProps<{
  config: IFieldDefinition
  modelValue?: JsonValue
  error?: string
}>()

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get: () => props.modelValue as Media | Media[] | null,
  set: (val) => emit('update:modelValue', val as JsonValue)
})

const mediaConfig = computed(() => props.config as IBaseField & IMediaConfig)

const isDialogOpen = ref(false)
const filterParams = computed(() => {
  return {
    type: mediaConfig.value.allowedTypes.length === 1 ? mediaConfig.value.allowedTypes[0] : undefined,
    page: 1,
    limit: 50
  }
})

const mediaQuery = useGetMediaList(filterParams)

const toggleSelection = (media: Media) => {
  if (mediaConfig.value.multiple) {
    const current = Array.isArray(value.value) ? [...value.value] : []
    const index = current.findIndex(m => m.id === media.id)
    if (index > -1) {
      current.splice(index, 1)
    } else {
      current.push(media)
    }
    value.value = current
  } else {
    value.value = media
  }
}

const removeMedia = (id: number) => {
  if (Array.isArray(value.value)) {
    value.value = value.value.filter((m: Media) => m.id !== id)
  } else {
    value.value = null
  }
}

const isSelected = (id: number) => {
  if (Array.isArray(value.value)) {
    return value.value.some(m => m.id === id)
  }
  return (value.value as Media | null)?.id === id
}
</script>

<template>
  <div class="grid w-full items-center gap-1.5">
    <Label :for="config.name" class="block text-text font-medium mb-2" :class="{ 'text-destructive': error }">
      {{ config.label }}
      <span v-if="config.required" class="text-destructive">*</span>
    </Label>

    <div class="flex flex-wrap gap-4 mt-2">
      <!-- Media Items Display -->
      <template v-if="value">
        <div
          v-for="(item, index) in (Array.isArray(value) ? value : [value])"
          :key="(item as Media).id || index"
          class="relative group w-24 h-24 rounded-md border bg-muted flex items-center justify-center overflow-hidden"
        >
          <img v-if="(item as Media).file_path && (item as Media).type === 'image'" :src="(item as Media).file_path" class="w-full h-full object-cover" />
          <video autoplay loop muted v-else-if="(item as Media).file_path && (item as Media).type === 'video'" :src="(item as Media).file_path" class="w-full h-full object-cover" />
          <div v-else class="flex flex-col items-center gap-1">
            <Video v-if="(item as Media).type === 'video'" class="h-8 w-8 text-muted-foreground" />
            <ImageIcon v-else class="h-8 w-8 text-muted-foreground" />
          </div>

          <button
            type="button"
            @click="removeMedia((item as Media).id)"
            class="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <X class="h-3 w-3" />
          </button>
        </div>
      </template>

      <!-- Add Button Triggering Popover (Combobox) -->
      <Popover v-model:open="isDialogOpen">
        <PopoverTrigger as-child>
          <Button
            v-if="mediaConfig.multiple || !value"
            variant="outline"
            type="button"
            role="combobox"
            :aria-expanded="isDialogOpen"
            class="w-24 h-24 border-dashed flex flex-col items-center justify-center gap-2"
          >
            <Plus class="h-6 w-6" />
            <span class="text-[10px]">Ajouter</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent class="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Rechercher un média..." />
            <CommandEmpty>Aucun média trouvé.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  v-for="media in mediaQuery.data.value?.results"
                  :key="media.id"
                  :value="String(media.id)"
                  class="cursor-pointer"
                  @select="() => {
                    toggleSelection(media)
                    if (!mediaConfig.multiple) isDialogOpen = false
                  }"
                >
                  <div class="flex items-center gap-3 w-full">
                    <Check
                      :class="cn(
                        'h-4 w-4 shrink-0',
                        isSelected(media.id) ? 'opacity-100' : 'opacity-0'
                      )"
                    />

                    <div class="h-10 w-10 shrink-0 rounded border overflow-hidden bg-muted flex items-center justify-center">
                      <img v-if="media.type === 'image'" :src="media.file_path" class="h-full w-full object-cover" />
                      <video v-else :src="media.file_path" autoplay loop muted class="h-full w-full object-cover" />
                    </div>

                    <span class="truncate flex-1 text-xs">
                      {{ media.alt || media.file_path.split('/').pop() }}
                    </span>
                  </div>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>

    <p v-if="config.description" class="text-xs text-muted-foreground">
      {{ config.description }}
    </p>
    <p v-if="error" class="mt-2 text-xs text-destructive font-medium italic">
      {{ error }}
    </p>
  </div>
</template>
