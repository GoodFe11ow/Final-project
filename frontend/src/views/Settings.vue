<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  BarChart3,
  BellRing,
  ChevronRight,
  Clock3,
  Coffee,
  FileText,
  LogOut,
  MoonStar,
} from 'lucide-vue-next'
import AppShell from '@/components/layout/AppShell.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const router = useRouter()
const sectionShellClass =
  'space-y-3 rounded-[1.9rem] border border-slate-200/80 bg-[#f5f7ff] p-3 shadow-[0_24px_56px_-44px_rgba(15,23,42,0.14)]'
const rowCardClass =
  'rounded-[1.6rem] border border-slate-200/80 bg-white shadow-[0_18px_38px_-34px_rgba(15,23,42,0.14)]'

const timerSettings = [
  {
    icon: Clock3,
    title: 'Focus',
    description: 'Deep work period',
    value: '35 min',
  },
  {
    icon: Coffee,
    title: 'Break',
    description: 'Rest and recharge',
    value: '5 min',
  },
]

const notificationSettings = [
  {
    icon: BellRing,
    title: 'Focus reminders',
  },
  {
    icon: FileText,
    title: 'Daily summary',
  },
]
</script>

<template>
  <AppShell>
    <section class="flex flex-1 flex-col gap-7 pb-4 pt-2">
      <section :class="sectionShellClass">
        <p class="px-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Statistics
        </p>

        <button type="button" class="w-full text-left" @click="router.push('/stats')">
          <Card :class="rowCardClass">
            <CardContent class="flex items-center gap-4 p-4">
              <span class="flex size-11 items-center justify-center rounded-[1rem] bg-[#eef2ff] text-blue-500">
                <BarChart3 class="size-5" />
              </span>

              <div class="min-w-0 flex-1">
                <p class="text-[1.02rem] font-semibold tracking-[-0.02em] text-slate-800">
                  View Statistics
                </p>
              </div>

              <ChevronRight class="size-5 text-blue-500" />
            </CardContent>
          </Card>
        </button>
      </section>

      <section :class="sectionShellClass">
        <p class="px-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Timer Settings
        </p>

        <div class="space-y-3">
          <button
            v-for="setting in timerSettings"
            :key="setting.title"
            type="button"
            class="w-full text-left"
          >
            <Card :class="rowCardClass">
              <CardContent class="flex items-center gap-4 p-4">
                <span class="flex size-11 items-center justify-center rounded-[1rem] bg-[#eef2ff] text-blue-500">
                  <component :is="setting.icon" class="size-5" />
                </span>

                <div class="min-w-0 flex-1">
                  <p class="text-[1.02rem] font-semibold tracking-[-0.02em] text-slate-800">
                    {{ setting.title }}
                  </p>
                  <p class="mt-1 text-sm text-slate-400">
                    {{ setting.description }}
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-[1.02rem] font-semibold text-blue-500">
                    {{ setting.value }}
                  </span>
                  <ChevronRight class="size-4 text-slate-300" />
                </div>
              </CardContent>
            </Card>
          </button>
        </div>
      </section>

      <section :class="sectionShellClass">
        <p class="px-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Notifications
        </p>

        <div class="space-y-3">
          <button
            v-for="setting in notificationSettings"
            :key="setting.title"
            type="button"
            class="w-full text-left"
          >
            <Card :class="rowCardClass">
              <CardContent class="flex items-center gap-4 p-4">
                <span class="flex size-11 items-center justify-center rounded-[1rem] bg-[#eef2ff] text-slate-500">
                  <component :is="setting.icon" class="size-5" />
                </span>

                <div class="min-w-0 flex-1">
                  <p class="text-[1.02rem] font-semibold tracking-[-0.02em] text-slate-800">
                    {{ setting.title }}
                  </p>
                </div>

                <ChevronRight class="size-4 text-slate-300" />
              </CardContent>
            </Card>
          </button>
        </div>
      </section>

      <section :class="sectionShellClass">
        <p class="px-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Appearance
        </p>

        <Card :class="rowCardClass">
          <CardContent class="flex items-center gap-4 p-4">
            <span class="flex size-11 items-center justify-center rounded-[1rem] bg-[#eef2ff] text-slate-500">
              <MoonStar class="size-5" />
            </span>

            <div class="min-w-0 flex-1">
              <p class="text-[1.02rem] font-semibold tracking-[-0.02em] text-slate-800">
                Theme
              </p>
            </div>

            <div class="flex items-center rounded-full bg-[#e7ebf8] p-1">
              <button
                type="button"
                class="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-blue-500 shadow-sm"
              >
                Light
              </button>
              <button
                type="button"
                class="rounded-full px-4 py-1.5 text-sm font-semibold text-slate-500"
              >
                Dark
              </button>
            </div>
          </CardContent>
        </Card>
      </section>

      <div class="pt-2">
        <Button
          type="button"
          variant="outline"
          class="mx-auto h-12 rounded-xl border-red-300 px-6 text-base font-semibold text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut class="size-4" />
          Log out
        </Button>
      </div>
    </section>
  </AppShell>
</template>
