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
                        },
                        {
                          path:"edit/:id",
                          name:"admin.content-types.edit",
                          component:ContentTypeEditView
                        },
                        {
                          path: 'corbeille',
                          name: 'admin.content-types.corbeille',
                          component:  ContentTypeCorbeilleView
                        }
                      ]
                    },
                    {
                      path: 'content-entry',
                      children: [
                        {
                          path: 'create/:id',
                          name: 'admin.content-entry.create',
                          component: ContentEntryCreateFormView
                        },
                        {
                          path: 'list/:slug',
                          name: 'admin.content-entry.list',
                          component: ContentEntryListView
                        },
                        {
                          path: 'update/:id',
                          name: 'admin.content-entry.update',
                          component: ContentEntryUpdateFormView
                        },
                        {
                          path: 'preview/:id',
                          name: 'admin.content-entry.preview',
                          component: ContentEntryPreviewView
                        },
                        {
                          path: 'corbeille',
                          name: 'admin.content-entry.corbeille',
                          component: ContentEntryCorbeilleView
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
                        },
                        {
                          path: 'corbeille',
                          name: 'admin.taxonomies.corbeille',
                          component: TaxonomyCorbeilleView
                        }
                      ]
                    },
                    {
                      path: 'pages',
                      children:[
                        {
                          path: '',
                          name: 'admin.pages',
                          component: PageListView
                        },
                        {
                          path: 'page-revisions/:id',
                          name: 'admin.pages.revisions',
                          component: PageRevisionListView,
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
                }
              ]
            }
        ]
    },

    {
        path: '/:slug',
        component: BuilderLayout,
        children: [
            {
                path: '',
                name: 'site.render',
                component: PageRenderView,
            }
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
