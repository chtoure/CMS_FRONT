import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layout/DefaultLayout.vue'
import NotFoundPage from '@/views/error/NotFoundPage.vue'
import LoginView from '@/views/auth/LoginView.vue'
import MainLayout from '@/layout/MainLayout.vue'
import DashboardView from '@/views/DashboardView.vue'
import MediaListView from '@/views/media/MediaListView.vue'
import MediaUpdateView from '@/views/media/MediaUpdateView.vue'
import { setupAuthGuard } from './authGuard'
import SettingsView from '@/views/user/SettingsView.vue'
import ChangePasswordView from '../views/auth/ChangePasswordView.vue'
import AdminVue from '../views/user/AdminVue.vue'
import ForgetPasswordView from '../views/auth/ForgetPasswordView.vue'
import RolesPermissionsView from '../views/user/Roles&PermissionsView.vue'
import ParameterView from '../views/parameter/ParameterView.vue'
import ContentTypeListView from '@/views/contentType/ContentTypeListView.vue'
import ContentTypeFormView from '../views/contentType/ContentTypeFormView.vue'
import ContentEntryUpdateFormView from '../views/contentEntry/ContentEntryUpdateFormView.vue'
import ContentEntryCreateFormView from '../views/contentEntry/ContentEntryCreateFormView.vue'
import ContentEntryListView from '../views/contentEntry/ContentEntryListView.vue'
import ContentEntryPreviewView from '../views/contentEntry/ContentEntryPreviewView.vue'
import TaxonomyListView from '../views/Taxonomy/TaxonomyListView.vue'
import TaxonomyFormView from '../views/Taxonomy/TaxonomyFormView.vue'
import ContentTypeEditView from '../views/contentType/ContentTypeEditView.vue'
import ContentEntryCorbeilleView from '../views/contentEntry/ContentEntryCorbeilleView.vue'
import ContentTypeCorbeilleView from '../views/contentType/ContentTypeCorbeilleView.vue'
import TaxonomyCorbeilleView from '../views/Taxonomy/TaxonomyCorbeilleView.vue'
import BuilderView from '../views/builder/BuilderView.vue'
import BuilderLayout from '../layout/BuilderLayout.vue'
import PageListView from '../views/page/PageListView.vue'
import PageRevisionListView from '../views/pageRevision/PageRevisionListView.vue'
import PageRenderView from '../views/renderPage/PageRenderView.vue'
import UserFormView from '../views/user/UserFormView.vue'
import UserCreateFormView from '../views/user/UserCreateFormView.vue'
import UserUpdateFormView from '../views/user/UserUpdateFormView.vue'
import { setupPermissionGuard } from '../middleware/routerAccessPermission'


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
        path: '/site/admin',
        children:[
            {
                path: 'auth',
                component: DefaultLayout,
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
                      component: DashboardView,
                      meta: { permissions: 'read_page_admin' }
                    },
                    {
                      path: 'media',
                      name: 'admin.media',
                      component: MediaListView,
                      meta: { permissions: 'read_media' }
                    },
                    {
                      path: 'media/update/:id',
                      name: 'admin.media.update',
                      component: MediaUpdateView,
                      meta: { permissions: 'update_media' }
                    },
                    {
                      path: 'settings',
                      name: 'admin.settings',
                      component: SettingsView,
                      meta: { permissions: 'update_user' }
                    },
                    {
                      path: '',
                      children:[
                        {
                          path: 'users',
                          name: 'admin.users.list',
                          component: AdminVue,
                          meta: { permissions: 'read_user' }
                        },
                        {
                          path: 'users/create',
                          name: 'admin.users.create',
                          component: UserCreateFormView,
                          meta: { permissions: 'create_user' }
                        },
                        {
                          path: 'users/edit/:id',
                          name: 'admin.users.edit',
                          component: UserUpdateFormView,
                          meta: { permissions: 'update_user' }
                        },
                      ]
                    },
                    {
                      path: 'roles-permissions',
                      name: 'admin.roles-permissions',
                      component: RolesPermissionsView,
                      meta: { permissions: 'read_role' }
                    },
                    {
                      path: 'parameter',
                      name: 'admin.parameter',
                      component: ParameterView,
                      meta: { permissions: 'update_parameter' }
                    },
                    {
                      path:"content-types",
                      children:[
                        {
                          path:"",
                          name:"admin.content-types",
                          component:ContentTypeListView,
                          meta: { permissions: 'read_content_type' }
                        },
                        {
                          path:"create",
                          name:"admin.content-types.create",
                          component:ContentTypeFormView,
                          meta: { permissions: 'create_content_type' }
                        },
                        {
                          path:"edit/:id",
                          name:"admin.content-types.edit",
                          component:ContentTypeEditView,
                          meta: { permissions: 'update_content_type' }
                        },
                        {
                          path: 'corbeille',
                          name: 'admin.content-types.corbeille',
                          component:  ContentTypeCorbeilleView,
                          meta: { permissions: 'read_content_type' }
                        }
                      ]
                    },
                    {
                      path: 'content-entry',
                      children: [
                        {
                          path: 'create/:id',
                          name: 'admin.content-entry.create',
                          component: ContentEntryCreateFormView,
                          meta: { permissions: 'create_content_entry' }
                        },
                        {
                          path: 'list/:slug',
                          name: 'admin.content-entry.list',
                          component: ContentEntryListView,
                          meta: { permissions: 'read_content_entry' }
                        },
                        {
                          path: 'update/:id',
                          name: 'admin.content-entry.update',
                          component: ContentEntryUpdateFormView,
                          meta: { permissions: 'update_content_entry' }
                        },
                        {
                          path: 'preview/:id',
                          name: 'admin.content-entry.preview',
                          component: ContentEntryPreviewView,
                          meta: { permissions: 'read_content_entry' }
                        },
                        {
                          path: 'corbeille',
                          name: 'admin.content-entry.corbeille',
                          component: ContentEntryCorbeilleView,
                          meta: { permissions: 'read_content_entry' }
                        }
                      ]
                    },
                    {
                      path: 'taxonomy',
                      children: [
                        {
                          path: '',
                          name: 'admin.taxonomies',
                          component: TaxonomyListView,
                          meta: { permissions: 'read_taxonomy' }
                        },
                        {
                          path: 'create',
                          name: 'admin.taxonomies.create',
                          component: TaxonomyFormView,
                          meta: { permissions: 'create_taxonomy' }
                        },
                        {
                          path: 'edit/:id',
                          name: 'admin.taxonomies.edit',
                          component: TaxonomyFormView,
                          meta: { permissions: 'update_taxonomy' }
                        },
                        {
                          path: 'corbeille',
                          name: 'admin.taxonomies.corbeille',
                          component: TaxonomyCorbeilleView,
                          meta: { permissions: 'read_taxonomy' }
                        }
                      ]
                    },
                    {
                      path: 'pages',
                      children:[
                        {
                          path: '',
                          name: 'admin.pages',
                          component: PageListView,
                          meta: { permissions: 'read_page' }
                        },
                        {
                          path: 'page-revisions/:id',
                          name: 'admin.pages.revisions',
                          component: PageRevisionListView,
                          meta: { permissions: 'read_page' }
                        }
                      ]
                    },

                ]
            },
            {
              path: 'builder',
              component: BuilderLayout,
              children:[
                {
                  path: 'page-revision/update/:id',
                  name: 'admin.page-revision.update',
                  component: BuilderView,
                  meta: { permissions: 'update_page' }
                }
              ]
            }
        ]
    },

    {
        path: '/:slug?',
        component: BuilderLayout,
        children: [
            {
                path: '',
                name: 'site.render',
                component: PageRenderView,
            }
        ]
    },

    {
        path: '/:pathMatch(.*)*',
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
// Guard global pour la gestion des permissions
setupPermissionGuard(router);



export default router
