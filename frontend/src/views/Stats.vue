<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { VisAxis, VisGroupedBar, VisXYContainer } from '@unovis/vue'
import { CheckCheck, Clock3, Flame, LoaderPinwheel } from 'lucide-vue-next'
import AppShell from '@/components/layout/AppShell.vue'
import { Card, CardContent } from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { apiRequest } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

type WeeklyCompletion = {
  day: number
  value: number
}

type StatsSummary = {
  completedTasksCount: number
  focusMinutesTotal: number
  currentStreakDays: number
  weeklyCompletions: WeeklyCompletion[]
}

type StatsSummaryResponse = {
  ok: true
  data: StatsSummary
}

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

const authStore = useAuthStore()

const isLoading = ref(true)
const errorMessage = ref('')
const statsSummary = ref<StatsSummary | null>(null)

const todayWeekIndex = computed(() => {
  return (new Date().getDay() + 6) % 7
})

const completedTasksCount = computed(() => {
  return statsSummary.value?.completedTasksCount ?? 0
})

const focusTimeLabel = computed(() => {
  const totalMinutes = statsSummary.value?.focusMinutesTotal ?? 0
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return `${hours}h ${minutes}min`
})

const weeklyChartData = computed<WeeklyChartDatum[]>(() => {
  const weeklyCompletionsByDay = new Map<number, number>(
    (statsSummary.value?.weeklyCompletions ?? []).map((entry) => [entry.day, entry.value]),
  )

  return DAY_LABELS.map((label, index) => ({
    day: index,
    label,
    value: weeklyCompletionsByDay.get(index) ?? 0,
    isToday: index === todayWeekIndex.value,
  }))
})

const currentStreakDays = computed(() => {
  return statsSummary.value?.currentStreakDays ?? 0
})

const chartMaxValue = computed(() => {
  const weeklyValues = weeklyChartData.value.map((datum) => datum.value)
  return Math.max(5, ...weeklyValues, 0)
})

const weeklyTickValues = computed(() => {
  const step = chartMaxValue.value <= 5 ? 1 : Math.ceil(chartMaxValue.value / 5)
  const ticks: number[] = []

  for (let value = 0; value <= chartMaxValue.value; value += step) {
    ticks.push(value)
  }

  if (ticks[ticks.length - 1] !== chartMaxValue.value) {
    ticks.push(chartMaxValue.value)
  }

  return ticks
})

const statsErrorMessage = computed(() => {
  if (!errorMessage.value) return ''

  if (errorMessage.value === 'Unauthorized') {
    return 'Please sign in to view your statistics.'
  }

  return 'We couldn’t load your weekly statistics right now. Please try again.'
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

async function fetchStatsSummary() {
  if (!authStore.token) {
    errorMessage.value = 'Unauthorized'
    statsSummary.value = null
    isLoading.value = false
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await apiRequest<StatsSummaryResponse>('/stats/summary', {
      token: authStore.token,
    })

    statsSummary.value = response.data
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'Failed to load statistics'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void fetchStatsSummary()
})
</script>

<template>
  <AppShell>
    <section class="flex flex-1 flex-col gap-6">
      <header class="pt-1 text-center">
        <h2 class="text-[2.15rem] font-semibold uppercase tracking-[0.05em] text-slate-900">
          Statistics
        </h2>
        <p class="mt-1 text-[1.02rem] font-medium text-slate-500">
          Your progress this week
        </p>
      </header>

      <div v-if="isLoading" class="flex flex-1 items-center justify-center">
        <div class="flex items-center gap-3 text-slate-500">
          <LoaderPinwheel class="size-5 animate-spin text-blue-500" />
          <p>Loading statistics...</p>
        </div>
      </div>

      <div
        v-else-if="statsErrorMessage"
        class="flex flex-1 items-center justify-center px-6 text-center"
      >
        <p class="text-red-500">
          {{ statsErrorMessage }}
        </p>
      </div>

      <template v-else>
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
              <ChartContainer :config="chartConfig" class="h-[18rem]">
                <VisXYContainer
                  :data="weeklyChartData"
                  :y-domain="[0, chartMaxValue]"
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
                    :tick-values="weeklyTickValues"
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
      </template>
    </section>
  </AppShell>
</template>
