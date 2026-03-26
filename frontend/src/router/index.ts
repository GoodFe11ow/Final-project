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

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
  }
}

const routes = [
  { path: '/welcome', component: Welcome, meta: { title: 'Welcome' } },
  { path: '/login', component: Login, meta: { title: 'Log in' } },
  { path: '/register', component: Register, meta: { title: 'Sign up' } },
  { path: '/', component: Home, meta: { title: 'Home' } },
  { path: '/focus', component: Focus, meta: { title: 'Focus' } },
  { path: '/tasks', component: Tasks, meta: { title: 'Tasks' } },
  { path: '/calendar', component: Calendar, meta: { title: 'Calendar' } },
  { path: '/settings', component: Settings, meta: { title: 'Settings' } },
  { path: '/stats', component: Stats, meta: { title: 'Stats' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} · Productivity`
  }
})

export default router

