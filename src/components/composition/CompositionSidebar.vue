<script setup lang="ts">
import { reactive, computed, type Component } from 'vue'
import { useRoute } from 'vue-router'
import {
  LayoutDashboard,
  Package,
  ChevronDown,
  ChevronRight,
} from 'lucide-vue-next'
import DropdownMenu from '@/components/ui/dropdown-menu/DropdownMenu.vue'
import DropdownMenuTrigger from '@/components/ui/dropdown-menu/DropdownMenuTrigger.vue'
import DropdownMenuContent from '../ui/dropdown-menu/DropdownMenuContent.vue'
import DropdownMenuLabel from '../ui/dropdown-menu/DropdownMenuLabel.vue'
import DropdownMenuSeparator from '../ui/dropdown-menu/DropdownMenuSeparator.vue'
import DropdownMenuItem from '../ui/dropdown-menu/DropdownMenuItem.vue'

const route = useRoute()
const props = defineProps<{
  isCollapsed: boolean
}>()

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
      icon: Package,
      href: 'admin.media',
      menuKey: 'media',
      submenu: null
    },
    {
      label: 'Variable',
      icon: Package,
      href: 'admin.variable',
      menuKey: 'variable',
      submenu: null
    }
]

const isChildActive = (submenu: SubMenu[]) => {
  return submenu?.some(sub => route.name === sub.href)
}

const sidebarClasses = computed(() => [
  'bg-sidebar border-r border-sidebar-border/40 flex flex-col h-screen transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-2xl z-30',
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
    <!-- Section Logo avec animation Eldorado -->
    <div class="p-6 mb-4 flex items-center gap-3" :class="{ 'justify-center': props.isCollapsed }">
      <div class="relative group">
        <div class="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div class="relative w-10 h-10 bg-card rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm border border-border/50">
          <span class="text-primary font-black text-xl tracking-tighter">E</span>
        </div>
      </div>
      <div v-if="!props.isCollapsed" class="animate-in fade-in slide-in-from-left-4 duration-700">
        <h1 class="font-black text-xl text-foreground tracking-tighter leading-none">Enerlog</h1>
        <div class="flex items-center gap-1.5 mt-0.5">
          <span class="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
          <span class="text-[9px] text-muted-foreground font-bold tracking-[0.3em] uppercase">Connecté</span>
        </div>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto p-4 custom-scrollbar">
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
              :class="linkClasses(!!openMenus[item.menuKey] && !props.isCollapsed)"
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
              v-slot="{ isActive }"
            >
              <button :class="linkClasses(isActive)">
                <component :is="item.icon" class="w-4 h-4 flex-shrink-0" :stroke-width="3"/>
                <span v-if="!props.isCollapsed" class="font-medium flex-1 text-left">
                  {{ item.label }}
                </span>
                <span v-if="props.isCollapsed" class="sr-only">{{ item.label }}</span>
                <div v-if="isActive && !props.isCollapsed" class="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-l-full"></div>
              </button>
            </RouterLink>
          </template>
        </div>
    </nav>
  </aside>
</template>
