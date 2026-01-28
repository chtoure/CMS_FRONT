<script setup lang="ts">
import { ref, computed } from 'vue';
import { cn } from '../../lib/utils';
import { EyeOff, Eye } from 'lucide-vue-next';

// 1. Configuration pour que Vee-Validate (v-bind) fonctionne sur l'input uniquement
defineOptions({
    inheritAttrs: false
});

const props = defineProps({
    modelValue: { type: String, default: '' },
    value: { type: String, default: '' }, // Ajouté pour Vee-validate
    placeholder: { type: String, default: '••••••••' },
    label: { type: String, default: 'Password' },
    id: { type: String, default: () => `pw-${Math.random().toString(36).substring(2, 7)}` },
    showStrength: { type: Boolean, default: true }
});

const emit = defineEmits(['update:modelValue', 'input', 'blur']);

const showPassword = ref(false);

// Utilitaire pour obtenir la valeur actuelle (v-model ou v-bind)
const currentValue = computed(() => props.modelValue || props.value || '');

const handleInput = (event: Event) => {
    const val = (event.target as HTMLInputElement).value;
    emit('update:modelValue', val); // Pour v-model
    emit('input', event);           // Pour Vee-validate
};

// --- Analyse de la force basée sur currentValue ---
const requirements = computed(() => [
    { label: '8 caractères', met: currentValue.value.length >= 8 },
    { label: 'Majuscule', met: /[A-Z]/.test(currentValue.value) },
    { label: 'Chiffre', met: /[0-9]/.test(currentValue.value) },
    { label: 'Spécial', met: /[^A-Za-z0-9]/.test(currentValue.value) },
]);

const strengthScore = computed(() => requirements.value.filter(r => r.met).length);

const strengthConfig = computed(() => {
    switch (strengthScore.value) {
        case 1: return { width: '25%', color: 'bg-destructive' };
        case 2: return { width: '50%', color: 'bg-accent' };
        case 3: return { width: '75%', color: 'bg-yellow-500' };
        case 4: return { width: '100%', color: 'bg-success' };
        default: return { width: '0%', color: 'bg-gray-200' };
    }
});
</script>

<template>
    <div class="w-full">
        <label :for="id" class="block text-sm font-medium text-text">{{ label }}</label>

        <div class="mt-2 relative">
            <input
                v-bind="$attrs"
                :id="id"
                :type="showPassword ? 'text' : 'password'"
                :value="currentValue"
                @input="handleInput"
                @blur="emit('blur', $event)"
                :placeholder="placeholder"
                class="input-custom"
            />

            <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-text opacity-50 hover:opacity-100 transition-colors focus:outline-none"
            >
                <Eye v-if="showPassword" class="size-4" />
                <EyeOff v-else class="size-4" />
            </button>
        </div>

        <div v-if="showStrength && currentValue" class="mt-3 space-y-3">
            <div class="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border/50">
                <div
                    :class="cn('h-full transition-all duration-500', strengthConfig.color)"
                    :style="{ width: strengthConfig.width }"
                ></div>
            </div>

            <ul class="flex flex-wrap gap-x-4 gap-y-1">
                <li
                    v-for="req in requirements"
                    :key="req.label"
                    class="text-[11px] flex items-center gap-1.5 transition-colors duration-300"
                    :class="req.met ? 'text-green-500' : 'text-text/50'"
                >
                    <span class="text-[10px]">{{ req.met ? '●' : '○' }}</span>
                    {{ req.label }}
                </li>
            </ul>
        </div>
    </div>
</template>
