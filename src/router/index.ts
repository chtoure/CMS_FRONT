import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layout/DefaultLayout.vue'
import NotFoundPage from '@/views/error/NotFoundPage.vue'
import LoginView from '@/views/auth/LoginView.vue'
import MainLayout from '@/layout/MainLayout.vue'
import DashboardView from '@/views/DashboardView.vue'
import MediaListView from '@/views/media/MediaListView.vue'
import MediaUpdateView from '@/views/media/MediaUpdateView.vue'
// import VariableListView from '../views/variable/VariableListView.vue'
import TestView from '../views/variable/TestView.vue'
import { setupAuthGuard } from './authGuard'
import SettingsView from '@/views/user/SettingsView.vue'
import ChangePasswordView from '../views/auth/ChangePasswordView.vue'
import AdminVue from '../views/user/AdminVue.vue'
import ForgetPasswordView from '../views/auth/ForgetPasswordView.vue'
import RolesPermissionsView from '../views/user/Roles&PermissionsView.vue'
import ParameterView from '../views/parameter/ParameterView.vue'
import ContentTypeListView from '@/views/contentType/ContentTypeListView.vue'
import ContentEntryFormView from '../views/contentEntry/ContentEntryFormView.vue'
import ContentEntryListView from '../views/contentEntry/ContentEntryListView.vue'
import ContentTypeFormView from '../views/contentType/ContentTypeFormView.vue'
import TaxonomyListView from '../views/Taxonomy/TaxonomyListView.vue'
import TaxonomyFormView from '../views/Taxonomy/TaxonomyFormView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
        path: '/site/admin',
        children:[
            {
                path: 'auth',
                component: DefaultLayout,
                // Empeche l'accès à la page de login si l'utilisateur est déjà authentifié


                children: [
                    {
                        path: 'login',
                        name: 'auth.login',
                        component: LoginView,
                        meta: { requiresGuest: true },
                    },
                    {
                      path: 'change-password',
                      name: 'auth.change-password',
                      component: ChangePasswordView,
                      meta: { requiresAuth: true },
                    },
                    {
                        path: 'forgot-password',
                        name: 'auth.forgot-password',
                        component: ForgetPasswordView,
                        meta: { requiresGuest: true },
                    },
                ]
            },
            {
                path: '',
                component: MainLayout,
                // Permet de proteger les urls (Ici toutes les routes enfants)
                meta: { requiresAuth: true },
                children: [
                    {
                      path: 'dashboard',
                      name: 'admin.dashboard',
                      component: DashboardView
                    },
                    {
                      path: 'media',
                      name: 'admin.media',
                      component: MediaListView
                    },
                    {
                      path: 'media/update/:id',
                      name: 'admin.media.update',
                      component: MediaUpdateView
                    },
                    {
                      path: 'variable',
                      name: 'admin.variable',
                      component: TestView
                    },
                    {
                      path: 'settings',
                      name: 'admin.settings',
                      component: SettingsView
                    },
                    {
                      path: '',
                      name: 'admin.users',
                      component: AdminVue
                    },
                    {
                      path: 'roles-permissions',
                      name: 'admin.roles-permissions',
                      component: RolesPermissionsView
                    },
                    {
                      path: 'parameter',
                      name: 'admin.parameter',
                      component: ParameterView
                    },
                    {
                      path:"content-types",
                      children:[
                        {
                          path:"",
                          name:"admin.content-types",
                          component:ContentTypeListView
                        },
                        {
                          path:"create",
                          name:"admin.content-types.create",
                          component:ContentTypeFormView
                        }
                      ]
                    },
                    {
                      path: 'content-entry',
                      children: [
                        {
                          path: '',
                          name: 'admin.content-entry',
                          component: ContentEntryListView
                        },
                        {
                          path: 'create',
                          name: 'admin.content-entry.create',
                          component: ContentEntryFormView
                        },
                        {
                          path: 'list',
                          name: 'admin.content-entry.list',
                          component: ContentEntryListView
                        }
                      ]
                    },
                    {
                      path: 'taxonomy',
                      children: [
                        {
                          path: '',
                          name: 'admin.taxonomies',
                          component: TaxonomyListView
                        },
                        {
                          path: 'create',
                          name: 'admin.taxonomies.create',
                          component: TaxonomyFormView
                        },
                        {
                          path: 'edit/:id',
                          name: 'admin.taxonomies.edit',
                          component: TaxonomyFormView
                        }
                      ]
                    }
                ]
            },

        ]
    },

    {path: '/:pathMatch(.*)*',
        component: DefaultLayout,
        children: [
            {
              path: '',
              name: 'notfound',
              component: NotFoundPage
            }
        ]
    }
  ],
})




// Guard global pour la gestion de l'authentification
setupAuthGuard(router);



export default router
