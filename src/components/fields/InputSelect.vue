<script setup lang="ts">
import { ref } from 'vue'
import { Check, ChevronsUpDown, X } from 'lucide-vue-next'
import { type IFieldDefinition, type ISelectConfig } from '../../type/field'
import { cn } from '../../lib/utils'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Label } from '../../components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../components/ui/command'

const props = defineProps<{
  config: IFieldDefinition & ISelectConfig
  modelValue?: string | number | (string | number)[] | null
  error?: string
  hideLabel?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | (string | number)[] | null): void
}>()

const open = ref(false)


const handleSelect = (optionValue: string | number) => {
  if (props.config.multiple) {
    const currentValues = Array.isArray(props.modelValue) ? [...props.modelValue] : []
    const index = currentValues.indexOf(optionValue)

    if (index > -1) {
      currentValues.splice(index, 1)
    } else {
      currentValues.push(optionValue)
    }
    emit('update:modelValue', currentValues)
  } else {
    emit('update:modelValue', optionValue)
    open.value = false
  }
}

const removeItem = (val: string | number) => {
  if (Array.isArray(props.modelValue)) {
    emit('update:modelValue', props.modelValue.filter(i => i !== val))
  }
}
</script>

<template>
  <div class="grid w-full items-center gap-1.5 text-black">
    <Label v-if="!hideLabel" :for="config.name" class="font-medium text-sm mb-1" :class="{ 'text-destructive': error }">
      {{ config.label }}
      <span v-if="config.required" class="text-destructive">*</span>
    </Label>

    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          role="combobox"
          :aria-expanded="open"
          class="justify-between w-full h-auto min-h-10 font-normal bg-transparent border-border active:ring-1 active:ring-primary"
        >
          <div class="flex flex-wrap gap-1 text-left">
            <template v-if="config.multiple && Array.isArray(modelValue) && modelValue.length > 0">
              <Badge
                v-for="val in modelValue"
                :key="val"
                variant="secondary"
                class="mr-1 py-1 px-2"
              >
                {{ val }}
                <X class="ml-1 h-3 w-3 cursor-pointer hover:text-destructive" @click.stop="removeItem(val)" />
              </Badge>
            </template>

            <template v-else-if="!config.multiple && modelValue !== undefined && modelValue !== null && modelValue !== ''">
              {{ modelValue }}
            </template>

            <span v-else class="text-text">
              {{ config.placeholder || 'Sélectionner...' }}
            </span>
          </div>
          <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent class="p-0 w-[--radix-popover-trigger-width] pointer-events-auto" align="start">
        <Command>
          <CommandInput :placeholder="`Rechercher dans ${config.label}...`" />
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              <CommandItem
                v-for="option in config.options"
                :key="option"
                :value="String(option)"
                @select="handleSelect(option)"
                class="cursor-pointer select-item-custom"
              >
                <Check
                  :class="cn(
                    'mr-2 h-4 w-4 transition-opacity',
                    (config.multiple && Array.isArray(modelValue) && modelValue.includes(option)) || modelValue === option
                      ? 'opacity-100' : 'opacity-0'
                  )"
                />
                {{ option }}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>

    <p v-if="config.description && !error" class="text-[0.8rem] text-muted-foreground">
      {{ config.description }}
    </p>
    <p v-if="error" class="text-[0.8rem] text-destructive font-medium italic">
      {{ error }}
    </p>
  </div>
</template>
