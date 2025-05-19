import { createRouter, createWebHistory } from 'vue-router'
import Home from '@renderer/components/home/Home.vue'
import MyInfo from '@renderer/components/myInfo/MyInfo.vue'

const routes = [
  {
    path: '/home',
    name: 'home',
    component: Home
  },
  {
    path: '/myInfo',
    name: 'myInfo',
    component: MyInfo
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

export default router
