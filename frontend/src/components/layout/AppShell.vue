<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const route = useRoute()
const router = useRouter()

const navItems = computed(() => [
  { name: 'Home', to: '/' },
  { name: 'Focus', to: '/focus' },
  { name: 'Tasks', to: '/tasks' },
  { name: 'Calendar', to: '/calendar' },
])

function isActive(path: string) {
  return route.path === path
}

const headerTitle = computed(() => String(route.meta.title ?? 'Productivity'))
</script>

<template>
  <div class="flex min-h-svh flex-col bg-background text-foreground">
    <header class="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
      <div class="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3">
        <button
          type="button"
          aria-label="Go to home"
          class="h-8 w-8"
          @click="router.push('/')"
        >
        </button>
        <h1 class="text-lg font-semibold">{{ headerTitle }}</h1>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              class="shrink-0"
              aria-label="Open menu"
            >
              <span class="flex flex-col items-center justify-center gap-0.5" aria-hidden="true">
                <span class="h-1 w-1 rounded-full bg-current" />
                <span class="h-1 w-1 rounded-full bg-current" />
                <span class="h-1 w-1 rounded-full bg-current" />
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-40">
            <DropdownMenuItem @select="router.push('/settings')">
              Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

