<script setup lang="ts">
    import { computed, ref, onMounted, onUnmounted } from 'vue'
    import {
        Maximize,
        Settings,
        Search,
        X,
        Menu
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
    import { userStore } from '../../stores/user';
    import { useRouter } from 'vue-router';
    import { searchItems, type SearchItem } from '../../constants/searchItems';


    const props = defineProps<{
        onToggleSidebar?: () => void
        headerClass?: string,
        isSidebarCollapsed?: boolean
    }>()

    const router = useRouter();

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

    const searchTerm = ref('');
    const storeUser = userStore();

    const filteredResults = computed(() => {
        if (!searchTerm.value) return [];
        const term = searchTerm.value.toLowerCase();
        return searchItems.filter(item =>
            item.label.toLowerCase().includes(term) ||
            item.description.toLowerCase().includes(term) ||
            item.category.toLowerCase().includes(term)
        ).slice(0, 8);
    });

    const handleSearchSelect = (item: SearchItem) => {
        searchTerm.value = '';
        if (item.href) {
            router.push({ name: item.href });
        }
    };

    const handleShortcut = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            const input = document.getElementById('global-search-input');
            input?.focus();
        }
    };

    onMounted(() => {
        window.addEventListener('keydown', handleShortcut);
    });

    onUnmounted(() => {
        window.removeEventListener('keydown', handleShortcut);
    });


</script>

<template>
    <header :class="cn(
        'h-16 sticky top-0 z-40 border-b border-border bg-background backdrop-blur-xl flex items-center justify-between px-6 gap-4', // Effet de verre (glassmorphism) et hauteur augmentée
        headerClass
    )" >

        <div class="flex items-center gap-4 flex-1">
            <button
                @click="props.onToggleSidebar"
                class="flex items-center justify-center p-2 rounded-xl transition-all duration-200 text-muted-foreground hover:bg-secondary hover:text-foreground hover:scale-110 active:scale-95"
            >
                <Menu v-if="props.isSidebarCollapsed" class="w-5 h-5" />
                <X v-else class="w-5 h-5" />
            </button>

            <BaseSearchInput
                id="global-search-input"
                v-model="searchTerm"
                :results="filteredResults"
                @select="handleSearchSelect"
                placeholder="Rechercher une fonctionnalité (Cmd + K)..."
                containerClass="max-w-md hidden md:flex"
            >
                <template v-slot:iconLeft>
                    <Search class="w-4 h-4" />
                </template>
                <template v-slot:shortcutRight>
                    <span class="text-[10px] font-black opacity-50">⌘ K</span>
                </template>
            </BaseSearchInput>
        </div>

        <div class="flex items-center gap-2">
            <Button
                variant="ghost"
                @click="toggleFullscreen"
                :class="cn('text-muted-foreground hover:text-foreground p-1.5 h-8 w-8')"
            >
                <Maximize class="w-4 h-4" />
            </Button>

            <Button
              @click="router.push({ name: 'admin.parameter' })"
              variant="ghost"
              :class="cn('text-muted-foreground hover:text-foreground p-1.5 h-8 w-8')">
                <Settings class="w-4 h-4" />
            </Button>

            <CompositionDarkMode/>

            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button class="relative h-8 w-8 rounded-full overflow-hidden hover:opacity-80 transition-all duration-150 hover:ring-2 hover:ring-primary/30">
                  <Avatar>
                    <AvatarImage src="userIcon.png"/>
                    <AvatarFallback>{{ storeUser.userInfo?.initials }}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="mt-2 bg-transparent border-none shadow-none">
                <CompositionUserDropDown />
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
    </header>
</template>











