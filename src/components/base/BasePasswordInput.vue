<script setup lang="ts">
import { ref } from 'vue';
import { EyeOff, Eye } from 'lucide-vue-next';

// 1. On définit les options du composant ici (remplace la 2ème balise script)
defineOptions({
  inheritAttrs: false
});

// 2. Définition des Props
defineProps({
    modelValue: { type: String, default: '' },
    value: { type: String, default: '' },
    placeholder: { type: String, default: '••••••••' },
    label: { type: String, default: 'Password' },
    id: { type: String, default: () => `pw-${Math.random().toString(36).substring(2, 7)}` }
});

// 3. Définition des Emits
const emit = defineEmits(['update:modelValue', 'input', 'blur']);

const showPassword = ref(false);

const handleInput = (event: Event) => {
    const val = (event.target as HTMLInputElement).value;
    emit('update:modelValue', val);
    emit('input', event);
};
</script>

<template>
    <div class="w-full">
        <label :for="id" class="block text-sm/6 font-medium text-text">{{ label }}</label>

        <div class="mt-2 relative">
            <input
                v-bind="$attrs"
                :id="id"
                :type="showPassword ? 'text' : 'password'"
                :value="modelValue || value"
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
                <Eye v-if="showPassword" class="size-5" />
                <EyeOff v-else class="size-5" />
            </button>
        </div>
    </div>
</template>
