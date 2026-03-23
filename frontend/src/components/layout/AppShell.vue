<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { usePwaInstall } from '@/composables/usePwaInstall'

const route = useRoute()
const router = useRouter()
const { canInstall, install } = usePwaInstall()

const navItems = computed(() => [
  { name: 'Today', to: '/' },
  { name: 'Tasks', to: '/tasks' },
  { name: 'Focus', to: '/focus' },
  { name: 'Stats', to: '/stats' },
])

function isActive(path: string) {
  return route.path === path
}
</script>

<template>
  <div class="flex min-h-svh flex-col bg-background text-foreground">
    <header class="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
      <div class="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3">
        <h1 class="text-lg font-semibold">Productivity</h1>
        <button
          v-if="canInstall"
          type="button"
          class="rounded-md border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
          @click="install"
        >
          Install app
        </button>
        <slot name="header-actions" />
      </div>
    </header>

    <main class="mx-auto flex w-full max-w-md flex-1 px-4 py-4">
      <div class="flex w-full flex-col gap-4">
        <slot />
      </div>
    </main>

    <nav
      class="sticky bottom-0 z-10 border-t bg-background/90 backdrop-blur-sm"
      aria-label="Main navigation"
    >
      <div class="mx-auto flex w-full max-w-md items-center justify-between px-2 py-2">
        <button
          v-for="item in navItems"
          :key="item.to"
          type="button"
          class="flex flex-1 flex-col items-center gap-0.5 rounded-md px-2 py-1 text-[11px] font-medium"
          :class="
            isActive(item.to)
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          "
          @click="router.push(item.to)"
        >
          <span class="h-1.5 w-1.5 rounded-full" :class="isActive(item.to) ? 'bg-primary' : 'bg-transparent'" />
          <span>{{ item.name }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>

