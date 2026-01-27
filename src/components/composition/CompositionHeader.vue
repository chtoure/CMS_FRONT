<script setup lang="ts">
    import { computed, ref, onMounted, onUnmounted } from 'vue'
    import {
        Maximize,
        Settings,
        Search,
        X,
        Menu,
        Plus,
        Minimize,
        Loader
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
    import HoverCard from '../ui/hover-card/HoverCard.vue';
    import HoverCardTrigger from '../ui/hover-card/HoverCardTrigger.vue';
    import HoverCardContent from '../ui/hover-card/HoverCardContent.vue';
    import { useGetContentTypes } from '../../hook/content-type.ts';

    const props = defineProps<{
        onToggleSidebar?: () => void
        headerClass?: string,
        isSidebarCollapsed?: boolean
    }>()

    const { data: contentTypes, error: contentTypeError, isLoading: contentTypeLoading } = useGetContentTypes();

    const resultContentTypes = computed(() => contentTypes.value?.results || [])

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
            <HoverCard :open-delay="100" :close-delay="200">
              <HoverCardTrigger as-child>
                <Button
                  variant="ghost"
                  class="text-muted-foreground hover:text-foreground p-1.5 h-8 w-8"
                >
                  <Plus class="w-4 h-4" />
                </Button>
              </HoverCardTrigger>

              <HoverCardContent
                align="end"
                side="bottom"
                :side-offset="8"
                class="w-auto min-w-max p-2 bg-background border-border shadow-md"
              >
                <div v-if="contentTypeLoading" class="flex items-center justify-center p-4">
                  <Loader class="w-4 h-4 animate-spin" />
                </div>

                <div v-else-if="contentTypeError" class="p-2 text-xs text-destructive">
                  <p>Erreur survenue</p>
                </div>

                <div v-else>
                  <div v-if="resultContentTypes?.length === 0" class="p-2 text-xs text-muted-foreground">
                    <p>Aucun type</p>
                  </div>

                  <div v-else class="flex flex-col gap-1">
                    <div v-for="contentType in resultContentTypes" :key="contentType.id">
                      <Button
                        @click="router.push({ name: 'admin.content-entry.create', params: { id: contentType.id } })"
                        variant="outline"
                        class="h-8 w-full justify-start px-2 py-1.5 text-xs font-normal border-none hover:bg-background"
                      >
                        {{ contentType.name }}
                      </Button>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>

            <Button
                variant="ghost"
                @click="toggleFullscreen"
                class="text-muted-foreground hover:text-foreground p-1.5 h-8 w-8"
            >
                <Minimize v-if="isFullscreen" class="w-4 h-4" stroke-width="2" />
                <Maximize v-else class="w-4 h-4" stroke-width="2" />
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











