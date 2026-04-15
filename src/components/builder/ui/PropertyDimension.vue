<script setup lang="ts">
import { ref, watch } from 'vue';

interface Props {
  label: string;
  modelValue?: string | number;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: string | number | undefined]
}>();

const predefinedOptions = [
  { value: '', label: 'Par défaut (Hériter)' },
  { value: 'auto', label: 'Auto (Adaptable)' },
  { value: 'full', label: '100% (Toute la place)' },
  { value: 'screen', label: 'Plein écran (100vh/vw)' },
  { value: 'min-content', label: 'Contenu Minimum' },
  { value: 'max-content', label: 'Contenu Maximum' },
  { value: 'fit-content', label: 'Ajuster au contenu' },
];

const PREDEFINED_VALUES = predefinedOptions.map(o => o.value);

// État local pour gérer le type d'entrée actuel
const isCustom = ref(false);

const localSelectValue = ref('');
const localNumberValue = ref<number | ''>('');

// Initialisation et synchronisation externe
watch(() => props.modelValue, (newVal) => {
  if (newVal === undefined || newVal === null || newVal === '') {
    isCustom.value = false;
    localSelectValue.value = ''; // Valeur par défaut correspondant à "Par défaut"
    localNumberValue.value = '';
    return;
  }

  const strVal = String(newVal);

  // Vérifier si la valeur correspond à une option prédéfinie
  if (PREDEFINED_VALUES.includes(strVal)) {
    isCustom.value = false;
    localSelectValue.value = strVal;
    localNumberValue.value = '';
  } else {
    // C'est une valeur personnalisée
    isCustom.value = true;
    localSelectValue.value = 'custom';
    
    // Essayer de parser la valeur comme un nombre pour l'input
    const num = parseInt(strVal);
    localNumberValue.value = isNaN(num) ? '' : num;
  }
}, { immediate: true });

// Gestion des changements
const handleSelectChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  const val = target.value;
  
  if (val === 'custom') {
    isCustom.value = true;
    // On ne déclenche pas d'update tout de suite si l'utilisateur vient de passer en mode "Valeur exacte"
    // car le nombre affiché est probablement vide ou par défaut. Il faut qu'il saisisse la valeur.
    if (localNumberValue.value !== '') {
        emit('update:modelValue', localNumberValue.value);
    }
  } else {
    isCustom.value = false;
    localSelectValue.value = val;
    emit('update:modelValue', val);
  }
};

const handleNumberInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const val = target.value;
  
  if (val === '') {
     localNumberValue.value = '';
     emit('update:modelValue', undefined); 
  } else {
     const num = parseInt(val);
     localNumberValue.value = isNaN(num) ? '' : num;
     if (!isNaN(num)) {
         emit('update:modelValue', num);
     }
  }
};

</script>

<template>
  <div class="property-dimension">
    <div class="flex items-center justify-between mb-1">
      <label for="">
        <span class="text-[9px] font-bold font-mono tracking-tight text-builder-bar-text/70">{{ label }}</span>
      </label>
      <div class="shrink-0 flex items-center justify-end gap-1 z-30">
        <select 
          :value="isCustom ? 'custom' : localSelectValue"
          @change="handleSelectChange"
          class="bg-transparent border border-builder-bar-border hover:bg-white/5 rounded px-1 py-0.5 text-[9px] text-builder-bar-text/80 outline-none cursor-pointer w-16 truncate transition-colors appearance-none text-right"
          title="Sélectionner un mode de dimension"
        >
          <option v-for="opt in predefinedOptions" :key="opt.value" :value="opt.value">
             {{ opt.label }}
          </option>
          <option value="custom" class="italic !font-bold">Px / Personnalisé</option>
        </select>
        <slot name="action" />
      </div>
    </div>
    <div v-show="isCustom" class="grid grid-cols-10 items-center justify-between h-7 px-1 bg-builder-input-bg border border-builder-bar-border rounded hover:border-builder-bar-border transition-all focus-within:border-primary group relative">
      
      <!-- Input Area -->
      <div class="col-span-10 flex items-center w-full h-full relative">
        <!-- Champ de saisie numérique (visible uniquement si 'custom') -->
        <input
          type="number"
          :value="localNumberValue"
          @input="handleNumberInput"
          placeholder="Px..."
          class="input-field z-10 absolute inset-0 w-full bg-transparent px-2"
        />
      </div>

      <!-- Variable/Action Slot for VariableInputControl -->
      <!-- <div class="shrink-0 col-span-1 flex items-center justify-end z-30">
        <slot name="action" />
      </div> -->

    </div>
  </div>
</template>

<style scoped>
.property-dimension {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.input-field {
  flex: 1;
  min-width: 0;
  height: 100%;
  font-size: 10px;
  font-family: monospace;
  background: transparent;
  border: none;
  color: var(--builder-input-text);
  outline: none;
  /* Retirer les flèches du champ number */
  -moz-appearance: textfield;
  appearance: textfield;
}

.input-field::-webkit-outer-spin-button,
.input-field::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input-field::placeholder {
  color: var(--builder-input-placeholder);
  opacity: 0.5;
}

select {
   font-family: monospace;
}
select option {
    background-color: var(--builder-input-bg);
    color: var(--builder-input-text);
}
</style>
