<template>
    <h3 class="bg-red-500 dark:bg-black">Binvenu dans compositor</h3>
    <button v-on:click="darkModeStore.swithTheme">{{ darkModeStore.isDark ? 'Dark' : 'Light' }} theme</button>
</template>

<script setup>
import { useTheme } from '../../stores/theme';

    const darkModeStore=useTheme();
 
</script>