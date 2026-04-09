<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { VisAxis, VisGroupedBar, VisXYContainer } from '@unovis/vue'
import { CheckCheck, Clock3, Flame } from 'lucide-vue-next'
import AppShell from '@/components/layout/AppShell.vue'
import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { useTasksStore } from '@/stores/tasks'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
const DEMO_WEEKLY_COMPLETIONS = [1, 2, 4, 2, 0, 0, 0]
const DEMO_FOCUS_MINUTES = 10 * 60 + 35
const WEEKLY_TICK_VALUES = [0, 1, 2, 3, 4, 5]

type WeeklyChartDatum = {
  day: number
  label: string
  value: number
  isToday: boolean
}

const chartConfig = {
  base: {
    label: 'Completed tasks',
    color: '#a9cbf7',
  },
  current: {
    label: 'Today',
    color: '#1661d8',
  },
} satisfies ChartConfig

const tasksStore = useTasksStore()
const { tasks } = storeToRefs(tasksStore)

const todayWeekIndex = computed(() => {
  return (new Date().getDay() + 6) % 7
})

const completedTasksCount = computed(() => {
  return tasks.value.reduce((total, task) => {
    if (task.subtasks.length > 0) {
      return total + task.subtasks.filter((subtask) => subtask.completed).length
    }

    return total + (task.completed ? 1 : 0)
  }, 0)
})

const focusTimeLabel = computed(() => {
  const hours = Math.floor(DEMO_FOCUS_MINUTES / 60)
  const minutes = DEMO_FOCUS_MINUTES % 60

  return `${hours}h ${minutes}min`
})

const weeklyChartData = computed<WeeklyChartDatum[]>(() => {
  return DAY_LABELS.map((label, index) => ({
    day: index,
    label,
    value: DEMO_WEEKLY_COMPLETIONS[index] ?? 0,
    isToday: index === todayWeekIndex.value,
  }))
})

const currentStreakDays = computed(() => {
  let streak = 0

  for (let index = todayWeekIndex.value; index >= 0; index -= 1) {
    if ((DEMO_WEEKLY_COMPLETIONS[index] ?? 0) <= 0) break
    streak += 1
  }

  return streak
})

function getChartBarColor(datum: WeeklyChartDatum) {
  return datum.isToday ? 'var(--color-current)' : 'var(--color-base)'
}

function getChartDayValue(datum: WeeklyChartDatum) {
  return datum.day
}

function getChartTaskValue(datum: WeeklyChartDatum) {
  return datum.value
}

function formatWeekdayTick(tick: number | Date) {
  const dayIndex = typeof tick === 'number' ? tick : Number(tick)
  return weeklyChartData.value[dayIndex]?.label ?? ''
}

function formatCountTick(tick: number | Date) {
  return `${typeof tick === 'number' ? tick : Number(tick)}`
}
</script>

<template>
  <AppShell>
    <section class="flex flex-1 flex-col gap-6 pb-2 pt-3">
      <header class="pt-1 text-center">
        <h2 class="text-[2.15rem] font-semibold uppercase tracking-[0.05em] text-slate-900">
          Statistics
        </h2>
        <p class="mt-1 text-[1.02rem] font-medium text-slate-500">
          Your progress this week
        </p>
      </header>

      <section class="space-y-3">
        <Card class="rounded-[1.35rem] border-slate-200/80 shadow-[0_20px_42px_-34px_rgba(15,23,42,0.16)]">
          <CardContent class="flex items-center gap-4 p-4">
            <span class="flex size-11 items-center justify-center rounded-[1rem] bg-blue-500 text-white">
              <CheckCheck class="size-5" />
            </span>

            <div class="min-w-0 flex-1">
              <p class="text-[1.02rem] font-medium text-slate-500">
                Completed tasks
              </p>
              <p class="mt-0.5 text-[1.5rem] font-semibold leading-none tracking-[-0.04em] text-slate-900">
                {{ completedTasksCount }}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card class="rounded-[1.35rem] border-slate-200/80 shadow-[0_20px_42px_-34px_rgba(15,23,42,0.16)]">
          <CardContent class="flex items-center gap-4 p-4">
            <span class="flex size-11 items-center justify-center rounded-[1rem] bg-[#cfe0ff] text-slate-600">
              <Clock3 class="size-5" />
            </span>

            <div class="min-w-0 flex-1">
              <p class="text-[1.02rem] font-medium text-slate-500">
                Focus time
              </p>
              <p class="mt-0.5 text-[1.5rem] font-semibold leading-none tracking-[-0.04em] text-slate-900">
                {{ focusTimeLabel }}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card class="rounded-[1.35rem] border-slate-200/80 shadow-[0_20px_42px_-34px_rgba(15,23,42,0.16)]">
          <CardContent class="flex items-center gap-4 p-4">
            <span class="flex size-11 items-center justify-center rounded-[1rem] bg-[#ffe0cf] text-amber-700">
              <Flame class="size-5" />
            </span>

            <div class="min-w-0 flex-1">
              <p class="text-[1.02rem] font-medium text-slate-500">
                Current streak
              </p>
              <p class="mt-0.5 text-[1.5rem] font-semibold leading-none tracking-[-0.04em] text-slate-900">
                {{ currentStreakDays }} days
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section class="pt-1">
        <p class="px-1 text-[0.92rem] font-semibold uppercase tracking-[0.02em] text-slate-900">
          Tasks Completed This Week
        </p>

        <Card class="mt-3 rounded-[1rem] border-slate-200/80 bg-[#f4f7ff] shadow-[0_28px_60px_-46px_rgba(15,23,42,0.2)]">
          <CardContent class="p-4">
            <ChartContainer :config="chartConfig" class="h-auto">
              <VisXYContainer
                :data="weeklyChartData"
                :y-domain="[0, 5]"
                :x-domain="[0, 6]"
                :auto-margin="true"
              >
                <VisGroupedBar
                  :x="getChartDayValue"
                  :y="getChartTaskValue"
                  :color="getChartBarColor"
                  :rounded-corners="6"
                  :bar-padding="0.12"
                  :group-padding="0.32"
                />

                <VisAxis
                  type="x"
                  :x="getChartDayValue"
                  :tick-values="weeklyChartData.map((item) => item.day)"
                  :tick-format="formatWeekdayTick"
                  :tick-line="false"
                  :grid-line="false"
                  :domain-line="false"
                  tick-text-color="#64748b"
                  tick-text-font-size="11px"
                  :tick-padding="14"
                />

                <VisAxis
                  type="y"
                  :tick-values="WEEKLY_TICK_VALUES"
                  :tick-format="formatCountTick"
                  :tick-line="false"
                  :grid-line="true"
                  :domain-line="false"
                  tick-text-color="#64748b"
                  tick-text-font-size="11px"
                  :tick-padding="12"
                />
              </VisXYContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>
    </section>
  </AppShell>
</template>
