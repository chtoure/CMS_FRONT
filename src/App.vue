<script setup lang="ts">
import { RouterView } from 'vue-router'

import { useTheme } from './stores/theme';
import { watch, onMounted, watchEffect } from 'vue';

import { useGetParameters } from './hook/parameter';
import { useParameter } from './stores/parameter';
import RenderLoading from './views/error/RenderLoading.vue';

const themeStore = useTheme();
const { data: params, isLoading: parameterLoading} = useGetParameters()
const {setParameter} =useParameter();

watchEffect(() => {
  if (params.value) {
    setParameter(params.value)
  }
})

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
    <template v-if="parameterLoading">
        <RenderLoading/>
    </template>
    <template v-else>
        <RouterView />
    </template>
</template>

<style >

</style>
