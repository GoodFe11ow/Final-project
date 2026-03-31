<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { CalendarDays, House, ListChecks, TimerReset } from 'lucide-vue-next'
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
  { name: 'Home', to: '/', icon: House },
  { name: 'Focus', to: '/focus', icon: TimerReset },
  { name: 'Tasks', to: '/tasks', icon: ListChecks },
  { name: 'Calendar', to: '/calendar', icon: CalendarDays },
])

function isActive(path: string) {
  return route.path === path
}

const headerTitle = computed(() => String(route.meta.title ?? 'Productivity'))
const isHomeRoute = computed(() => route.path === '/')
</script>

<template>
  <div class="flex min-h-svh flex-col bg-background text-foreground">
    <header class="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
      <div class="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3">
        <Button
          v-if="isHomeRoute"
          type="button"
          variant="ghost"
          size="sm"
          class="px-2 text-xs"
          @click="router.push('/welcome')"
        >
          Выйти
        </Button>
        <span v-else class="inline-block h-8 w-12" aria-hidden="true" />
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
      <div class="mx-auto flex h-[3.9rem] w-full max-w-md items-center justify-between px-2 py-2">
        <button
          v-for="item in navItems"
          :key="item.to"
          type="button"
          class="flex h-full flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 text-[0.68rem] font-medium uppercase tracking-[0.04em] transition-colors"
          :class="
            isActive(item.to)
              ? 'text-blue-500'
              : 'text-slate-400 hover:text-slate-600'
          "
          @click="router.push(item.to)"
        >
          <component :is="item.icon" class="size-[1.15rem] stroke-[1.9]" />
          <span>{{ item.name }}</span>
        </button>
      </div>
    </nav>
  </div>
</template>
