<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'

import { useTheme } from '@/stores/theme'; 
import { watch, onMounted } from 'vue';

const themeStore = useTheme();

const applyThemeClass = (isDark:boolean) => {
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
};

onMounted(() => {
    applyThemeClass(!!themeStore.isDark);
});

watch(
    () => themeStore.isDark,
    (newVal) => {
        applyThemeClass(!!newVal);
    }
);
</script>

<template>
  <RouterView />
</template>

<style >

</style>
