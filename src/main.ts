import './assets/main.css'
import 'vue3-toastify/dist/index.css';

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'
import { createHead } from "@vueuse/head"
import { VueQueryPlugin } from '@tanstack/vue-query'
import Vue3Toastify from 'vue3-toastify'



const app = createApp(App)
const pinia = createPinia()
const head = createHead()

pinia.use(piniaPluginPersistedstate)
app.use(pinia)
app.use(router)
app.use(head)
app.use(VueQueryPlugin);
app.use(Vue3Toastify, {
  autoClose: 3000,
  position: "bottom-right",
} );

app.mount('#app')
