<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { CalendarDays, House, ListChecks, TimerReset, LogOutIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const props = withDefaults(
  defineProps<{
    chromeHidden?: boolean
  }>(),
  {
    chromeHidden: false,
  },
)

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
const mainInsetClass = computed(() =>
  props.chromeHidden
    ? 'px-4 pb-4 pt-4'
    : 'px-4 pb-[5.5rem] pt-[4.75rem]',
)
</script>

<template>
  <div class="flex min-h-svh flex-col bg-background text-foreground">
    <div
      class="fixed inset-x-0 top-0 z-20 transition-[opacity,transform] duration-300 ease-out"
      :class="
        props.chromeHidden
          ? 'pointer-events-none -translate-y-full opacity-0'
          : 'translate-y-0 opacity-100'
      "
    >
      <header class="bg-background/80 backdrop-blur-sm">
        <div class="mx-auto flex w-full max-w-md items-center justify-between px-4 py-3">
          <Button
            v-if="isHomeRoute"
            type="button"
            variant="ghost"
            size="sm"
            class="px-2 text-xs"
            @click="router.push('/welcome')"
          >
            <LogOutIcon />
          </Button>
          <span v-else class="inline-block h-8 w-12" aria-hidden="true" />
          <h1 class="text-lg font-semibold">{{ headerTitle }}</h1>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            class="shrink-0"
            aria-label="Open settings"
            @click="router.push('/settings')"
          >
            <span class="flex flex-col items-center justify-center gap-0.5" aria-hidden="true">
              <span class="h-1 w-1 rounded-full bg-current" />
              <span class="h-1 w-1 rounded-full bg-current" />
              <span class="h-1 w-1 rounded-full bg-current" />
            </span>
          </Button>
        </div>
      </header>
    </div>

    <main
      class="mx-auto flex w-full max-w-md flex-1 transition-[padding] duration-300 ease-out"
      :class="mainInsetClass"
    >
      <div class="flex w-full flex-col gap-4">
        <slot />
      </div>
    </main>

    <div
      class="fixed inset-x-0 bottom-0 z-20 transition-[opacity,transform] duration-300 ease-out"
      :class="
        props.chromeHidden
          ? 'pointer-events-none translate-y-full opacity-0'
          : 'translate-y-0 opacity-100'
      "
    >
      <nav
        class="bg-background/90 backdrop-blur-sm"
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
  </div>
</template>
