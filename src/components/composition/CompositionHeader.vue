<script setup lang="ts">
    import {
        ref
    } from 'vue'

    import {
        Maximize,
        Settings,
        PanelLeftClose,
        PanelLeftOpen
    } from 'lucide-vue-next'
    import CompositionUserDropDown from '@/components/composition/CompositionUserDropDown.vue'
    import CompositionDarkMode from '@/components/composition/CompositionDarkMode.vue';
    import BaseSearchInput from '@/components/base/BaseSearchInput.vue';
    import { cn } from '../../lib/utils.ts';
    import  DropdownMenu  from '@/components/ui/dropdown-menu/DropdownMenu.vue';
    import DropdownMenuTrigger  from '@/components/ui/dropdown-menu/DropdownMenuTrigger.vue';
    import  Button  from '@/components/ui/button/Button.vue';
    import Avatar from '@/components/ui/avatar/Avatar.vue';
    import AvatarImage from '@/components/ui/avatar/AvatarImage.vue';
    import AvatarFallback from '@/components/ui/avatar/AvatarFallback.vue';
    import DropdownMenuContent  from '@/components/ui/dropdown-menu/DropdownMenuContent.vue';


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

    const SearchIcon = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' };
    const CommandIcon = { template: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>' };

    const searchTerm = ref('');


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
            <Button
                variant="ghost"
                @click="toggleFullscreen"
                :class="cn('text-text hover:text-primary p-2')"
            >
                <Maximize class="w-4 h-4 " />
            </Button>

            <Button
              variant="ghost"
              :class="cn('hover:text-primary p-2')">
                <Settings class="w-4 h-4 text-text" />
            </Button>

            <CompositionDarkMode/>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button class="relative h-10 w-10 rounded-full overflow-hidden hover:opacity-80 transition">
                  <Avatar>
                    <AvatarImage src="userIcon.png"/>
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="mt-2">
                <CompositionUserDropDown />
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </header>
</template>
