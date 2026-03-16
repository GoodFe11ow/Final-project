import { createRouter, createWebHistory } from 'vue-router'
import Today from '@/views/Today.vue'
import Tasks from '@/views/Tasks.vue'
import Focus from '@/views/Focus.vue'
import Stats from '@/views/Stats.vue'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
  }
}

const routes = [
  { path: '/', component: Today, meta: { title: 'Today' } },
  { path: '/tasks', component: Tasks, meta: { title: 'Tasks' } },
  { path: '/focus', component: Focus, meta: { title: 'Focus' } },
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

