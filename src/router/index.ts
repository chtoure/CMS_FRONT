import { createRouter, createWebHistory } from 'vue-router'
import DefaultLayout from '@/layout/DefaultLayout.vue'
import NotFoundPage from '@/views/error/NotFoundPage.vue'
import LoginPage from '@/views/auth/LoginPage.vue'
import MainLayout from '@/layout/MainLayout.vue'
import Test2 from '@/views/variable/Test2.vue'

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
                        component: LoginPage
                    }
                ]
            },
            {
                path: 'dashboard',
                component: MainLayout,
                children: [
                    {path: '', component: Test2}
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
