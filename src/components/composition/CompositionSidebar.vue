<script setup lang="ts">
import { reactive, computed } from 'vue'
import {
  LayoutDashboard,
  UserCog,
  Layers3,
  LayoutGrid,
  Package,
  PlusCircle,
  AlertCircle,
  TrendingDown,
  FolderTree,
  Folder,
  Tag,
  ChevronDown,
  ChevronRight,
} from 'lucide-vue-next'

interface SidebarProps {
  isCollapsed: boolean
}
const props = defineProps<SidebarProps>()

const openMenus = reactive<{ [key: string]: boolean }>({
  dashboard: true,
})

const toggleMenu = (menu: string) => {
  openMenus[menu] = !openMenus[menu]
}


const navItems = [
  { 
    title: 'Main', 
    type: 'section', 
    items: [
      { 
        label: 'Dashboard', 
        icon: LayoutDashboard, 
        menuKey: 'dashboard', 
        href: '#', 
        submenu: [
          { label: 'Admin Dashboard', href: '#', active: true },
          { label: 'Admin Dashboard 2', href: '#', active: false },
          { label: 'Sales Dashboard', href: '#', active: false },
        ] 
      },
      { label: 'Super Admin', icon: UserCog, menuKey: 'superAdmin', href: '#', submenu: null },
      { label: 'Application', icon: Layers3, menuKey: 'application', href: '#', submenu: null },
      { label: 'Layouts', icon: LayoutGrid, menuKey: 'layouts', href: '#', submenu: null },
    ]
  },
  { 
    title: 'Inventory', 
    type: 'section', 
    items: [
      { label: 'Products', icon: Package, href: '#', submenu: null },
      { label: 'Create Product', icon: PlusCircle, href: '#', submenu: null },
      { label: 'Expired Products', icon: AlertCircle, href: '#', submenu: null },
      { label: 'Low Stocks', icon: TrendingDown, href: '#', submenu: null },
      { label: 'Category', icon: FolderTree, href: '#', submenu: null },
      { label: 'Sub Category', icon: Folder, href: '#', submenu: null },
      { label: 'Brands', icon: Tag, href: '#', submenu: null },
    ]
  },
]


const sidebarClasses = computed(() => {
  return [
    'bg-background border-r border-border flex flex-col h-screen transition-all duration-300',
    props.isCollapsed ? 'w-20' : 'w-64'
  ]
})

const linkClasses = (isActive: boolean) => [
  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1',
  isActive 
    ? 'bg-accent text-accent-foreground hover:bg-accent/80' 
    : 'text-text hover:bg-accent hover:text-accent-foreground'
];
</script>

<template>
  <aside :class="sidebarClasses">
    <div v-if="!props.isCollapsed" class="p-6 border-b border-border">
      <div class="flex items-center gap-2">
        <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
          <span class="text-text font-bold text-xl">E</span>
        </div>
        <div>
          <h1 class="font-bold text-xl text-foreground">Enerlog</h1>
          <span class="text-xs text-primary font-medium">POS</span>
        </div>
      </div>
    </div>
    
    <div v-else class="p-4 border-b border-border flex justify-center">
      <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
        <span class="text-primary-foreground font-bold text-xl">D</span>
      </div>
    </div>

    <nav class="flex-1 overflow-y-auto p-4 custom-scrollbar">
      
      <div v-for="section in navItems" :key="section.title" class="mb-6">
        
        <p v-if="!props.isCollapsed" class="text-xs font-semibold text-muted-foreground mb-3 px-3">
          {{ section.title }}
        </p>

        <div v-for="item in section.items" :key="item.label">
          
          <template v-if="item.submenu">
            <button
              @click="toggleMenu(item.menuKey)"
              :class="linkClasses((openMenus[item.menuKey] ?? false) && !props.isCollapsed)"
            >
              <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
              
              <span v-if="!props.isCollapsed" class="text-sm font-medium flex-1 text-left">
                {{ item.label }}
              </span>
              <div v-if="!props.isCollapsed">
                <ChevronDown v-if="openMenus[item.menuKey]" class="w-4 h-4" />
                <ChevronRight v-else class="w-4 h-4" />
              </div>

              <span v-if="props.isCollapsed" class="sr-only">{{ item.label }}</span>
            </button>

            <div 
              v-if="openMenus[item.menuKey] && !props.isCollapsed" 
              class="ml-10 mt-1 space-y-1"
            >
              <RouterLink
                v-for="subItem in item.submenu"
                :key="subItem.label"
                :to="subItem.href"
                :class="[
                  'flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors',
                  subItem.active ? 'text-primary font-medium hover:bg-accent' : 'text-text hover:bg-accent'
                ]"
              >
                <span :class="['w-1.5 h-1.5 rounded-full', subItem.active ? 'bg-primary' : 'bg-muted-foreground']"></span>
                {{ subItem.label }}
              </RouterLink>
            </div>
            
            </template>

          <template v-else>
            <RouterLink 
              :to="item.href"
              :class="linkClasses(false)"
            >
              <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
              
              <span v-if="!props.isCollapsed" class="text-sm font-medium flex-1">
                {{ item.label }}
              </span>
              
              <span v-if="props.isCollapsed" class="sr-only">{{ item.label }}</span>
            </RouterLink>
          </template>

        </div>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px; 
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background-color: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgb(145, 145, 145); 
    border-radius: 9999px;
    border: 2px solid transparent; 
    background-clip: padding-box; 
  }
  .custom-scrollbar:hover::-webkit-scrollbar-thumb {
    background-color: rgb(156 163 175);
  }
</style>