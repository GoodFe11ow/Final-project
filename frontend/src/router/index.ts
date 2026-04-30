import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Tasks from '@/views/Tasks.vue'
import Focus from '@/views/Focus.vue'
import Calendar from '@/views/Calendar.vue'
import Settings from '@/views/Settings.vue'
import Stats from '@/views/Stats.vue'
import Welcome from '@/views/Welcome.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import { pinia } from '@/stores'
import { useAuthStore } from '@/stores/auth'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    guestOnly?: boolean
  }
}

const routes = [
  { path: '/', component: Welcome, meta: { title: 'Welcome', guestOnly: true } },
  { path: '/welcome', redirect: '/' },
  { path: '/login', component: Login, meta: { title: 'Log in', guestOnly: true } },
  { path: '/register', component: Register, meta: { title: 'Sign up', guestOnly: true } },

  { path: '/home', component: Home, meta: { title: 'Home', requiresAuth: true } },
  { path: '/focus', component: Focus, meta: { title: 'Focus', requiresAuth: true } },
  { path: '/tasks', component: Tasks, meta: { title: 'Tasks', requiresAuth: true } },
  { path: '/calendar', component: Calendar, meta: { title: 'Calendar', requiresAuth: true } },
  { path: '/settings', component: Settings, meta: { title: 'Settings', requiresAuth: true } },
  { path: '/stats', component: Stats, meta: { title: 'Stats', requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})
router.beforeEach((to) => {
  const authStore = useAuthStore(pinia)

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  }

  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return '/home'
  }
})

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} · Productivity`
  }
})

export default router
