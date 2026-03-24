
<script setup lang="ts">
import { computed, type Component, ref } from 'vue'
import {
  LogOut,
  LayoutDashboard,
  FolderOpen,
  Database,
  UserStar,
  ChevronDown,
  ShieldUser,
  ClipboardList,
  Trash2,
  Tags,
  PanelsTopLeft
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
import { useGetContentTypes } from '../../hook/content-type'
import { usePermission } from '../../hook/usePermission'



const route = useRoute()
const router = useRouter()
const { data: params} = useGetParameters()
const storeUser = userStore();
const { data: contentTypes} = useGetContentTypes();

const { hasPermission } = usePermission();

const resultContentTypes = computed(() => contentTypes.value?.results || [])


const {
  mutate: logout,
  isPending: isLoggingOut,
} = useLogout();

const handleLogout = () => {
  logout(void 0, {

    onSuccess() {
      storeUser.setUserInfo(null, []);
      router.push({ name: 'auth.login' });
    },
    onError(err) {
      console.error('Erreur de déconnexion :', err);
      storeUser.setUserInfo(null, []);
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
  params?: Record<string, string | number>
  badge?: string
  children?: NavItem[]
  id: string
  hasPermission?: boolean
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

const navItems = computed<NavItem[]>(() =>{

  const baseItems: NavItem[]= [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: 'admin.dashboard', hasPermission: true },
    { id: 'media', label: 'Media', icon: FolderOpen, href: 'admin.media', hasPermission: hasPermission('read_media') },
    {
      id: 'admin',
      label: 'Admin',
      icon: UserStar,
      hasPermission: hasPermission('read_user') || hasPermission('read_role'),
      children: [
        { id: 'users', label: 'Utilisateurs', icon: UserStar, href: 'admin.users.list', hasPermission: hasPermission('read_user') },
        { id: 'roles', label: 'Roles', icon: ShieldUser, href: 'admin.roles-permissions', hasPermission: hasPermission('read_role') },
      ]
    },{
      id: 'content-types',
      label: 'Content Types',
      icon: ClipboardList,
      href: 'admin.content-types',
      hasPermission: hasPermission('read_content_type')
    },{
      id: 'taxonomies',
      label: 'Catégories',
      icon: Tags,
      href: 'admin.taxonomies',
      hasPermission: hasPermission('read_taxonomy')
    },{
      id: 'corbeille',
      label: 'Corbeille',
      icon: Trash2,
      hasPermission: hasPermission('read_content_entry') || hasPermission('read_content_type') || hasPermission('read_taxonomy'),
      children: [
        {
          id: 'corbeille-contentEntry',
          label: 'Corbeille des contenus',
          icon: Trash2,
          href: 'admin.content-entry.corbeille',
          hasPermission: hasPermission('read_content_entry')
        },
        {
          id: 'corbeille-contentType',
          label: 'Corbeille types contenu',
          icon: ClipboardList,
          href: 'admin.content-types.corbeille',
          hasPermission: hasPermission('read_content_type')
        },
        {
          id: 'corbeille-taxonomy',
          label: 'Corbeille Des Catégories',
          icon: Tags,
          href: 'admin.taxonomies.corbeille',
          hasPermission: hasPermission('read_taxonomy')
        }
      ]
    },{
      id: 'pages',
      label : 'Pages',
      icon: PanelsTopLeft,
      href: 'admin.pages',
      hasPermission: hasPermission('read_page')
    }
  ];

  const dynamicItems = resultContentTypes.value ? resultContentTypes.value.map(ct => ({
    id: `content-type-${ct.id}`,
    label: ct.name,
    icon: Database,
    href: 'admin.content-entry.list',
    params: { slug: ct.slug }
  })) : [];

  return [...baseItems, ...dynamicItems];
})

navItems.value.forEach(item => {
  if (item.children && item.children.some(child => child.href === route.name)) {
    openMenus.value[item.id] = true
  }
})

const activeItem = computed(() => {
  for (const item of navItems.value) {
    // Vérification pour les items parents ou simples
    const isSameRoute = item.href === route.name
    const isSameParams = !item.params || Object.entries(item.params).every(([k, v]) => route.params[k] === String(v))

    if (isSameRoute && isSameParams) return item.id

    // Vérification pour les enfants
    if (item.children) {
      const activeChild = item.children.find(child => {
        const childSameRoute = child.href === route.name
        const childSameParams = !child.params || Object.entries(child.params).every(([k, v]) => route.params[k] === String(v))
        return childSameRoute && childSameParams
      })
      if (activeChild) return activeChild.id
    }
  }
  return ""
})

</script>

<template>

  <aside
    :class="cn(
      'bg-sidebar border-r border-sidebar-border flex flex-col h-screen ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl z-30',
      props.isCollapsed ? 'w-20' : 'w-72'
    )"
  >
    <div class="h-24 flex items-center justify-center border-b border-sidebar-border px-4 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-r from-sidebar-primary/10 via-transparent to-sidebar-primary/5 animate-pulse" />

      <div
        :class="cn(
          'flex items-center gap-3 relative z-10',
          isOpen ? 'opacity-100' : 'hidden'
        )"
      >
        <img v-if="params?.media?.type === 'image'" :src="params?.media?.file_path" alt="logo" class="w-full  object-contain">
        <video v-else-if="params?.media?.type === 'video'" autoplay loop muted :src="params?.media?.file_path" alt="logo" class="w-full  object-contain"></video>

      </div>

      <div v-if="isCollapsed" class="w-12 h-12 flex items-center justify-center relative z-10">
        <img v-if="params?.media?.type === 'image'" :src="params?.media?.file_path" alt="logo" class="object-contain">
        <video v-else-if="params?.media?.type === 'video'" autoplay loop muted :src="params?.media?.file_path" alt="logo" class="w-full  object-contain"></video>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 py-6 space-y-1 scrollbar-hide">
      <div v-for="item in navItems" :key="item.id" class="relative group">
        <RouterLink
          v-if="!item.children && item.hasPermission"
          :to="{ name: item.href, params: item.params }"
          :class="cn(
            'flex items-center gap-4 px-4 py-2 rounded-xl duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-primary',
            'relative group overflow-hidden mb-1',
            activeItem === item.id
              ? 'bg-primary text-white shadow-xl shadow-sidebar-primary/30'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary'
          )"
        >
          <div v-if="activeItem === item.id" class="absolute inset-0 bg-gradient-to-r from-sidebar-primary/40 via-sidebar-primary/20 to-transparent opacity-50 animate-shimmer" />

          <span
            :class="cn(
              'relative z-10',
              activeItem === item.id ? 'text-white' : 'text-sidebar-foreground/70 group-hover:text-sidebar-primary'
            )"
          >
            <component :is="item.icon" class="w-5 h-5" />
          </span>

          <template v-if="isOpen">
            <span :class="cn('font-semibold text-sm flex-1 relative z-10 truncate capitalize', activeItem === item.id ? 'text-white' : '')">
              {{ item.label }}
            </span>
            <span
              v-if="item.badge"
              :class="cn(
                'text-xs rounded-full px-2.5 py-1 font-bold flex items-center justify-center relative z-10',
                activeItem === item.id ? 'bg-white/25 text-white backdrop-blur-md' : 'bg-red-500 text-white'
              )"
            >
              {{ item.badge }}
            </span>
          </template>

          <div v-if="isCollapsed && activeItem !== item.id" class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sidebar-primary rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity" />
        </RouterLink>

        <div v-else-if="item.children" class="space-y-1">
          <!-- Dropdown en mode réduit -->
          <DropdownMenu v-if="isCollapsed">
            <DropdownMenuTrigger as-child>
              <button
                :class="cn(
                  'w-full flex items-center justify-center h-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-primary',
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
                  v-if="child.hasPermission"
                  :to="{ name: child.href }"
                  :class="cn(
                    'flex items-center gap-3 w-full px-2 py-1.5 text-sm font-semibold capitalize',
                    activeItem === child.id ? 'text-sidebar-primary font-bold' : 'text-sidebar-foreground '
                  )"
                >
                  <component :is="child.icon" class="w-4 h-4" />
                  <span>{{ child.label }}fff</span>
                </RouterLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <template v-else-if="item.hasPermission">
            <button
              @click="toggleMenu(item.id)"
              :class="cn(
                'w-full flex items-center gap-4 px-4 py-2 rounded-xl',
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
                <template v-for="child in item.children" :key="child.id">
                  <RouterLink
                    v-if="child.hasPermission"
                    :to="{ name: child.href }"
                    :class="cn(
                      'flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm capitalize',
                      activeItem === child.id
                        ? 'bg-primary/10 text-primary font-bold'
                        : 'text-sidebar-foreground hover:text-sidebar-primary hover:bg-sidebar-accent'
                    )"
                  >
                    <component :is="child.icon" class="w-4 h-4" />
                    <span>{{ child.label }}</span>
                  </RouterLink>
                </template>
                
              </div>
            </transition>
          </template>
        </div>
      </div>
    </nav>

    <div class="p-4 border-t border-sidebar-border space-y-3 backdrop-blur-sm">
      <div v-if="isOpen" class="px-4 py-3 rounded-xl bg-sidebar-accent/30 border border-sidebar-border backdrop-blur-md">
        <p class="text-xs font-bold text-sidebar-foreground truncate uppercase tracking-wider">{{ storeUser.userInfo?.full_name }}</p>
        <p class="text-[10px] text-accent font-medium">{{ storeUser.userInfo?.role?.name }}</p>
      </div>

      <Button
        @click="handleLogout"
        :disabled="isLoggingOut"
        variant="ghost"
        :class="cn(
          'w-full h-10 flex items-center gap-4 px-4 py-3 rounded-xl',
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
