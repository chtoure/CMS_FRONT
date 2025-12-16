<script setup lang="ts">

import { Sun, Moon } from 'lucide-vue-next'; 
import { useTheme } from '@/stores/theme';

const darkModeStore=useTheme();

</script>


<template>
    <button
        @click="darkModeStore.swithTheme"
        class="flex items-center justify-center p-2 rounded-md transition-colors hover:bg-accent focus:outline-none"
    >
        <Sun v-if="darkModeStore.isDark" class="w-4 h-4 text-yellow-500 hover:text-yellow-400 transition-colors" />
        <Moon v-else class="w-4 h-4 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors" />
    </button>
    
</template>