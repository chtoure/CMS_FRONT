<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import CompositionHeader from '@/components/composition/CompositionHeader.vue'
import CompositionSidebar from '../components/composition/CompositionSidebar.vue'
import { cn } from '../lib/utils'
import { useGetParameters } from '../hook/parameter'
import { useHead } from '@vueuse/head'

const { data: params} = useGetParameters()

const seoData = computed(() => ({
  title: params.value?.title || "Compositor",
  description: params.value?.description || "Gérez vos actifs visuels avec précision sur la plateforme Compositor.",
}))

useHead({
  title: () => seoData.value.title,
  meta: [
    { name: 'description', content: () => seoData.value.description },
    { property: 'og:title', content: () => seoData.value.title },
    { property: 'og:description', content: () => seoData.value.description },
    { name: 'twitter:card', content: 'summary_large_image' },
  ],
})

const isSidebarCollapsed = ref(false)
const isMobile = ref(false)
const route = useRoute()

onMounted(() => {
  setCollapsedByViewport()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

watch(() => route.fullPath, () => {
  if (window.innerWidth < 1024) {
    isSidebarCollapsed.value = true
  }
})

const setCollapsedByViewport = () => {
  isMobile.value = window.innerWidth < 1024
  isSidebarCollapsed.value = isMobile.value
}

const handleResize = () => {
  setCollapsedByViewport()
}

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}
</script>

<template>
  <div class="flex h-screen bg-background overflow-hidden relative">

    <div
      :class="cn(
        'transition-all duration-500 ease-in-out z-50',
        'fixed inset-y-0 left-0 bg-sidebar shadow-2xl lg:shadow-none',
        'lg:static lg:translate-x-0 border-r border-sidebar-border',
        isSidebarCollapsed
          ? '-translate-x-full lg:translate-x-0 lg:w-20'
          : 'translate-x-0 w-72'
      )"
    >
      <CompositionSidebar :is-collapsed="isSidebarCollapsed" />
    </div>

    <div
      v-if="!isSidebarCollapsed && isMobile"
      class="fixed inset-0 bg-black/50 z-40 lg:hidden animate-in fade-in duration-300"
      @click="toggleSidebar"
    ></div>

    <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
      <CompositionHeader
        :on-toggle-sidebar="toggleSidebar"
        header-class="bg-sidebar"
        :is-sidebar-collapsed="isSidebarCollapsed"
      />
      <main class="flex-1 overflow-y-auto p-4 md:p-6 bg-background custom-scrollbar">
        <RouterView :key="$route.fullPath"/>
      </main>
    </div>
  </div>
</template>
