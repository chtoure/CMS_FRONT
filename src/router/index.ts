import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layout/DefaultLayout.vue'
import NotFoundPage from '@/views/error/NotFoundPage.vue'
import LoginView from '@/views/auth/LoginView.vue'
import MainLayout from '@/layout/MainLayout.vue'
import DashboardView from '@/views/DashboardView.vue'
import MediaListView from '@/views/media/MediaListView.vue'

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
                        component: LoginView
                    }
                ]
            },
            {
                path: '',
                component: MainLayout,
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

export default router
