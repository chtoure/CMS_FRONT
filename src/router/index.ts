import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layout/DefaultLayout.vue'
import NotFoundPage from '@/views/error/NotFoundPage.vue'
import LoginView from '@/views/auth/LoginView.vue'
import MainLayout from '@/layout/MainLayout.vue'
import DashboardView from '@/views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
        path: '/site/admin',
        children:[
            {
                path: 'login',
                component: DefaultLayout,
                children: [
                    {
                        path: '',
                        component: LoginView
                    }
                ]
            },
            {
                path: 'dashboard',
                component: MainLayout,
                children: [
                    {path: '', component: DashboardView}
                ]
            }
        ]
    },

    {path: '/:pathMatch(.*)*',
        component: DefaultLayout,
        children: [
            {path: '', component: NotFoundPage}
        ]
    }
  ],
})

export default router
