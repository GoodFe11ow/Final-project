<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { CalendarDays, Flame, House, ListChecks, LoaderCircle, TimerReset } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/auth'
import { useStatsStore } from '@/stores/stats'

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
const authStore = useAuthStore()
const statsStore = useStatsStore()
const { currentStreakDays, isLoadingSummary } = storeToRefs(statsStore)

const navItems = computed(() => [
  { name: 'Home', to: '/home', icon: House },
  { name: 'Focus', to: '/focus', icon: TimerReset },
  { name: 'Tasks', to: '/tasks', icon: ListChecks },
  { name: 'Calendar', to: '/calendar', icon: CalendarDays },
])

function isActive(path: string) {
  return route.path === path
}

const streakRoutes = new Set(['/home', '/focus', '/tasks', '/calendar'])
const showMainStreak = computed(() => streakRoutes.has(route.path))

const mainInsetClass = computed(() =>
  props.chromeHidden
    ? 'px-4 pb-4 pt-4'
    : 'px-4 pb-[5.5rem] pt-[3.25rem]',
)

watch(
  () => [route.path, authStore.user?.id] as const,
  ([path]) => {
    if (streakRoutes.has(path)) {
      void statsStore.fetchSummary()
    }
  },
  { immediate: true },
)

const isSettingRoute = computed(() => route.path === '/settings')
</script>

<template>
  <div class="flex min-h-svh flex-col bg-background text-foreground">
    <div
      class="pointer-events-none fixed inset-x-0 top-0 z-20 transition-[opacity,transform] duration-300 ease-out"
      :class="
        props.chromeHidden
          ? 'pointer-events-none -translate-y-full opacity-0'
          : 'translate-y-0 opacity-100'
      "
    >
      <div class="relative mx-auto w-full max-w-md">
        <div
          v-if="showMainStreak"
          class="pointer-events-auto absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-background/85 px-3 py-2 text-m font-semibold text-slate-700 shadow-[0_14px_30px_-18px_rgba(15,23,42,0.35)] backdrop-blur-sm"
        >
          <Flame class="size-6 text-orange-400" />
          <LoaderCircle
            v-if="isLoadingSummary"
            class="size-6 animate-spin text-slate-400"
          />
          <span>{{ currentStreakDays }} days</span>
        </div>

        <div v-if="!isSettingRoute" class="pointer-events-auto absolute right-4 top-4">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            class="shrink-0 rounded-full bg-background/85 text-slate-700 shadow-[0_14px_30px_-18px_rgba(15,23,42,0.35)] backdrop-blur-sm hover:bg-background"
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
      </div>
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
