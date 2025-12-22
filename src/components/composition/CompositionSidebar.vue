<script setup lang="ts">
// All imports
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

// Interfaces first
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

// All hooks at top level
const route = useRoute()
const props = defineProps<{
  isCollapsed: boolean
}>()

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
    }
]

const isChildActive = (submenu: SubMenu[]) => {
  return submenu?.some(sub => route.name === sub.href)
}

const sidebarClasses = computed(() => [
  'bg-background border-r border-sidebar-border flex flex-col h-screen transition-all duration-300',
  props.isCollapsed ? 'w-16' : 'w-60'
])

const linkClasses = (isActive: boolean) => [
  'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all duration-150 mb-0.5 text-[13px]',
  isActive
    ? 'bg-active text-sidebar-foreground font-medium'
    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
];
</script>

<template>
  <aside :class="sidebarClasses">
    <div class="p-4 border-b border-sidebar-border flex items-center gap-2.5 text-sidebar-foreground" :class="{ 'justify-center': props.isCollapsed }">
      <div class="w-8 h-8 bg-primary rounded-md flex items-center justify-center flex-shrink-0">
        <span class="text-primary-foreground font-bold text-lg">E</span>
      </div>
      <div v-if="!props.isCollapsed">
        <h1 class="font-semibold text-base text-foreground leading-none">Enerlog</h1>
        <span class="text-[11px] text-primary font-font tracking-tight">POS</span>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto p-3 custom-scrollbar">
        <div v-for="item in navItems" :key="item.label" class="mb-1">

          <DropdownMenu v-if="item.submenu && props.isCollapsed">
            <DropdownMenuTrigger as-child>
              <button :class="linkClasses(isChildActive(item.submenu))">
                <component :is="item.icon" class="w-4 h-4" />
                <span class="sr-only">{{ item.label }}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" class="w-52 ml-1">
              <DropdownMenuLabel class="text-xs">{{ item.label }}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem v-for="subItem in item.submenu" :key="subItem.label" as-child>
                <RouterLink :to="{ name: subItem.href }" class="cursor-pointer w-full flex text-[13px]">
                  <component :is="subItem.icon" class="w-4 h-4 mr-2" />
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
              <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
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
                  <component :is="subItem.icon" class="w-3.5 h-3.5" />
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
                <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
                <span v-if="!props.isCollapsed" class="font-medium flex-1 text-left">
                  {{ item.label }}
                </span>
                <span v-if="props.isCollapsed" class="sr-only">{{ item.label }}</span>
              </button>
            </RouterLink>
          </template>

        </div>
    </nav>
  </aside>
</template>
