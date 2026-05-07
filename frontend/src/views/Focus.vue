<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import TimerDurationDialog from '@/components/settings/TimerDurationDialog.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTimerSettingsStore } from '@/stores/timer-settings'
import { useFocusStore } from '@/stores/focus'
import {
  Check,
  ChevronRight,
  ClipboardList,
  Coffee,
  Flame,
  LoaderCircle,
  Pause,
  Play,
  Square,
  TimerOff,
  TimerReset,
} from 'lucide-vue-next'
import { apiRequest } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'

const authStore = useAuthStore()
const tasksStore = useTasksStore()
const { tasks } = storeToRefs(tasksStore)

type FocusModeId = 'focus' | 'break'
type TimerState = 'idle' | 'running' | 'paused' | 'completed'
type CompletionType = 'completed-normally' | 'stopped-early'

type CreateFocusSessionPayload = {
  mode: FocusModeId
  completionType: CompletionType
  plannedDurationMs: number
  actualElapsedMs: number
  task: string
  startedAt: string
  endedAt: string
}

type CreateFocusSessionResponse = {
  ok: true
  data: {
    id: string
  }
}

type StatsSummaryResponse = {
  ok: true
  data: {
    currentStreakDays: number
  }
}

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

const sessionStartedAtMs = ref<number | null>(null)
const isSavingSession = ref(false)
const currentStreakDays = ref(0)
const isLoadingCurrentStreak = ref(false)

const focusTaskTitles = computed(() => {
  const activeTaskTitles = tasks.value
    .filter((task) => !task.completed)
    .map((task) => task.title.trim())
    .filter((title) => title.length > 0)

  return activeTaskTitles.length > 0
    ? activeTaskTitles
    : ['General Focus Session']
})

const route = useRoute()
const router = useRouter()
const focusStore = useFocusStore()
const timerSettingsStore = useTimerSettingsStore()
const { breakDurationSeconds, focusDurationSeconds } = storeToRefs(timerSettingsStore)

const modes = computed<FocusMode[]>(() => [
  {
    id: 'focus',
    label: 'Focus',
    icon: TimerReset,
    durationMs: focusDurationSeconds.value * 1000,
    idleSubtitle: 'Stay in Shape',
    sessionBadge: 'Deep Work Mode',
    quote: '"Concentrate all your thoughts upon the work in hand."',
  },
  {
    id: 'break',
    label: 'Short Break',
    icon: Coffee,
    durationMs: breakDurationSeconds.value * 1000,
    idleSubtitle: 'Reset Your Energy',
    sessionBadge: 'Recovery Mode',
    quote: '"A short reset helps the next focus block feel lighter."',
  },
])

const circleRadius = 138
const circleCircumference = 2 * Math.PI * circleRadius

const taskIndex = ref(normalizeTaskIndex(focusStore.lastUsedTaskIndex))
const selectedMode = ref<FocusModeId>('focus')
const timerState = ref<TimerState>('idle')
const plannedDurationMs = ref(getModeConfig('focus').durationMs)
const remainingMs = ref(plannedDurationMs.value)
const accumulatedElapsedMs = ref(0)
const runningSinceMs = ref<number | null>(null)
const tickIntervalId = ref<number | null>(null)
const animationFrameId = ref<number | null>(null)
const animationNowMs = ref(Date.now())
const sessionSummary = ref<SessionSummary | null>(null)
const isFocusDurationDialogOpen = ref(false)
const isTaskDropdownOpen = ref(false)

const currentMode = computed(() => getModeConfig(selectedMode.value))
const currentTask = computed(() => focusTaskTitles.value[taskIndex.value] ?? 'Focus session')
const hideAppChrome = computed(() => {
  return timerState.value === 'running' || timerState.value === 'paused'
})

const elapsedMs = computed(() => {
  if (timerState.value === 'completed' && sessionSummary.value) {
    return sessionSummary.value.actualElapsedMs
  }

  return Math.max(0, plannedDurationMs.value - remainingMs.value)
})

const visualElapsedMs = computed(() => {
  if (timerState.value === 'running') {
    return getLiveElapsedMs(animationNowMs.value)
  }

  return elapsedMs.value
})

const progressRatio = computed(() => {
  if (plannedDurationMs.value <= 0) return 0

  return Math.min(1, visualElapsedMs.value / plannedDurationMs.value)
})

const progressOffset = computed(() => {
  return circleCircumference * progressRatio.value
})

const completedSessionLengthLabel = computed(() => {
  if (!sessionSummary.value) return '0 MIN'

  return formatDurationSummary(sessionSummary.value.actualElapsedMs)
})

const stoppedSessionTitle = computed(() => {
  return sessionSummary.value?.mode === 'break' ? 'Break Stopped' : 'Focus Stopped'
})

const isCompletedFocusSuccess = computed(() => {
  return (
    timerState.value === 'completed' &&
    sessionSummary.value?.mode === 'focus' &&
    sessionSummary.value.completionType === 'completed-normally'
  )
})

const isCompletedStopped = computed(() => {
  return (
    timerState.value === 'completed' &&
    sessionSummary.value?.mode === 'focus' &&
    sessionSummary.value?.completionType === 'stopped-early'
  )
})

const isCompletedBreakSuccess = computed(() => {
  return (
    timerState.value === 'completed' &&
    sessionSummary.value?.mode === 'break'
  )
})

const headerText = computed(() => {
  switch (timerState.value) {
    case 'running':
      return {
        title: currentMode.value.id === 'break' ? 'Break Time' : 'Stay Focused',
        subtitle: '',
      }
    case 'paused':
      return {
        title: currentMode.value.id === 'break' ? 'Break Paused' : 'Paused',
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

const timerPrimaryText = computed(() => {
  if (timerState.value === 'completed' && sessionSummary.value) {
    return formatDuration(sessionSummary.value.actualElapsedMs)
  }

  return formatDuration(remainingMs.value)
})

const focusDurationDialogConfig = computed(() => ({
  title: 'Focus Duration',
  description: 'Choose your default deep work session length.',
  selectedValue: focusDurationSeconds.value,
  options: [25 * 60, 30 * 60, 35 * 60, 45 * 60, 50 * 60, 60 * 60],
}))

const focusTaskOptions = computed(() => {
  return focusTaskTitles.value.map((title, index) => ({
    index,
    title,
    isSelected: index === taskIndex.value,
  }))
})

function getModeConfig(id: FocusModeId) {
  return modes.value.find((mode) => mode.id === id) ?? modes.value[0]
}

function normalizeTaskIndex(index: number, taskCount = focusTaskTitles.value.length) {
  if (taskCount <= 0) return 0

  const safeIndex = Number.isFinite(index) ? Math.floor(index) : 0
  const normalizedIndex = safeIndex % taskCount

  return normalizedIndex >= 0 ? normalizedIndex : normalizedIndex + taskCount
}

function formatDuration(durationMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(durationMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function formatDurationSummary(durationMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(durationMs / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  if (seconds === 0) return `${minutes} MIN`
  if (minutes === 0) return `${seconds} SEC`

  return `${minutes}M ${String(seconds).padStart(2, '0')}S`
}

function clearTickInterval() {
  if (tickIntervalId.value !== null) {
    window.clearInterval(tickIntervalId.value)
    tickIntervalId.value = null
  }
}

function clearAnimationFrame() {
  if (animationFrameId.value !== null) {
    window.cancelAnimationFrame(animationFrameId.value)
    animationFrameId.value = null
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
  clearAnimationFrame()

  const actualElapsed = Math.max(
    0,
    Math.min(elapsedMsValue, plannedDurationMs.value),
  )

  accumulatedElapsedMs.value = actualElapsed
  runningSinceMs.value = null
  remainingMs.value = Math.max(plannedDurationMs.value - actualElapsed, 0)

  const summary = {
    plannedDurationMs: plannedDurationMs.value,
    actualElapsedMs: actualElapsed,
    completionType,
    mode: selectedMode.value,
    task: currentTask.value,
  }

  sessionSummary.value = summary
  timerState.value = 'completed'

  if (completionType === 'completed-normally') {
    void persistCompletedSession(summary)
  }
}

function startAnimationLoop() {
  clearAnimationFrame()

  const animate = () => {
    animationNowMs.value = Date.now()

    if (timerState.value === 'running') {
      animationFrameId.value = window.requestAnimationFrame(animate)
      return
    }

    animationFrameId.value = null
  }

  animationFrameId.value = window.requestAnimationFrame(animate)
}

function startTicking() {
  clearTickInterval()
  startAnimationLoop()

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
  clearAnimationFrame()
  isTaskDropdownOpen.value = false
  timerState.value = 'idle'
  accumulatedElapsedMs.value = 0
  runningSinceMs.value = null
  sessionSummary.value = null
  plannedDurationMs.value = currentMode.value.durationMs
  remainingMs.value = plannedDurationMs.value
  sessionStartedAtMs.value = null
  animationNowMs.value = Date.now()
}

function handleModeSelect(modeId: FocusModeId) {
  if (timerState.value !== 'idle') return

  selectedMode.value = modeId
  if (modeId !== 'focus') {
    isTaskDropdownOpen.value = false
  }
}

function handleChangeTask() {
  if (timerState.value !== 'idle' || currentMode.value.id !== 'focus') return

  isTaskDropdownOpen.value = !isTaskDropdownOpen.value
}

function handleTaskSelect(nextTaskIndex: number) {
  if (timerState.value !== 'idle') return

  taskIndex.value = normalizeTaskIndex(nextTaskIndex)
  persistCurrentTask()
  isTaskDropdownOpen.value = false
}

function closeTaskDropdown() {
  isTaskDropdownOpen.value = false
}

function startSession() {
  sessionStartedAtMs.value = Date.now()
  animationNowMs.value = Date.now()
  isTaskDropdownOpen.value = false
  if (selectedMode.value === 'focus') {
    persistCurrentTask()
  }

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

  animationNowMs.value = Date.now()
  accumulatedElapsedMs.value = syncRemainingTime()
  runningSinceMs.value = null
  timerState.value = 'paused'
  clearTickInterval()
  clearAnimationFrame()
}

function resumeSession() {
  if (timerState.value !== 'paused') return

  animationNowMs.value = Date.now()
  runningSinceMs.value = Date.now()
  timerState.value = 'running'
  startTicking()
}

function stopSession() {
  if (timerState.value !== 'running' && timerState.value !== 'paused') return

  const elapsedNow = syncRemainingTime()
  finalizeSession('stopped-early', elapsedNow)
}

function persistCurrentTask() {
  focusStore.setLastUsedTaskIndex(taskIndex.value, focusTaskTitles.value.length)
}

function openFocusDurationDialog() {
  if (timerState.value !== 'idle') return

  selectedMode.value = 'focus'
  isFocusDurationDialogOpen.value = true
}

function updateFocusDuration(nextValue: number) {
  timerSettingsStore.setDurationSeconds('focus', nextValue)
}

function consumeHomeEntryIntent() {
  const shouldAutostart = route.query.autostart === '1'
  const shouldOpenFocusDuration = route.query.modal === 'focus-duration'

  if (!shouldAutostart && !shouldOpenFocusDuration) return

  selectedMode.value = 'focus'
  taskIndex.value = normalizeTaskIndex(focusStore.lastUsedTaskIndex)

  if (timerState.value === 'idle') {
    if (shouldAutostart) {
      startSession()
    } else if (shouldOpenFocusDuration) {
      openFocusDurationDialog()
    }
  }

  void router.replace({ path: route.path })
}

const sessionSaveError = ref('')

async function fetchCurrentStreak() {
  if (!authStore.token) {
    currentStreakDays.value = 0
    return
  }

  isLoadingCurrentStreak.value = true

  try {
    const response = await apiRequest<StatsSummaryResponse>('/stats/summary', {
      token: authStore.token,
    })

    currentStreakDays.value = response.data.currentStreakDays
  } catch (error) {
    console.error('Failed to load current streak', error)
  } finally {
    isLoadingCurrentStreak.value = false
  }
}

async function persistCompletedSession(summary: SessionSummary) {
  if(!authStore.token || sessionStartedAtMs.value === null) return

  isSavingSession.value = true
  sessionSaveError.value = ''

  try {
     await apiRequest<CreateFocusSessionResponse>('/focus-sessions', {
      method: 'POST',
      token: authStore.token,
      body: JSON.stringify({
        mode: summary.mode,
        completionType: summary.completionType,
        plannedDurationMs: summary.plannedDurationMs,
        actualElapsedMs: summary.actualElapsedMs,
        task: summary.task,
        startedAt: new Date(sessionStartedAtMs.value).toISOString(),
        endedAt: new Date().toISOString(),
      } satisfies CreateFocusSessionPayload)
     })

     await fetchCurrentStreak()
  } catch (error) {
    sessionSaveError.value =
      error instanceof Error ? error.message : 'Failed to save focus session'
    console.error('Failed to save focus session', error)
  } 
  finally  {
    isSavingSession.value = false
  }
}

function goHome() {
  router.push('/home')
}

function goToTasks() {
  router.push('/tasks')
}

function goToStats() {
  router.push('/stats')
}

onBeforeUnmount(() => {
  clearTickInterval()
  clearAnimationFrame()
})

onMounted(() => {
  void fetchCurrentStreak()
})

watch(
  () => currentMode.value.durationMs,
  (nextDurationMs) => {
    if (timerState.value !== 'idle') return

    plannedDurationMs.value = nextDurationMs
    remainingMs.value = nextDurationMs
  },
  { immediate: true },
)

watch(
  () => [route.query.autostart, route.query.modal] as const,
  () => {
    consumeHomeEntryIntent()
  },
  { immediate: true },
)

watch(
  () => focusTaskTitles.value.length,
  () => {
    taskIndex.value = normalizeTaskIndex(taskIndex.value)
    persistCurrentTask()
  },
  { immediate: true },
)
</script>

<template>
  <AppShell :chrome-hidden="hideAppChrome">
    <section class="flex flex-1 flex-col gap-6 pb-2 pt-3">
      <header
        v-if="timerState === 'idle' || timerState === 'running' || timerState === 'paused'"
        class="space-y-3 px-1 pt-1 text-center"
      >
        <h2 class="text-[2.05rem] font-semibold uppercase tracking-[0.2em] text-slate-900">
          {{ headerText.title }}
        </h2>
        <p
          class="min-h-[1.6rem] text-[1.02rem] font-medium uppercase tracking-[0.16em] text-blue-500 transition-opacity duration-200"
          :class="headerText.subtitle ? 'opacity-100' : 'opacity-0'"
        >
          {{ headerText.subtitle || '\u00A0' }}
        </p>
      </header>

      <template v-if="timerState === 'idle'">
        <div
          v-if="currentMode.id === 'focus'"
          class="relative"
          :class="isTaskDropdownOpen ? 'z-40' : ''"
        >
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
                @click="handleChangeTask"
              >
                Change
                <ChevronRight
                  class="size-4 transition-transform duration-200"
                  :class="isTaskDropdownOpen ? 'rotate-90' : ''"
                />
              </Button>
            </CardContent>
          </Card>

          <Transition
            enter-active-class="transition duration-220 ease-out"
            enter-from-class="translate-y-2 scale-[0.98] opacity-0"
            enter-to-class="translate-y-0 scale-100 opacity-100"
            leave-active-class="transition duration-180 ease-in"
            leave-from-class="translate-y-0 scale-100 opacity-100"
            leave-to-class="translate-y-1 scale-[0.985] opacity-0"
          >
            <div
              v-if="isTaskDropdownOpen"
              class="absolute inset-x-0 top-[calc(100%-0.75rem)] z-40 overflow-hidden rounded-[1.65rem] border border-slate-200/80 bg-white px-3 pb-3 pt-5 shadow-[0_28px_80px_-30px_rgba(15,23,42,0.32)]"
            >
              <div class="space-y-1">
                <p class="px-2 pb-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Select Task
                </p>
                <button
                  v-for="task in focusTaskOptions"
                  :key="`${task.index}-${task.title}`"
                  type="button"
                  class="flex w-full items-center justify-between rounded-[1rem] px-3 py-3 text-left transition-colors"
                  :class="
                    task.isSelected
                      ? 'bg-[#eef4ff] text-blue-600'
                      : 'text-slate-700 hover:bg-slate-50'
                  "
                  @click="handleTaskSelect(task.index)"
                >
                  <span class="min-w-0 flex-1 truncate text-sm font-semibold">
                    {{ task.title }}
                  </span>
                  <span
                    class="ml-3 flex size-5 shrink-0 items-center justify-center rounded-full"
                    :class="task.isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-transparent'"
                  >
                    <Check class="size-3 stroke-[3]" />
                  </span>
                </button>
              </div>
            </div>
          </Transition>
        </div>

        <div class="flex justify-center pt-2">
          <div
            class="relative flex aspect-square w-full max-w-[16.25rem] items-center justify-center rounded-full border-[6px] border-blue-500 bg-white shadow-[inset_0_18px_50px_-34px_rgba(59,130,246,0.2),0_22px_55px_-40px_rgba(59,130,246,0.22)]"
          >
            <div class="flex flex-col items-center text-center">
              <div class="text-[3.55rem] font-light leading-none tracking-[-0.08em] text-slate-900">
                {{ timerPrimaryText }}
              </div>
              <p class="mt-3 text-[0.95rem] font-medium tracking-[-0.02em] text-slate-400">
                Ready to start?
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          class="mx-auto mt-1 flex h-16 w-full max-w-[18.5rem] items-center justify-center rounded-[1.3rem] bg-blue-500 text-[1.05rem] font-semibold uppercase tracking-[0.08em] text-white shadow-[0_20px_36px_-22px_rgba(59,130,246,0.95)] hover:bg-blue-500/90"
          @click="startSession"
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
            class="flex h-auto min-h-[6.15rem] flex-col items-center justify-center gap-1.5 rounded-[1.15rem] border px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
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
      </template>

      <template v-else-if="timerState === 'running' || timerState === 'paused'">
        <Card
          v-if="currentMode.id === 'focus'"
          class="overflow-hidden rounded-[2rem] border-slate-100 bg-[#f5f8ff] shadow-[0_24px_60px_-34px_rgba(59,130,246,0.22)]"
        >
          <CardContent class="flex items-center gap-4 p-5">
            <div class="h-16 w-4 rounded-full bg-blue-500/95" />

            <div class="min-w-0 flex-1">
              <p class="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-blue-600">
                Current Task
              </p>
              <h3 class="mt-3 text-[1.08rem] font-semibold tracking-[-0.03em] text-slate-800">
                {{ currentTask }}
              </h3>
            </div>
          </CardContent>
        </Card>

        <div class="flex justify-center pt-2">
          <div class="relative flex aspect-square w-full max-w-[19.6rem] items-center justify-center">
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
                class="mt-5 rounded-full bg-blue-50 px-5 py-2 text-[0.95rem] font-semibold uppercase tracking-[0.14em] text-blue-700"
              >
                {{ timerState === 'paused' ? 'Paused' : currentMode.sessionBadge }}
              </span>
            </div>
          </div>
        </div>

        <p class="mx-auto max-w-[18rem] text-center text-[1rem] leading-relaxed text-slate-400">
          {{ timerState === 'paused' ? 'Take a breath, then continue when you are ready.' : currentMode.quote }}
        </p>

        <div class="grid grid-cols-2 gap-6 pt-3">
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
      </template>

      <template v-else-if="isCompletedFocusSuccess && sessionSummary">
        <header class="pt-1 text-center">
          <h2 class="text-[1.05rem] font-semibold uppercase tracking-[0.2em] text-[#6e84ab]">
            Focus
          </h2>
        </header>

        <Card class="rounded-[2rem] border-white/90 bg-white shadow-[0_26px_60px_-38px_rgba(15,23,42,0.14)]">
          <CardContent class="flex flex-col items-center px-6 py-8 text-center">
            <div class="flex size-[4.5rem] items-center justify-center rounded-full bg-emerald-100">
              <div class="flex size-8 items-center justify-center rounded-full bg-emerald-500">
                <Check class="size-5 text-white" />
              </div>
            </div>

            <h3 class="mt-8 text-[2rem] font-semibold uppercase tracking-[-0.05em] text-slate-900">
              Session Complete
            </h3>
            <p class="mt-4 text-[3.1rem] font-semibold leading-none tracking-[-0.06em] text-blue-600">
              {{ completedSessionLengthLabel }}
            </p>
            <p class="mt-2 text-[1.05rem] font-semibold uppercase tracking-[0.14em] text-blue-600">
              Focused
            </p>
          </CardContent>
        </Card>

        <Card class="rounded-[1.7rem] border-white/90 bg-white shadow-[0_18px_40px_-32px_rgba(15,23,42,0.12)]">
          <CardContent class="flex items-center gap-4 p-5">
            <span class="flex size-12 items-center justify-center rounded-[1rem] bg-[#edf4ff] text-blue-600">
              <ClipboardList class="size-6" />
            </span>

            <div class="min-w-0 flex-1">
              <p class="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Task
              </p>
              <h3 class="mt-2 text-[1.08rem] font-semibold tracking-[-0.03em] text-slate-800">
                {{ sessionSummary.task }}
              </h3>
            </div>
          </CardContent>
        </Card>

        <button type="button" class="w-full text-left" @click="goToStats">
          <Card class="rounded-[1.8rem] border-orange-200/70 bg-[#fff5ec] shadow-[0_18px_40px_-32px_rgba(251,146,60,0.22)]">
            <CardContent class="flex items-center gap-4 p-5">
              <span class="flex size-11 items-center justify-center rounded-full bg-white/80 text-orange-500">
                <Flame class="size-6" />
              </span>

              <div class="min-w-0 flex-1">
                <p class="text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-orange-400">
                  Current Streak
                </p>
                <div class="mt-1 flex items-center gap-2">
                  <LoaderCircle
                    v-if="isLoadingCurrentStreak || isSavingSession"
                    class="size-5 animate-spin text-orange-400"
                  />
                  <p class="text-[2rem] font-semibold leading-none tracking-[-0.04em] text-orange-600">
                    {{ currentStreakDays }} days
                  </p>
                </div>
              </div>

              <ChevronRight class="size-5 text-orange-400" />
            </CardContent>
          </Card>
        </button>

        <div class="grid grid-cols-2 gap-4 pt-2">
          <Button
            type="button"
            variant="outline"
            class="h-16 rounded-[1.2rem] border-slate-200/90 bg-white text-[1.05rem] font-semibold uppercase tracking-[0.06em] text-slate-800 shadow-[0_14px_30px_-24px_rgba(15,23,42,0.2)] hover:bg-white"
            @click="goHome"
          >
            Home
          </Button>

          <Button
            type="button"
            class="h-16 rounded-[1.2rem] bg-blue-600 text-[1.05rem] font-semibold uppercase tracking-[0.06em] text-white shadow-[0_18px_34px_-18px_rgba(37,99,235,0.75)] hover:bg-blue-600/90"
            @click="goToStats"
          >
            View Stats
          </Button>
        </div>
      </template>

      <template v-else-if="isCompletedStopped">
        <Card class="rounded-[2rem] border-white/90 bg-white shadow-[0_26px_60px_-38px_rgba(15,23,42,0.14)]">
          <CardContent class="flex flex-col items-center px-6 py-8 text-center">
            <div class="flex size-[8.8rem] items-center justify-center rounded-full bg-[#f5f7ff] shadow-[inset_0_0_0_12px_rgba(239,243,255,0.95)]">
              <div class="flex size-[6.2rem] items-center justify-center rounded-full bg-white shadow-[0_0_0_12px_rgba(241,245,249,0.9)]">
                <TimerOff class="size-10 text-blue-600 stroke-[1.8]" />
              </div>
            </div>

            <h3 class="mt-8 text-[2.15rem] font-semibold uppercase tracking-[-0.05em] text-slate-900">
              {{ stoppedSessionTitle }}
            </h3>
            <p class="mt-5 max-w-[15.5rem] text-[1rem] leading-relaxed text-slate-500">
              This session wasn't completed, so it won't be added to your statistics.
            </p>
          </CardContent>
        </Card>

        <div class="space-y-4 pt-4">
          <Button
            type="button"
            class="h-16 w-full rounded-[1.3rem] bg-blue-600 text-[1.05rem] font-semibold text-white shadow-[0_20px_36px_-22px_rgba(37,99,235,0.8)] hover:bg-blue-600/90"
            @click="goToTasks"
          >
            Return to Tasks
          </Button>

          <Button
            type="button"
            variant="outline"
            class="h-16 w-full rounded-[1.3rem] border-slate-200/90 bg-white text-[1.05rem] font-semibold text-blue-600 shadow-[0_18px_30px_-24px_rgba(15,23,42,0.12)] hover:bg-white"
            @click="startSession"
          >
            Start New Session
          </Button>
        </div>
      </template>

      <template v-else-if="isCompletedBreakSuccess">
        <header class="pt-1 text-center">
          <h2 class="text-[1.75rem] font-semibold tracking-[-0.03em] text-blue-700">
            Focus
          </h2>
        </header>

        <Card class="rounded-[2rem] border-white/90 bg-white shadow-[0_26px_60px_-38px_rgba(15,23,42,0.14)]">
          <CardContent class="flex flex-col items-center px-6 py-8 text-center">
            <div class="flex size-[7.6rem] items-center justify-center rounded-full bg-white shadow-[0_0_0_16px_rgba(241,245,249,0.92)]">
              <Coffee class="size-12 text-blue-700 stroke-[1.8]" />
            </div>

            <p class="mt-8 text-[3.05rem] font-semibold leading-none tracking-[-0.06em] text-slate-900">
              {{ completedSessionLengthLabel }}
            </p>
            <p class="mt-5 text-[1.25rem] font-semibold uppercase tracking-[0.26em] text-blue-700">
              Break Finished
            </p>
          </CardContent>
        </Card>

        <div class="space-y-5 pt-3">
          <Button
            type="button"
            class="h-16 w-full rounded-[1.3rem] bg-blue-600 text-[1.05rem] font-semibold text-white shadow-[0_20px_36px_-22px_rgba(37,99,235,0.8)] hover:bg-blue-600/90"
            @click="startSession"
          >
            Start Another
          </Button>

          <button
            type="button"
            class="w-full text-center text-[1.05rem] font-semibold text-blue-700"
            @click="resetToIdle"
          >
            Reset
          </button>
        </div>
      </template>
    </section>

    <TimerDurationDialog
      v-model:open="isFocusDurationDialogOpen"
      :title="focusDurationDialogConfig.title"
      :description="focusDurationDialogConfig.description"
      :selected-value="focusDurationDialogConfig.selectedValue"
      :options="focusDurationDialogConfig.options"
      @select="updateFocusDuration"
    />
    <Transition
      enter-active-class="transition duration-220 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-180 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <button
        v-if="isTaskDropdownOpen"
        type="button"
        class="fixed inset-0 z-30 bg-slate-900/36 backdrop-blur-[4px]"
        aria-label="Close task dropdown"
        @click="closeTaskDropdown"
      />
    </Transition>
  </AppShell>
</template>
