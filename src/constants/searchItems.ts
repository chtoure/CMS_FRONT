import {
  LayoutDashboard,
  FolderOpen,
  Database,
  UserStar,
  Settings,
  Plus,
  Eye
} from 'lucide-vue-next'
import { type Component } from 'vue'

export interface SearchItem {
  id: string
  label: string
  description: string
  icon: Component
  category: 'Pages' | 'Actions'
  href?: string
  action?: string
}

export const searchItems: SearchItem[] = [
  {
    id: 'nav-dashboard',
    label: 'Dashboard',
    description: 'Tableau de bord principal et statistiques',
    icon: LayoutDashboard,
    category: 'Pages',
    href: 'admin.dashboard'
  },
  {
    id: 'nav-media',
    label: 'Médiathèque',
    description: 'Gérer vos images et vidéos',
    icon: FolderOpen,
    category: 'Pages',
    href: 'admin.media'
  },
  {
    id: 'nav-variable',
    label: 'Variables',
    description: 'Gérer vos variables et sources de données',
    icon: Database,
    category: 'Pages',
    href: 'admin.variable'
  },
  {
    id: 'nav-users',
    label: 'Administration',
    description: 'Gestion des utilisateurs et rôles',
    icon: UserStar,
    category: 'Pages',
    href: 'admin.users'
  },
  {
    id: 'nav-settings',
    label: 'Paramètres',
    description: 'Configuration de l\'application',
    icon: Settings,
    category: 'Pages',
    href: 'admin.parameter'
  },
  {
    id: 'action-add-media',
    label: 'Importer un média',
    description: 'Ajouter de nouveaux fichiers à la galerie',
    icon: Plus,
    category: 'Actions',
    href: 'admin.media'
  },
  {
    id: 'action-new-variable',
    label: 'Nouvelle Variable',
    description: 'Créer une nouvelle variable de données',
    icon: Plus,
    category: 'Actions',
    href: 'admin.variable'
  },
  {
    id: 'action-view-media',
    label: 'Voir la médiathèque',
    description: 'Ouvrir la galerie de médias',
    icon: Eye,
    category: 'Actions',
    href: 'admin.media'
  }
]
