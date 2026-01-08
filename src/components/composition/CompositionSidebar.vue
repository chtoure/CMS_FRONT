
<script setup lang="ts">
import { computed, type Component, ref } from 'vue'
import {
  LogOut,
  LayoutDashboard,
  FolderOpen,
  Database,
  UserStar,
  ChevronDown,
  ShieldUser
} from 'lucide-vue-next'
import { useRoute, RouterLink, useRouter } from 'vue-router'
import { cn } from '../../lib/utils'
import { useGetParameters } from '../../hook/parameter'
import { userStore } from '../../stores/user'
import { useLogout } from '../../hook/user'
import Button from '../ui/button/Button.vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '../ui/dropdown-menu'


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
  href?: string
  icon: Component
  badge?: string
  children?: NavItem[]
  id: string
}

const openMenus = ref<Record<string, boolean>>({})

const toggleMenu = (id: string) => {
  openMenus.value[id] = !openMenus.value[id]
}

const isParentActive = (item: NavItem) => {
  if (item.href === route.name) return true
  if (item.children) {
    return item.children.some(child => child.href === route.name)
  }
  return false
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: 'admin.dashboard' },
  { id: 'media', label: 'Media', icon: FolderOpen, href: 'admin.media'},
  { id: 'variable', label: 'Variable', icon: Database, href: 'admin.variable' },
  {
    id: 'admin',
    label: 'Admin',
    icon: UserStar,
    children: [
      { id: 'users', label: 'Utilisateurs', icon: UserStar, href: 'admin.users' },
      { id: 'roles', label: 'Roles', icon: ShieldUser, href: 'admin.roles-permissions' },
    ]
  }
]

navItems.forEach(item => {
  if (item.children && item.children.some(child => child.href === route.name)) {
    openMenus.value[item.id] = true
  }
})

const activeItem = computed(() => {
  // Check children first
  for (const item of navItems) {
    if (item.href === route.name) return item.label
    if (item.children) {
      const activeChild = item.children.find(child => child.href === route.name)
      if (activeChild) return activeChild.label
    }
  }
  return ""
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
      <div v-for="item in navItems" :key="item.id" class="relative group">
        <RouterLink
          v-if="!item.children"
          :to="{ name: item.href }"
          :class="cn(
            'flex items-center gap-4 px-4 py-2 rounded-xl transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-primary',
            'relative group overflow-hidden mb-1',
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

        <div v-else class="space-y-1">
          <!-- Dropdown en mode réduit -->
          <DropdownMenu v-if="isCollapsed">
            <DropdownMenuTrigger as-child>
              <button
                :class="cn(
                  'w-full flex items-center justify-center h-10 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-primary',
                  isParentActive(item)
                    ? 'bg-primary text-white shadow-lg shadow-sidebar-primary/30'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary'
                )"
              >
                <component :is="item.icon" class="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" :side-offset="10" class="w-48 bg-sidebar border-sidebar-border shadow-2xl">
              <DropdownMenuLabel class="text-xs font-bold text-sidebar-foreground/50 px-2 pb-1">{{ item.label }}</DropdownMenuLabel>
              <DropdownMenuSeparator class="bg-sidebar-border" />
              <DropdownMenuItem
                v-for="child in item.children"
                :key="child.id"
                as-child
                class="hover:bg-sidebar-accent focus:bg-sidebar-accent rounded-lg hover:!text-primary"
              >
                <RouterLink
                  :to="{ name: child.href }"
                  :class="cn(
                    'flex items-center gap-3 w-full px-2 py-1.5 text-sm transition-colors font-semibold ',
                    activeItem === child.label ? 'text-sidebar-primary font-bold' : 'text-sidebar-foreground '
                  )"
                >
                  <component :is="child.icon" class="w-4 h-4" />
                  <span>{{ child.label }}</span>
                </RouterLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <template v-else>
            <button
              @click="toggleMenu(item.id)"
              :class="cn(
                'w-full flex items-center gap-4 px-4 py-2 rounded-xl transition-all duration-200',
                'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary',
                isParentActive(item) && !openMenus[item.id] ? 'bg-sidebar-accent/50' : ''
              )"
            >
              <span class="text-sidebar-foreground/70 group-hover:text-sidebar-primary">
                <component :is="item.icon" class="w-5 h-5" />
              </span>

              <template v-if="isOpen">
                <span class="font-semibold text-sm flex-1 text-left truncate">
                  {{ item.label }}
                </span>
                <ChevronDown
                  :class="cn(
                    'w-4 h-4 transition-transform duration-200',
                    openMenus[item.id] ? 'rotate-0' : '-rotate-90'
                  )"
                />
              </template>
            </button>

            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform scale-95 opacity-0 -translate-y-2"
              enter-to-class="transform scale-100 opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="transform scale-100 opacity-100 translate-y-0"
              leave-to-class="transform scale-95 opacity-0 -translate-y-2"
            >
              <div v-if="openMenus[item.id] && isOpen" class="ml-9 space-y-1 border-l border-sidebar-border pl-2">
                <RouterLink
                  v-for="child in item.children"
                  :key="child.id"
                  :to="{ name: child.href }"
                  :class="cn(
                    'flex items-center gap-3 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm',
                    activeItem === child.label
                      ? 'bg-primary/10 text-primary font-bold'
                      : 'text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent'
                  )"
                >
                  <component :is="child.icon" class="w-4 h-4" />
                  <span>{{ child.label }}</span>
                </RouterLink>
              </div>
            </transition>
          </template>
        </div>
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
