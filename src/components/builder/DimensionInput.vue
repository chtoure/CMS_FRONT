<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import Select from '../../components/ui/select/Select.vue';
import SelectTrigger from '../../components/ui/select/SelectTrigger.vue';
import SelectValue from '../../components/ui/select/SelectValue.vue';
import SelectContent from '../../components/ui/select/SelectContent.vue';
import SelectItem from '../../components/ui/select/SelectItem.vue';
import Input from '../../components/ui/input/Input.vue';
import { Settings2 } from 'lucide-vue-next';

const props = defineProps<{
  modelValue?: string | number;
  label?: string;
  placeholder?: string;
}>();

const emit = defineEmits(['update:modelValue']);

// Options prédéfinies
const presets = [
  { value: 'custom', label: 'Custom' },
  { value: 'auto', label: 'Auto' },
  { value: 'full', label: 'Plein (100%)' },
  { value: 'screen', label: 'Écran (Viewport)' },
];

const currentMode = computed(() => {
  if (props.modelValue === 'auto') return 'auto';
  if (props.modelValue === 'full') return 'full';
  if (props.modelValue === 'screen') return 'screen';
  return 'custom';
});

// Valeur numérique pour l'input custom
const customValue = ref<string | number>('');

watch(() => props.modelValue, (newVal) => {
  if (currentMode.value === 'custom') {
    // Avoid overwriting if compatible to prevent cursor jumping/loss of formatting
    // If we are typing "1.", newVal comes back as 1.
    // If we are typing "10", newVal comes back as 10.
    
    const currentNum = parseFloat(String(customValue.value));
    const newNum = typeof newVal === 'number' ? newVal : parseFloat(String(newVal));

    // If strictly equal, or if both are numbers and equal, don't update
    if (newVal === customValue.value) return;
    if (!isNaN(currentNum) && !isNaN(newNum) && currentNum === newNum) {
        // Check if customValue has a trailing decimal point or is being typed matches the number
        // e.g. "1." vs 1 -> match -> don't update
        // e.g. "01" vs 1 -> match -> don't update (preserves leading zero)
        return; 
    }
    
    customValue.value = newVal || '';
  }
}, { immediate: true });

const handleModeChange = (val: string | null | unknown) => {
  if (typeof val !== 'string') return;
  
  if (val === 'custom') {
    // Si on passe en custom, on garde la valeur précédente si c'était un chiffre, sinon vide ou défaut
    if (typeof props.modelValue === 'number' || (typeof props.modelValue === 'string' && !isNaN(Number(props.modelValue)))) {
       // Déjà un nombre, on ne change rien
    } else {
      emit('update:modelValue', customValue.value || 0);
    }
  } else {
    emit('update:modelValue', val);
  }
};

const handleCustomInput = (val: string | number) => {
  let strVal = String(val);
  
  if (strVal === '') {
    emit('update:modelValue', undefined);
    customValue.value = '';
    return;
  }

  // Sanitization: Remove 'px' if present to treat as number
  if (strVal.toLowerCase().endsWith('px')) {
      strVal = strVal.slice(0, -2).trim();
  }

  // Try to parse as number
  const num = Number(strVal);
  if (!isNaN(num)) {
    emit('update:modelValue', num);
  } else {
    // Si c'est du texte libre (ex: "50%"), on l'envoie tel quel
    emit('update:modelValue', strVal); 
  }
  
  // Update local value to reflect typing
  customValue.value = val;
};

</script>

<template>
  <div class="flex gap-1.5 w-full">
    <!-- Selecteur de Mode -->
    <div :class="[currentMode === 'custom' ? 'w-[45px] shrink-0' : 'w-full']">
      <Select :model-value="currentMode" @update:model-value="(val) => handleModeChange(val)">
        <SelectTrigger class=" text-xs bg-builder-input-bg border-builder-input-border px-2 justify-center !rounded h-8">
            <template v-if="currentMode === 'custom'">
                <Settings2 class="w-3.5 h-3.5" />
            </template>
            <template v-else>
                <SelectValue class="select-item-custom" />
            </template>
        </SelectTrigger>
        <SelectContent class="border-builder-bar-border">
            <SelectItem v-for="preset in presets" :key="preset.value" :value="preset.value" class="select-item-custom">{{ preset.label }}</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Input Custom -->
    <div v-if="currentMode === 'custom'" class="flex-1">
      <Input 
        type="text" 
        :model-value="customValue" 
        @update:model-value="handleCustomInput" 
        class="h-8 input-custom" 
        :placeholder="props.placeholder || 'px, %, rem...'"
        auto-focus
      />
    </div>
  </div>
</template>


<style scoped>
.input-custom {
  @apply h-8 w-full !rounded px-3 py-1 text-[11px] shadow-sm transition-all outline-none !font-mono;
  
  background-color: var(--builder-input-bg);
  border: 1px solid var(--builder-input-border);
  color: var(--builder-input-text);
  
  @apply focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:border-transparent;

  --tw-ring-color: #3B82F6;
}

.input-custom::placeholder {
  color: var(--builder-input-placeholder);
}

.select-item-custom {
  @apply cursor-pointer transition-colors px-2 py-1.5 !rounded !font-mono;
  color: var(--builder-bar-text);
}

.select-item-custom[data-highlighted] {
  background-color: var(--primary) !important;
  color: #F8FAFC !important;
  outline: none !important;
}</style>
