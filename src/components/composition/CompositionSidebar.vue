<!-- <script setup lang="ts">
import { reactive, computed, type Component } from 'vue'
import { useRoute } from 'vue-router'
import {
  LayoutDashboard,
  ChevronDown,
  ChevronRight,
  UserStar,
  FolderOpen,
  Database,
} from 'lucide-vue-next'
import DropdownMenu from '@/components/ui/dropdown-menu/DropdownMenu.vue'
import DropdownMenuTrigger from '@/components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import DropdownMenuContent from '../ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuLabel from '../ui/dropdown-menu/DropdownMenuLabel.vue'
import DropdownMenuSeparator from '../ui/dropdown-menu/DropdownMenuSeparator.vue'
import DropdownMenuItem from '../ui/dropdown-menu/DropdownMenuItem.vue'
import { useGetParameters } from '../../hook/parameter'

const route = useRoute()
const props = defineProps<{
  isCollapsed: boolean
}>()

const { data: params} = useGetParameters()


interface SubMenu {
  label: string,
  icon: Component,
  href: string
}

interface NavItems  {
  label: string,
  icon: Component,
  href?: string,
  menuKey: string,
  submenu: SubMenu[] | null
}

const openMenus = reactive<{ [key: string]: boolean }>({
  dashboard: true,
})

const toggleMenu = (menu: string) => {
  openMenus[menu] = !openMenus[menu]
}

const navItems: NavItems[] = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      menuKey: 'dashboard',
      href: 'admin.dashboard',
      submenu: null,
    },
    {
      label: 'Media',
      icon: FolderOpen,
      href: 'admin.media',
      menuKey: 'media',
      submenu: null
    },
    {
      label: 'Variable',
      icon: Database,
      href: 'admin.variable',
      menuKey: 'variable',
      submenu: null
    },
    {
      label: 'Admin',
      icon: UserStar,
      href: 'admin.users',
      menuKey: 'admhin',
      submenu: null
    }
]

const isChildActive = (submenu: SubMenu[]) => {
  return submenu?.some(sub => route.name === sub.href)
}

const sidebarClasses = computed(() => [
  'bg-sidebar border-r border-sidebar-border flex flex-col h-screen transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl z-30',
  props.isCollapsed ? 'w-20' : 'w-64'
])

const linkClasses = (isActive: boolean) => [
  'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 mb-1.5 text-[13px] group relative overflow-hidden',
  isActive
    ? 'bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 scale-[1.02]'
    : 'text-sidebar-foreground hover:bg-secondary/80 hover:text-foreground'
];
</script>

<template>
  <aside :class="sidebarClasses">
    <div class="p-6 pt-1 pb-1 flex items-center gap-3" :class="{ 'justify-center': props.isCollapsed }">
      <div v-if="props.isCollapsed" class="relative group pt-4">
        <div class="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div class="relative w-10 h-10 bg-card rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-border/50">
          <span class="text-primary font-black text-xl tracking-tighter">{{ params?.entity_name.charAt(0).toUpperCase() }}</span>
        </div>
      </div>
      <div v-else class="animate-in fade-in slide-in-from-left-4 duration-700 w-full">
        <img :src="params?.logo" alt="logo" class="w-full  object-contain">
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto p-4 pt-1 custom-scrollbar">
        <div v-for="item in navItems" :key="item.label" class="mb-1">
          <DropdownMenu v-if="item.submenu && props.isCollapsed">
            <DropdownMenuTrigger as-child>
              <button :class="linkClasses(isChildActive(item.submenu))">
                <component :is="item.icon" class="w-4 h-4" :stroke-width="3" />
                <span class="sr-only">{{ item.label }}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" class="w-52 ml-1">
              <DropdownMenuLabel class="text-xs">{{ item.label }}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem v-for="subItem in item.submenu" :key="subItem.label" as-child>
                <RouterLink :to="{ name: subItem.href }" class="cursor-pointer w-full flex text-[13px]">
                  <component :is="subItem.icon" class="w-4 h-4 mr-2" :stroke-width="3" />
                  {{ subItem.label }}
                </RouterLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <template v-if="item.submenu">
            <button
              @click="toggleMenu(item.menuKey)"
              :class="linkClasses(isChildActive(item.submenu) && !props.isCollapsed)"
            >
              <component :is="item.icon" class="w-4 h-4 flex-shrink-0" :stroke-width="3" />
              <span v-if="!props.isCollapsed" class="font-medium flex-1 text-left">
                {{ item.label }}
              </span>
              <div v-if="!props.isCollapsed">
                <ChevronDown v-if="openMenus[item.menuKey]" class="w-3.5 h-3.5" />
                <ChevronRight v-else class="w-3.5 h-3.5" />
              </div>
            </button>

            <div v-if="openMenus[item.menuKey] && !props.isCollapsed" class="ml-7 mt-0.5 space-y-0.5">
              <RouterLink
                v-for="subItem in item.submenu"
                :key="subItem.label"
                :to="{ name: subItem.href }"
                v-slot="{ isActive }"
              >
                <div :class="[
                  'flex items-center gap-2 px-2.5 py-1.5 text-[13px] rounded-md transition-all duration-150 cursor-pointer',
                  isActive ? 'text-primary font-medium bg-primary/10' : 'text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent'
                ]">
                  <component :is="subItem.icon" class="w-3.5 h-3.5" :stroke-width="3"/>
                  {{ subItem.label }}
                </div>
              </RouterLink>
            </div>
          </template>

          <template v-else>
            <RouterLink
              :to="{ name: item.href }"
              custom
              v-slot="{ navigate }"
            >
              <button
                @click="navigate"
                :class="linkClasses(route.name === item.href)"
              >
                <component :is="item.icon" class="w-4 h-4 flex-shrink-0" :stroke-width="3"/>
                <span v-if="!props.isCollapsed" class="font-medium flex-1 text-left">
                  {{ item.label }}
                </span>
                <span v-if="props.isCollapsed" class="sr-only">{{ item.label }}</span>

                <div v-if="route.name === item.href && !props.isCollapsed"
                    class="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-l-full">
                </div>
              </button>
            </RouterLink>
          </template>
        </div>
    </nav>
  </aside>
</template> -->



<script setup lang="ts">
import { computed, type Component } from 'vue'
import {
  LogOut,
  LayoutDashboard,
  FolderOpen,
  Database,
  UserStar
} from 'lucide-vue-next'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import { cn } from '../../lib/utils'
import { useGetParameters } from '../../hook/parameter'
import { userStore } from '../../stores/user'
import { useLogout } from '../../hook/user'
import Button from '../ui/button/Button.vue'


const route = useRoute()
const router = useRouter()
const { data: params} = useGetParameters()
const storeUser = userStore();

const {
  mutate: logout,
  isPending: isLoggingOut,
} = useLogout();

const handleLogout = () => {
  logout(void 0, {

    onSuccess() {
      storeUser.setUserInfo(null);
      router.push({ name: 'auth.login' });
    },
    onError(err) {
      console.error('Erreur de déconnexion :', err);
      storeUser.setUserInfo(null);
      router.push({ name: 'auth.login' });
    }
  });


};

const props = defineProps<{
  isCollapsed: boolean
}>()

const isOpen = computed(() => !props.isCollapsed)

interface NavItem {
  label: string
  href: string
  icon: Component
  badge?: string
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: 'admin.dashboard' },
  { label: 'Media', icon: FolderOpen, href: 'admin.media'},
  { label: 'Variable', icon: Database, href: 'admin.variable' },
  { label: 'Admin', icon: UserStar, href: 'admin.users' }
]

const activeItem = computed(() => {
  const currentItem = navItems.find(item => item.href === route.name)
  return currentItem ? currentItem.label : ""
})

</script>

<template>

  <aside
    :class="cn(
      'bg-sidebar border-r border-sidebar-border flex flex-col h-screen transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl z-30',
      props.isCollapsed ? 'w-20' : 'w-72'
    )"
  >
    <div class="h-24 flex items-center justify-center border-b border-sidebar-border px-4 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-sidebar-primary/10 via-transparent to-sidebar-primary/5 animate-pulse" />

      <div
        :class="cn(
          'flex items-center gap-3 transition-all duration-300 relative z-10',
          isOpen ? 'opacity-100' : 'hidden'
        )"
      >
        <img :src="params?.logo" alt="logo" class="w-full  object-contain">

      </div>

      <div v-if="isCollapsed" class="w-12 h-12 flex items-center justify-center relative z-10 transition-all">
        <img :src="params?.logo" alt="logo" class="object-contain">
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 py-6 space-y-1 scrollbar-hide">
      <div v-for="item in navItems" :key="item.label" class="relative group">
        <RouterLink
          :to="{ name: item.href }"
          :class="cn(
            'flex items-center gap-4 px-4 py-2 rounded-xl transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-primary',
            'relative group overflow-hidden',
            activeItem === item.label
              ? 'bg-primary text-white shadow-xl shadow-sidebar-primary/30'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary'
          )"
        >
          <div v-if="activeItem === item.label" class="absolute inset-0 bg-gradient-to-r from-sidebar-primary/40 via-sidebar-primary/20 to-transparent opacity-50 animate-shimmer" />

          <span
            :class="cn(
              'transition-colors duration-200 relative z-10',
              activeItem === item.label ? 'text-white' : 'text-sidebar-foreground/70 group-hover:text-sidebar-primary'
            )"
          >
            <component :is="item.icon" class="w-5 h-5" />
          </span>

          <template v-if="isOpen">
            <span :class="cn('font-semibold text-sm flex-1 relative z-10 truncate', activeItem === item.label ? 'text-white' : '')">
              {{ item.label }}
            </span>
            <span
              v-if="item.badge"
              :class="cn(
                'text-xs rounded-full px-2.5 py-1 font-bold flex items-center justify-center relative z-10',
                activeItem === item.label ? 'bg-white/25 text-white backdrop-blur-md' : 'bg-red-500 text-white'
              )"
            >
              {{ item.badge }}
            </span>
          </template>

          <div v-if="isCollapsed && activeItem !== item.label" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </RouterLink>
      </div>
    </nav>

    <div class="p-4 border-t border-sidebar-border space-y-3 backdrop-blur-sm">
      <div v-if="isOpen" class="px-4 py-3 rounded-xl bg-sidebar-accent/30 border border-sidebar-border backdrop-blur-md">
        <p class="text-xs font-bold text-sidebar-foreground truncate uppercase tracking-wider">{{ storeUser.userInfo?.full_name }}</p>
        <p class="text-[10px] text-accent font-medium">{{ storeUser.userInfo?.role }}</p>
      </div>

      <Button
        @click="handleLogout"
        :disabled="isLoggingOut"
        variant="ghost"
        :class="cn(
          'w-full h-10 flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200',
          'text-destructive hover:bg-destructive hover:opacity-50 hover:text-white',
          'font-semibold text-sm'
        )"
      >
        <LogOut class="w-5 h-5" />
        <span v-if="isOpen" class="truncate">Déconnexion</span>
      </Button>
    </div>
  </aside>
</template>

<style scoped>
.animate-shimmer {
  animation: shimmer 2s infinite linear;
}

@keyframes shimmer {
  from { transform: translateX(-100%); }
  to { transform: translateX(100%); }
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
