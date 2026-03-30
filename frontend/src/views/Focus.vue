<script setup lang="ts">
import AppShell from '@/components/layout/AppShell.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronRight, Coffee, Play, TimerReset } from 'lucide-vue-next'

type FocusMode = {
  id: 'focus' | 'short-break'
  label: string
  icon: typeof TimerReset
}

const currentTask = 'Quarterly Report Strategy'
const initialDuration = '35:00'
const activeMode: FocusMode['id'] = 'focus'

const modes: FocusMode[] = [
  {
    id: 'focus',
    label: 'Focus',
    icon: TimerReset,
  },
  {
    id: 'short-break',
    label: 'Short Break',
    icon: Coffee,
  },
]
</script>

<template>
  <AppShell>
    <section class="flex flex-1 flex-col gap-6 pb-2 pt-3">
      <header class="space-y-3 px-1 pt-1 text-center">
        <h2 class="text-[2.1rem] font-semibold uppercase tracking-[0.22em] text-slate-900">
          Focus
        </h2>
        <p class="text-[1.05rem] font-medium uppercase tracking-[0.18em] text-blue-500">
          Stay in Shape
        </p>
      </header>

      <Card
        class="overflow-hidden rounded-[2rem] border-white/80 bg-white shadow-[0_24px_60px_-34px_rgba(59,130,246,0.28)]"
      >
        <CardContent class="flex items-center gap-4 p-5">
          <div class="min-w-0 flex-1">
            <p class="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Working On
            </p>
            <h3 class="mt-3 text-[1.08rem] font-semibold tracking-[-0.03em] text-slate-800">
              {{ currentTask }}
            </h3>
          </div>

          <Button
            type="button"
            variant="ghost"
            class="h-16 rounded-[1.15rem] bg-slate-100 px-5 text-base font-medium text-slate-600 hover:bg-slate-100/90"
          >
            Change
            <ChevronRight class="size-4" />
          </Button>
        </CardContent>
      </Card>

      <div class="flex justify-center pt-2">
        <div
          class="relative flex aspect-square w-full max-w-[19rem] items-center justify-center rounded-full border-[6px] border-blue-500 bg-white shadow-[inset_0_18px_50px_-34px_rgba(59,130,246,0.2),0_22px_55px_-40px_rgba(59,130,246,0.22)]"
        >
          <div class="flex flex-col items-center text-center">
            <div class="text-[4.7rem] font-light leading-none tracking-[-0.08em] text-slate-900">
              {{ initialDuration }}
            </div>
            <p class="mt-4 text-[1.05rem] font-medium tracking-[-0.02em] text-slate-400">
              Ready to start?
            </p>
          </div>
        </div>
      </div>

      <Button
        type="button"
        class="mx-auto mt-1 flex h-16 w-full max-w-[18.5rem] items-center justify-center rounded-[1.3rem] bg-blue-500 text-[1.05rem] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_20px_36px_-22px_rgba(59,130,246,0.95)] hover:bg-blue-500/90"
      >
        <Play class="size-5 fill-current" />
        Start Session
      </Button>

      <div class="grid grid-cols-2 gap-4 pt-3">
        <Button
          v-for="mode in modes"
          :key="mode.id"
          type="button"
          variant="ghost"
          class="flex h-auto min-h-[8.25rem] flex-col items-center justify-center gap-3 rounded-[1.55rem] border px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
          :class="
            mode.id === activeMode
              ? 'border-blue-200 bg-blue-50 text-blue-500'
              : 'border-slate-100 bg-slate-50 text-slate-500'
          "
        >
          <component :is="mode.icon" class="size-7 stroke-[1.8]" />
          <span class="text-lg font-semibold uppercase tracking-[0.05em]">
            {{ mode.label }}
          </span>
        </Button>
      </div>
    </section>
  </AppShell>
</template>
