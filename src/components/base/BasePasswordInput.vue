
<script setup lang="ts">
import { ref } from 'vue';
import { EyeOff , Eye } from 'lucide-vue-next';

const emit = defineEmits(['update:modelValue']);

const { modelValue, placeholder, label, id } = defineProps({
    modelValue: { type: String, default: '' },
    placeholder: { type: String, default: '••••••••' },
    label: { type: String, default: 'Password' },
    id: { type: String, default: () => `pw-${Math.random().toString(36).substring(2, 7)}` }
});

// État pour la visibilité uniquement
const showPassword = ref(false);
</script>

<template>
    <div class="w-full">
        <label :for="id" class="block text-sm/6 font-medium text-text">{{ label }}</label>

        <div class="mt-2 relative">
            <input
                :id="id"
                :type="showPassword ? 'text' : 'password'"
                :value="modelValue"
                @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
                :placeholder="placeholder"
                class="input-custom"
            />

            <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-text opacity-50 transition-colors focus:outline-none"
            >
                <span v-if="showPassword" title="Masquer"><Eye /></span>
                <span v-else title="Afficher"><EyeOff /></span>
            </button>
        </div>
    </div>
</template>
