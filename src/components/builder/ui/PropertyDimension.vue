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

// Les options prédéfinies avec des libellés en français
const predefinedOptions = [
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

const localSelectValue = ref('auto');
const localNumberValue = ref<number | ''>('');

// Initialisation et synchronisation externe
watch(() => props.modelValue, (newVal) => {
  if (newVal === undefined || newVal === null || newVal === '') {
    isCustom.value = false;
    localSelectValue.value = 'auto'; // Valeur par défaut si rien n'est défini
    localNumberValue.value = '';
    return;
  }

  const strVal = String(newVal);

  if (PREDEFINED_VALUES.includes(strVal)) {
    isCustom.value = false;
    localSelectValue.value = strVal;
    localNumberValue.value = '';
  } else {
    // C'est une valeur personnalisée (probablement un nombre ou une classe tailwind du type "w-64")
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
    <div class="grid grid-cols-10 items-center justify-between h-7 px-1 bg-builder-input-bg border border-builder-bar-border rounded hover:border-builder-bar-border transition-all focus-within:border-primary group relative">
      
      <!-- Label Area -->
      <div class="col-span-2 flex items-center justify-start gap-1.5 shrink-0 opacity-40 group-hover:opacity-60 transition-opacity">
        <span class="text-[9px] font-bold font-mono tracking-tight">{{ label }}</span>
      </div>

      <!-- Input Area -->
      <div class="col-span-7 flex items-center w-full h-full relative">
        <select 
          :value="isCustom ? 'custom' : localSelectValue"
          @change="handleSelectChange"
          class="bg-transparent border-none text-[10px] text-builder-bar-text outline-none appearance-none cursor-pointer absolute inset-0 w-full truncate"
          :class="{ 'opacity-0 z-0 pointer-events-none': isCustom, 'z-10': !isCustom }"
          style="padding-right: 0.25rem;"
          title="Sélectionner un mode"
        >
          <option v-for="opt in predefinedOptions" :key="opt.value" :value="opt.value">
             {{ opt.label }}
          </option>
          <option value="custom" class="italic text-primary !font-bold">Valeur exacte...</option>
        </select>

        <!-- Champ de saisie numérique (visible uniquement si 'custom') -->
        <input
          v-if="isCustom"
          type="number"
          :value="localNumberValue"
          @input="handleNumberInput"
          placeholder="Ex: 64"
          class="input-field z-10 absolute inset-0 w-full bg-transparent px-2 text-right !pr-5"
        />

        <!-- Bouton pour revenir au mode dropdown -->
         <button 
            v-if="isCustom" 
            @click="isCustom = false; localSelectValue = 'auto'; emit('update:modelValue', 'auto');" 
            class="absolute right-0 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 flex items-center pr-1 z-20 cursor-pointer text-red-400"
            title="Revenir aux options prédéfinies"
         >
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
         </button>

      </div>

      <!-- Variable/Action Slot for VariableInputControl -->
      <div class="shrink-0 col-span-1 flex items-center justify-end z-30">
        <slot name="action" />
      </div>

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
