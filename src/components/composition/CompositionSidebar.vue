<script setup lang="ts">
import { reactive, computed, type Component } from 'vue'
import {
  LayoutDashboard,
  Package,
  ChevronDown,
  ChevronRight,
} from 'lucide-vue-next'
import DropdownMenu from '@/components/ui/dropdown-menu/DropdownMenu.vue';
import DropdownMenuTrigger from '@/components/ui/dropdown-menu/DropdownMenuTrigger.vue';
import { useRoute } from 'vue-router';
import DropdownMenuContent from '../ui/dropdown-menu/DropdownMenuContent.vue';
import DropdownMenuLabel from '../ui/dropdown-menu/DropdownMenuLabel.vue';
import DropdownMenuSeparator from '../ui/dropdown-menu/DropdownMenuSeparator.vue';
import DropdownMenuItem from '../ui/dropdown-menu/DropdownMenuItem.vue';


interface SidebarProps {
  isCollapsed: boolean
}
const props = defineProps<SidebarProps>()

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

const route = useRoute();

const toggleMenu = (menu: string) => {
  openMenus[menu] = !openMenus[menu]
}

const navItems: NavItems[] = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      menuKey: 'dashboard',
      href: 'admin.dashboard',
      submenu: [
        {
          label: 'Admin Dashboard',
          icon: LayoutDashboard,
          href: 'admin.dashboard'
        }
      ],
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
  'bg-background border-r border-border flex flex-col h-screen transition-all duration-300',
  props.isCollapsed ? 'w-20' : 'w-64'
])

const linkClasses = (isActive: boolean) => [
  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1',
  isActive
    ? 'bg-accent text-accent-foreground font-semibold'
    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
];
</script>

<template>
  <aside :class="sidebarClasses">
    <div class="p-6 border-b border-border flex items-center gap-2" :class="{ 'justify-center': props.isCollapsed }">
      <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
        <span class="text-white font-bold text-xl">E</span>
      </div>
      <div v-if="!props.isCollapsed">
        <h1 class="font-bold text-xl text-foreground">Enerlog</h1>
        <span class="text-xs text-primary font-medium">POS</span>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div v-for="item in navItems" :key="item.label">

          <DropdownMenu v-if="item.submenu && isCollapsed">
            <DropdownMenuTrigger as-child>
              <button :class="linkClasses(isChildActive(item.submenu))">
                <component :is="item.icon" class="w-4 h-4" />
                <span class="sr-only">{{ item.label }}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" class="w-56 ml-2">
              <DropdownMenuLabel>{{ item.label }}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem v-for="subItem in item.submenu" :key="subItem.label" as-child>
                <RouterLink :to="{ name: subItem.href }" class="cursor-pointer w-full flex">
                  <component :is="subItem.icon" class="w-4 h-4 mr-2" />
                </RouterLink>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <template v-if="item.submenu">
            <button
              @click="toggleMenu(item.menuKey)"
              :class="linkClasses(openMenus[item.menuKey] && !props.isCollapsed ? true : false)"
            >
              <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
              <span v-if="!props.isCollapsed" class="text-sm font-medium flex-1 text-left">
                {{ item.label }}
              </span>
              <div v-if="!props.isCollapsed">
                <ChevronDown v-if="openMenus[item.menuKey]" class="w-4 h-4" />
                <ChevronRight v-else class="w-4 h-4" />
              </div>
            </button>

            <div v-if="openMenus[item.menuKey] && !props.isCollapsed" class="ml-9 mt-1 space-y-1">
              <RouterLink
                v-for="subItem in item.submenu"
                :key="subItem.label"
                :to="{ name: subItem.href }"
                v-slot="{ isActive }"
              >
                <div :class="[
                  'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer',
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
                ]">
                  <component :is="subItem.icon" class="w-4 h-4 mr-2" />
                  {{ subItem.label }} </div>
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
                <span v-if="!props.isCollapsed" class="text-sm font-medium flex-1 text-left">
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
