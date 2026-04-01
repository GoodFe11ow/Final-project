<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  CheckCircle2,
  ChevronRight,
  Coffee,
  Pause,
  Play,
  RotateCcw,
  Square,
  TimerReset,
} from 'lucide-vue-next'

type FocusModeId = 'focus' | 'short-break'
type TimerState = 'idle' | 'running' | 'paused' | 'completed'
type CompletionType = 'completed-normally' | 'stopped-early'

type FocusMode = {
  id: FocusModeId
  label: string
  icon: typeof TimerReset
  durationMs: number
  idleSubtitle: string
  sessionBadge: string
  quote: string
}

type SessionSummary = {
  plannedDurationMs: number
  actualElapsedMs: number
  completionType: CompletionType
  mode: FocusModeId
  task: string
}

const demoTasks = [
  'Quarterly Report Strategy',
  'Design System Audit',
  'Client Meeting Prep',
]

const modes: FocusMode[] = [
  {
    id: 'focus',
    label: 'Focus',
    icon: TimerReset,
    durationMs: 0.1 * 60 * 1000,
    idleSubtitle: 'Stay in Shape',
    sessionBadge: 'Deep Work Mode',
    quote: '"Concentrate all your thoughts upon the work in hand."',
  },
  {
    id: 'short-break',
    label: 'Short Break',
    icon: Coffee,
    durationMs: 0.2 * 60 * 1000,
    idleSubtitle: 'Reset Your Energy',
    sessionBadge: 'Recovery Mode',
    quote: '"A short reset helps the next focus block feel lighter."',
  },
]

const circleRadius = 138
const circleCircumference = 2 * Math.PI * circleRadius

const taskIndex = ref(0)
const selectedMode = ref<FocusModeId>('focus')
const timerState = ref<TimerState>('idle')
const plannedDurationMs = ref(getModeConfig('focus').durationMs)
const remainingMs = ref(plannedDurationMs.value)
const accumulatedElapsedMs = ref(0)
const runningSinceMs = ref<number | null>(null)
const tickIntervalId = ref<number | null>(null)
const sessionSummary = ref<SessionSummary | null>(null)

const currentMode = computed(() => getModeConfig(selectedMode.value))
const currentTask = computed(() => demoTasks[taskIndex.value] ?? demoTasks[0] ?? 'Focus session')
const hideAppChrome = computed(() => {
  return timerState.value === 'running' || timerState.value === 'paused'
})

const elapsedMs = computed(() => {
  if (timerState.value === 'completed' && sessionSummary.value) {
    return sessionSummary.value.actualElapsedMs
  }

  return Math.max(0, plannedDurationMs.value - remainingMs.value)
})

const progressRatio = computed(() => {
  if (plannedDurationMs.value <= 0) return 0

  return Math.min(1, elapsedMs.value / plannedDurationMs.value)
})

const progressOffset = computed(() => {
  return circleCircumference * progressRatio.value
})

const headerText = computed(() => {
  switch (timerState.value) {
    case 'running':
      return {
        title: 'Stay Focused',
        subtitle: '',
      }
    case 'paused':
      return {
        title: 'Paused',
        subtitle: 'Resume when you are ready',
      }
    case 'completed':
      return {
        title: 'Session Summary',
        subtitle:
          sessionSummary.value?.completionType === 'completed-normally'
            ? 'Completed normally'
            : 'Stopped early',
      }
    case 'idle':
    default:
      return {
        title: 'Focus',
        subtitle: currentMode.value.idleSubtitle,
      }
  }
})

const taskCardLabel = computed(() => {
  if (timerState.value === 'completed') return 'Session Task'
  if (timerState.value === 'idle') return 'Working On'
  return 'Current Task'
})

const timerPrimaryText = computed(() => {
  if (timerState.value === 'completed' && sessionSummary.value) {
    return formatDuration(sessionSummary.value.actualElapsedMs)
  }

  return formatDuration(remainingMs.value)
})

const completionStatusLabel = computed(() => {
  return sessionSummary.value?.completionType === 'completed-normally'
    ? 'Completed normally'
    : 'Stopped early'
})

function getModeConfig(id: FocusModeId) {
  return modes.find((mode) => mode.id === id) ?? modes[0]
}

function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(durationMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function clearTickInterval() {
  if (tickIntervalId.value !== null) {
    window.clearInterval(tickIntervalId.value)
    tickIntervalId.value = null
  }
}

function getLiveElapsedMs(now = Date.now()) {
  const runningElapsed =
    runningSinceMs.value !== null ? now - runningSinceMs.value : 0

  return Math.min(
    plannedDurationMs.value,
    accumulatedElapsedMs.value + runningElapsed,
  )
}

function syncRemainingTime(now = Date.now()) {
  const nextElapsed = getLiveElapsedMs(now)
  remainingMs.value = Math.max(plannedDurationMs.value - nextElapsed, 0)

  return nextElapsed
}

function finalizeSession(
  completionType: CompletionType,
  elapsedMsValue = getLiveElapsedMs(),
) {
  clearTickInterval()

  const actualElapsed = Math.max(
    0,
    Math.min(elapsedMsValue, plannedDurationMs.value),
  )

  accumulatedElapsedMs.value = actualElapsed
  runningSinceMs.value = null
  remainingMs.value = Math.max(plannedDurationMs.value - actualElapsed, 0)

  sessionSummary.value = {
    plannedDurationMs: plannedDurationMs.value,
    actualElapsedMs: actualElapsed,
    completionType,
    mode: selectedMode.value,
    task: currentTask.value,
  }

  timerState.value = 'completed'
}

function startTicking() {
  clearTickInterval()

  const tick = () => {
    const currentElapsed = syncRemainingTime()

    if (currentElapsed >= plannedDurationMs.value) {
      finalizeSession('completed-normally', plannedDurationMs.value)
    }
  }

  tick()
  tickIntervalId.value = window.setInterval(tick, 250)
}

function resetToIdle() {
  clearTickInterval()
  timerState.value = 'idle'
  accumulatedElapsedMs.value = 0
  runningSinceMs.value = null
  sessionSummary.value = null
  plannedDurationMs.value = currentMode.value.durationMs
  remainingMs.value = plannedDurationMs.value
}

function handleModeSelect(modeId: FocusModeId) {
  if (timerState.value !== 'idle') return

  selectedMode.value = modeId
  plannedDurationMs.value = getModeConfig(modeId).durationMs
  remainingMs.value = plannedDurationMs.value
}

function handleChangeTask() {
  if (timerState.value !== 'idle') return

  taskIndex.value = (taskIndex.value + 1) % demoTasks.length
}

function startSession() {
  sessionSummary.value = null
  accumulatedElapsedMs.value = 0
  plannedDurationMs.value = currentMode.value.durationMs
  remainingMs.value = plannedDurationMs.value
  runningSinceMs.value = Date.now()
  timerState.value = 'running'
  startTicking()
}

function pauseSession() {
  if (timerState.value !== 'running') return

  accumulatedElapsedMs.value = syncRemainingTime()
  runningSinceMs.value = null
  timerState.value = 'paused'
  clearTickInterval()
}

function resumeSession() {
  if (timerState.value !== 'paused') return

  runningSinceMs.value = Date.now()
  timerState.value = 'running'
  startTicking()
}

function stopSession() {
  if (timerState.value !== 'running' && timerState.value !== 'paused') return

  const elapsedNow = syncRemainingTime()
  finalizeSession('stopped-early', elapsedNow)
}

onBeforeUnmount(() => {
  clearTickInterval()
})
</script>

<template>
  <AppShell :chrome-hidden="hideAppChrome">
    <section class="flex flex-1 flex-col gap-6 pb-2 pt-3">
      <header class="space-y-3 px-1 pt-1 text-center">
        <h2 class="text-[2.05rem] font-semibold uppercase tracking-[0.2em] text-slate-900">
          {{ headerText.title }}
        </h2>
        <p
          v-if="headerText.subtitle"
          class="text-[1.02rem] font-medium uppercase tracking-[0.16em] text-blue-500"
        >
          {{ headerText.subtitle }}
        </p>
      </header>

      <Card
        v-if="timerState === 'idle'"
        class="overflow-hidden rounded-[2rem] border-white/80 bg-white shadow-[0_24px_60px_-34px_rgba(59,130,246,0.28)]"
      >
        <CardContent class="flex items-center gap-4 p-5">
          <div class="min-w-0 flex-1">
            <p class="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {{ taskCardLabel }}
            </p>
            <h3 class="mt-3 text-[1.08rem] font-semibold tracking-[-0.03em] text-slate-800">
              {{ currentTask }}
            </h3>
          </div>

          <Button
            type="button"
            variant="ghost"
            class="h-16 rounded-[1.15rem] bg-slate-100 px-5 text-base font-medium text-slate-600 hover:bg-slate-100/90"
            @click="handleChangeTask"
          >
            Change
            <ChevronRight class="size-4" />
          </Button>
        </CardContent>
      </Card>

      <Card
        v-else
        class="overflow-hidden rounded-[2rem] border-slate-100 bg-[#f5f8ff] shadow-[0_24px_60px_-34px_rgba(59,130,246,0.22)]"
      >
        <CardContent class="flex items-center gap-4 p-5">
          <div class="h-16 w-4 rounded-full bg-blue-500/95" />

          <div class="min-w-0 flex-1">
            <p class="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-blue-600">
              {{ taskCardLabel }}
            </p>
            <h3 class="mt-3 text-[1.08rem] font-semibold tracking-[-0.03em] text-slate-800">
              {{ sessionSummary?.task ?? currentTask }}
            </h3>
          </div>
        </CardContent>
      </Card>

      <div class="flex justify-center pt-2">
        <div
          v-if="timerState === 'idle'"
          class="relative flex aspect-square w-full max-w-[19rem] items-center justify-center rounded-full border-[6px] border-blue-500 bg-white shadow-[inset_0_18px_50px_-34px_rgba(59,130,246,0.2),0_22px_55px_-40px_rgba(59,130,246,0.22)]"
        >
          <div class="flex flex-col items-center text-center">
            <div class="text-[4.7rem] font-light leading-none tracking-[-0.08em] text-slate-900">
              {{ timerPrimaryText }}
            </div>
            <p class="mt-4 text-[1.05rem] font-medium tracking-[-0.02em] text-slate-400">
              Ready to start?
            </p>
          </div>
        </div>

        <div
          v-else
          class="relative flex aspect-square w-full max-w-[19.6rem] items-center justify-center"
        >
          <svg
            class="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 320 320"
            aria-hidden="true"
          >
            <circle
              cx="160"
              cy="160"
              :r="circleRadius"
              fill="none"
              stroke="rgb(226 232 240)"
              stroke-width="12"
            />
            <circle
              cx="160"
              cy="160"
              :r="circleRadius"
              fill="none"
              stroke="rgb(37 99 235)"
              stroke-linecap="round"
              stroke-width="12"
              :stroke-dasharray="circleCircumference"
              :stroke-dashoffset="progressOffset"
            />
          </svg>

          <div
            class="relative flex aspect-square w-[83%] flex-col items-center justify-center rounded-full bg-white text-center shadow-[inset_0_18px_50px_-34px_rgba(59,130,246,0.2),0_22px_55px_-40px_rgba(59,130,246,0.18)]"
          >
            <div class="text-[4.55rem] font-light leading-none tracking-[-0.08em] text-slate-900">
              {{ timerPrimaryText }}
            </div>

            <span
              v-if="timerState === 'running' || timerState === 'paused'"
              class="mt-5 rounded-full bg-blue-50 px-5 py-2 text-[0.95rem] font-semibold uppercase tracking-[0.14em] text-blue-700"
            >
              {{ timerState === 'paused' ? 'Paused' : currentMode.sessionBadge }}
            </span>

            <div
              v-else-if="sessionSummary"
              class="mt-5 flex items-center gap-2 rounded-full bg-slate-100 px-5 py-2 text-[0.92rem] font-semibold uppercase tracking-[0.14em] text-slate-600"
            >
              <CheckCircle2
                v-if="sessionSummary.completionType === 'completed-normally'"
                class="size-4 text-emerald-500"
              />
              <Square v-else class="size-3.5 text-orange-500" />
              <span>{{ completionStatusLabel }}</span>
            </div>
          </div>
        </div>
      </div>

      <p
        v-if="timerState === 'running' || timerState === 'paused'"
        class="mx-auto max-w-[18rem] text-center text-[1rem] leading-relaxed text-slate-400"
      >
        {{ timerState === 'paused' ? 'Take a breath, then continue when you are ready.' : currentMode.quote }}
      </p>

      <Button
        v-if="timerState === 'idle'"
        type="button"
        class="mx-auto mt-1 flex h-16 w-full max-w-[18.5rem] items-center justify-center rounded-[1.3rem] bg-blue-500 text-[1.05rem] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_20px_36px_-22px_rgba(59,130,246,0.95)] hover:bg-blue-500/90"
        @click="startSession"
      >
        <Play class="size-5 fill-current" />
        Start Session
      </Button>

      <div
        v-else-if="timerState === 'running' || timerState === 'paused'"
        class="grid grid-cols-2 gap-6 pt-3"
      >
        <div class="flex flex-col items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            class="size-[5.8rem] rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
            @click="stopSession"
          >
            <Square class="size-7" />
          </Button>
          <span class="text-[1rem] font-semibold uppercase tracking-[0.12em] text-slate-600">
            Stop
          </span>
        </div>

        <div class="flex flex-col items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            class="size-[5.8rem] rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
            @click="timerState === 'running' ? pauseSession() : resumeSession()"
          >
            <Pause v-if="timerState === 'running'" class="size-7" />
            <Play v-else class="size-7 fill-current" />
          </Button>
          <span class="text-[1rem] font-semibold uppercase tracking-[0.12em] text-slate-600">
            {{ timerState === 'running' ? 'Pause' : 'Resume' }}
          </span>
        </div>
      </div>

      <div v-else-if="sessionSummary" class="space-y-4">
        <Card
          class="rounded-[2rem] border-white/80 bg-white shadow-[0_24px_60px_-34px_rgba(59,130,246,0.2)]"
        >
          <CardContent class="space-y-4 p-5">
            <div class="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <span class="text-sm font-medium text-slate-500">Planned duration</span>
              <span class="text-base font-semibold text-slate-800">
                {{ formatDuration(sessionSummary.plannedDurationMs) }}
              </span>
            </div>

            <div class="flex items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <span class="text-sm font-medium text-slate-500">Actual focused time</span>
              <span class="text-base font-semibold text-slate-800">
                {{ formatDuration(sessionSummary.actualElapsedMs) }}
              </span>
            </div>

            <div class="flex items-center justify-between gap-4">
              <span class="text-sm font-medium text-slate-500">Result</span>
              <span
                class="rounded-full px-3 py-1 text-sm font-semibold"
                :class="
                  sessionSummary.completionType === 'completed-normally'
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'bg-orange-50 text-orange-600'
                "
              >
                {{ completionStatusLabel }}
              </span>
            </div>
          </CardContent>
        </Card>

        <div class="grid grid-cols-2 gap-4">
          <Button
            type="button"
            class="h-14 rounded-[1.2rem] bg-blue-500 text-sm font-semibold uppercase tracking-[0.08em] text-white shadow-[0_18px_30px_-18px_rgba(59,130,246,0.95)] hover:bg-blue-500/90"
            @click="startSession"
          >
            <Play class="size-4 fill-current" />
            Start Another
          </Button>

          <Button
            type="button"
            variant="outline"
            class="h-14 rounded-[1.2rem] text-sm font-semibold uppercase tracking-[0.08em]"
            @click="resetToIdle"
          >
            <RotateCcw class="size-4" />
            Reset
          </Button>
        </div>
      </div>

      <div v-if="timerState === 'idle'" class="grid grid-cols-2 gap-4 pt-3">
        <Button
          v-for="mode in modes"
          :key="mode.id"
          type="button"
          variant="ghost"
          class="flex h-auto min-h-[8.25rem] flex-col items-center justify-center gap-3 rounded-[1.55rem] border px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
          :class="
            mode.id === selectedMode
              ? 'border-blue-200 bg-blue-50 text-blue-500'
              : 'border-slate-100 bg-slate-50 text-slate-500'
          "
          @click="handleModeSelect(mode.id)"
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
