<script setup lang="ts">
    import { 
        onMounted, 
        onUnmounted, 
        ref 
    } from 'vue'

    import {
        Maximize,
        Settings,
        PanelLeftClose,
        PanelLeftOpen
    } from 'lucide-vue-next'
    import CompositionUserDropDown from '@/components/composition/CompositionUserDropDown.vue'
    import { cn } from '@/utils/cn';
    import CompositionDarkMode from '@/components/composition/CompositionDarkMode.vue';
    import BaseSearchInput from '@/components/base/BaseSearchInput.vue';

    const props = defineProps<{
        onToggleSidebar?: () => void
        headerClass?: string,
        isSidebarCollapsed?: boolean
    }>()

    const isFullscreen = ref(false)

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            isFullscreen.value = true
        } else {
            document.exitFullscreen()
            isFullscreen.value = false
        }
    }

    const isUserDropdownOpen = ref(false)
    const containerRef = ref<HTMLElement | null>(null);

    const onClickOutside = (event: MouseEvent) => { 
        if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
            isUserDropdownOpen.value = false;
        }
    };

    const SearchIcon = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' };
    const CommandIcon = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>' };

    const searchTerm = ref('');

    onMounted(() => {
        document.addEventListener('click', onClickOutside);
    });

    onUnmounted(() => {
        document.removeEventListener('click', onClickOutside);
    });

</script>

<template>
    <header :class="cn(
        'h-16 border-b border-border flex items-center justify-between px-6 gap-4',
        headerClass 
    )" >

        <div class="flex items-center gap-4 flex-1">
            <button
                @click="props.onToggleSidebar"
                class="flex items-center justify-center p-2 rounded-md transition-colors text-primary hover:bg-accent focus:outline-none"
            >
                <PanelLeftOpen v-if="props.isSidebarCollapsed" class="w-5 h-5 text-text" /> 
                <PanelLeftClose v-else class="w-5 h-5 text-text" />
            </button>


            <BaseSearchInput v-model="searchTerm" placeholder="Rechercher..." containerClass="max-w-md">
            
                <template v-slot:iconLeft>
                    <SearchIcon class="w-4 h-4" />
                </template>
                
                <template v-slot:shortcutRight>
                    <CommandIcon class="w-3 h-3" />
                    <span>K</span>
                </template>
                
            </BaseSearchInput>

        </div>

        <div class="flex items-center gap-3">
            <button
                @click="toggleFullscreen"
                class="flex items-center justify-center p-2 rounded-md transition-colors hover:bg-accent focus:outline-none"
            >
                <Maximize class="w-4 h-4 text-text" /> 
            </button>

            <button class="flex items-center justify-center p-2 rounded-md transition-colors hover:bg-accent focus:outline-none">
                <Settings class="w-4 h-4 text-text" />
            </button>
            
            <CompositionDarkMode/>
            <div class="relative" ref="containerRef">
                <button
                    @click="isUserDropdownOpen = !isUserDropdownOpen"
                    class="relative h-10 w-10 rounded-lg p-0 flex items-center justify-center transition-colors hover:bg-accent focus:outline-none"
                >
                    <div class="h-10 w-10 rounded-full overflow-hidden">
                        <img src="/userIcon.png" alt="John Smilga" class="object-cover w-full h-full" />
                    </div>
                </button>
                <div v-if="isUserDropdownOpen" class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-background-dark ring-1 ring-black ring-opacity-5 z-10">
                    <CompositionUserDropDown />
                </div>
            </div>
        </div>
    </header>
</template> 