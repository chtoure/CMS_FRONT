<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { useTheme } from '@/stores/theme'

const darkModeStore = useTheme()
</script>

<template>
    <button
        @click="darkModeStore.swithTheme"
        class="flex items-center justify-center p-2 rounded-lg transition-all duration-200 hover:bg-accent focus:outline-none text-foreground hover:text-primary"
    >
        <Sun v-if="darkModeStore.isDark" class="w-4 h-4" />
        <Moon v-else class="w-4 h-4" />
    </button>
</template>
