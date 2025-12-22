<script setup lang="ts">
import { ref, computed } from 'vue';
import { cn } from '../../lib/utils'; // Utilitaire pour fusionner les classes

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '••••••••' },
    label: { type: String, default: 'Password' }, // Ajout d'un label personnalisable
    id: { type: String, default: () => `pw-${Math.random().toString(36).substring(2, 7)}` }
});

const showPassword = ref(false);

// --- Analyse des critères ---
const requirements = computed(() => [
    { label: '8 caractères', met: props.modelValue.length >= 8 },
    { label: 'Majuscule', met: /[A-Z]/.test(props.modelValue) },
    { label: 'Chiffre', met: /[0-9]/.test(props.modelValue) },
    { label: 'Spécial', met: /[^A-Za-z0-9]/.test(props.modelValue) },
]);

const strengthScore = computed(() => requirements.value.filter(r => r.met).length);

const strengthConfig = computed(() => {
    const configs = [
        { width: '0%', color: 'bg-gray-200' },
        { width: '25%', color: 'bg-red-500' },
        { width: '50%', color: 'bg-orange-500' },
        { width: '75%', color: 'bg-yellow-500' },
        { width: '100%', color: 'bg-green-600' },
    ];
    return configs[strengthScore.value];
});
</script>

<template>
    <div class="w-full">
        <label :for="id" class="block text-sm/6 font-medium text-gray-900">{{ label }}</label>
        
        <div class="mt-2 relative">
            <input
                :id="id"
                :type="showPassword ? 'text' : 'password'"
                :value="modelValue"
                @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
                :placeholder="placeholder"
                class="block w-full rounded-md bg-white px-3 py-1.5 pr-10 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
            />

            <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
            >
                <span v-if="showPassword" title="Masquer">🙈</span>
                <span v-else title="Afficher">👁️</span>
            </button>
        </div>

        <div v-if="modelValue && strengthConfig" class="mt-3 space-y-3">
            <div class="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                    :class="cn('h-full transition-all duration-500', strengthConfig.color)"
                    :style="{ width: strengthConfig.width }"
                ></div>
            </div>

            <ul class="flex flex-wrap gap-x-4 gap-y-1">
                <li 
                    v-for="req in requirements" 
                    :key="req.label"
                    class="text-[11px] flex items-center gap-1.5"
                    :class="req.met ? 'text-green-600' : 'text-gray-400'"
                >
                    <span class="text-[10px]">{{ req.met ? '●' : '○' }}</span>
                    {{ req.label }}
                </li>
            </ul>
        </div>
    </div>
</template>