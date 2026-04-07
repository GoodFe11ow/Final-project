<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import {
  CalendarDays,
  Check,
  CircleDot,
} from 'lucide-vue-next'
import AppShell from '@/components/layout/AppShell.vue'
import { Card, CardContent } from '@/components/ui/card'
import {
  getTaskProgress,
  useTasksStore,
  type TaskItem,
} from '@/stores/tasks'

type CalendarMode = 'month' | 'week'

type CalendarCell = {
  dateKey: string
  dayNumber: number
  isCurrentMonth: boolean
  isSelected: boolean
  isToday: boolean
  hasTasks: boolean
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const tasksStore = useTasksStore()
const { tasks } = storeToRefs(tasksStore)

const todayKey = formatDateKey(new Date())
const tomorrowKey = addDaysToDateKey(todayKey, 1)

const calendarMode = ref<CalendarMode>('month')
const selectedDateKey = ref(getInitialSelectedDate())

const tasksByDate = computed(() => {
  const groupedTasks = new Map<string, TaskItem[]>()

  for (const task of tasks.value) {
    const taskDateKey = resolveTaskDateKey(task.assignedDate)
    const tasksForDate = groupedTasks.get(taskDateKey) ?? []

    tasksForDate.push(task)
    groupedTasks.set(taskDateKey, tasksForDate)
  }

  return groupedTasks
})

const visibleReferenceDate = computed(() => parseDateKey(selectedDateKey.value))

const monthLabel = computed(() => {
  return new Intl.DateTimeFormat('en', {
    month: 'long',
    year: 'numeric',
  }).format(visibleReferenceDate.value)
})

const calendarCells = computed(() => {
  return calendarMode.value === 'month'
    ? buildMonthCells(selectedDateKey.value)
    : buildWeekCells(selectedDateKey.value)
})

const selectedDateTasks = computed(() => {
  return tasksByDate.value.get(selectedDateKey.value) ?? []
})

const selectedDateTitle = computed(() => {
  if (selectedDateKey.value === todayKey) return 'Today'
  if (selectedDateKey.value === tomorrowKey) return 'Tomorrow'

  return new Intl.DateTimeFormat('en', { weekday: 'long' }).format(
    parseDateKey(selectedDateKey.value),
  )
})

const selectedDateLabel = computed(() => {
  return new Intl.DateTimeFormat('en', {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
  }).format(parseDateKey(selectedDateKey.value))
})

function selectDate(dateKey: string) {
  selectedDateKey.value = dateKey
}

function getInitialSelectedDate() {
  const taskDateKeys = tasks.value
    .map((task) => resolveTaskDateKey(task.assignedDate))
    .sort()

  return taskDateKeys[0] ?? todayKey
}

function resolveTaskDateKey(dateValue: string) {
  return isValidDateKey(dateValue) ? dateValue : tomorrowKey
}

function buildMonthCells(anchorDateKey: string): CalendarCell[] {
  const anchorDate = parseDateKey(anchorDateKey)
  const monthStart = startOfMonth(anchorDate)
  const monthEnd = endOfMonth(anchorDate)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = endOfWeek(monthEnd)

  return buildCalendarCells(
    gridStart,
    getDaySpan(gridStart, gridEnd) + 1,
    monthStart.getMonth(),
  )
}

function buildWeekCells(anchorDateKey: string): CalendarCell[] {
  const anchorDate = parseDateKey(anchorDateKey)
  const weekStart = startOfWeek(anchorDate)

  return buildCalendarCells(weekStart, 7, anchorDate.getMonth())
}

function buildCalendarCells(
  startDate: Date,
  totalDays: number,
  visibleMonth: number,
) {
  return Array.from({ length: totalDays }, (_, index) => {
    const cellDate = addDays(startDate, index)
    const cellDateKey = formatDateKey(cellDate)

    return {
      dateKey: cellDateKey,
      dayNumber: cellDate.getDate(),
      isCurrentMonth: cellDate.getMonth() === visibleMonth,
      isSelected: cellDateKey === selectedDateKey.value,
      isToday: cellDateKey === todayKey,
      hasTasks: tasksByDate.value.has(cellDateKey),
    }
  })
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number)

  return new Date(year, month - 1, day)
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')

  return `${year}-${month}-${day}`
}

function isValidDateKey(dateKey: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false

  const parsedDate = parseDateKey(dateKey)

  return formatDateKey(parsedDate) === dateKey
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)

  return nextDate
}

function addDaysToDateKey(dateKey: string, days: number) {
  return formatDateKey(addDays(parseDateKey(dateKey), days))
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

function startOfWeek(date: Date) {
  return addDays(date, -date.getDay())
}

function endOfWeek(date: Date) {
  return addDays(date, 6 - date.getDay())
}

function getDaySpan(startDate: Date, endDate: Date) {
  const millisecondsInDay = 1000 * 60 * 60 * 24

  return Math.round((endDate.getTime() - startDate.getTime()) / millisecondsInDay)
}

function taskStatusLabel(task: TaskItem) {
  if (task.completed) return 'Completed'

  const progress = getTaskProgress(task)

  if (progress.totalCount === 1) return 'Planned task'

  return `${progress.completedCount}/${progress.totalCount} subtasks done`
}

function taskTrailingLabel(task: TaskItem) {
  if (task.completed) return 'Done'

  return `${getTaskProgress(task).percent}%`
}
</script>

<template>
  <AppShell>
    <section class="flex flex-1 flex-col gap-6 pb-2 pt-3">
      <header class="pt-1 text-center">
        <h2 class="text-[2.1rem] font-semibold uppercase tracking-[0.08em] text-slate-900">
          Calendar
        </h2>
      </header>

      <div
        class="relative mx-auto flex w-full max-w-[14rem] items-center rounded-full bg-[#eef2ff] p-1 shadow-[0_18px_32px_-28px_rgba(15,23,42,0.28)]"
      >
        <span
          class="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow-sm transition-transform duration-300 ease-out"
          :class="calendarMode === 'week' ? 'translate-x-full' : 'translate-x-0'"
        />
        <button
          type="button"
          class="relative z-10 flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300"
          :class="
            calendarMode === 'month'
              ? 'text-blue-500'
              : 'text-slate-500 hover:text-slate-700'
          "
          @click="calendarMode = 'month'"
        >
          Month
        </button>
        <button
          type="button"
          class="relative z-10 flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300"
          :class="
            calendarMode === 'week'
              ? 'text-blue-500'
              : 'text-slate-500 hover:text-slate-700'
          "
          @click="calendarMode = 'week'"
        >
          Week
        </button>
      </div>

      <h3 class="text-center text-[2rem] font-semibold tracking-[-0.05em] text-slate-900">
        {{ monthLabel }}
      </h3>

      <Card class="rounded-[1.9rem] border-white/80 bg-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.18)]">
        <CardContent class="p-5">
          <div class="grid grid-cols-7 gap-2 text-center">
            <span
              v-for="day in DAY_LABELS"
              :key="day"
              class="text-[0.72rem] font-semibold uppercase tracking-[0.08em] text-blue-500"
            >
              {{ day }}
            </span>
          </div>

          <div class="mt-5 overflow-hidden">
            <Transition name="calendar-panel" mode="out-in">
              <div
                :key="calendarMode"
                class="grid grid-cols-7 gap-y-3"
                :class="calendarMode === 'month' ? 'min-h-[17.25rem]' : 'min-h-[4.75rem]'"
              >
                <button
                  v-for="cell in calendarCells"
                  :key="cell.dateKey"
                  type="button"
                  class="mx-auto flex h-12 w-10 flex-col items-center justify-center rounded-[1rem] transition-all duration-200"
                  :class="
                    cell.isSelected
                      ? 'bg-blue-500 text-white shadow-[0_18px_30px_-18px_rgba(59,130,246,0.95)]'
                      : cell.isCurrentMonth
                        ? 'text-slate-700 hover:bg-blue-50'
                        : 'text-slate-300 hover:bg-slate-100'
                  "
                  @click="selectDate(cell.dateKey)"
                >
                  <span
                    class="text-[0.98rem] font-semibold"
                    :class="!cell.isSelected && cell.isToday ? 'text-blue-500' : ''"
                  >
                    {{ cell.dayNumber }}
                  </span>
                  <span
                    v-if="cell.hasTasks"
                    class="mt-1 size-1.5 rounded-full"
                    :class="cell.isSelected ? 'bg-white' : 'bg-blue-500'"
                  />
                </button>
              </div>
            </Transition>
          </div>
        </CardContent>
      </Card>

      <section class="space-y-4">
        <div class="px-1">
          <h3 class="text-[2rem] font-semibold tracking-[-0.05em] text-slate-900">
            {{ selectedDateTitle }}
          </h3>
          <p class="mt-1 text-sm font-medium text-slate-400">
            {{ selectedDateLabel }}
          </p>
        </div>

        <div v-if="selectedDateTasks.length === 0">
          <Card class="rounded-[1.75rem] border-white/80 bg-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.16)]">
            <CardContent class="flex flex-col items-center px-6 py-10 text-center">
              <span class="flex size-14 items-center justify-center rounded-full bg-blue-50 text-blue-400">
                <CalendarDays class="size-6" />
              </span>
              <p class="mt-4 text-lg font-semibold tracking-[-0.03em] text-slate-800">
                No tasks scheduled
              </p>
              <p class="mt-2 max-w-[15rem] text-sm leading-6 text-slate-400">
                Select another day or create a task in the Tasks section.
              </p>
            </CardContent>
          </Card>
        </div>

        <div v-else class="space-y-3">
          <Card
            v-for="task in selectedDateTasks"
            :key="task.id"
            class="rounded-[1.65rem] border-white/80 bg-[#f4f6ff] shadow-[0_22px_48px_-36px_rgba(15,23,42,0.2)]"
          >
            <CardContent class="flex items-center gap-4 p-4">
              <span
                class="flex size-11 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_12px_24px_-20px_rgba(15,23,42,0.3)]"
                :class="task.completed ? 'text-blue-500' : 'text-slate-500'"
              >
                <Check v-if="task.completed" class="size-5 stroke-[2.8]" />
                <CircleDot v-else class="size-5" />
              </span>

              <div class="min-w-0 flex-1">
                <p class="truncate text-[1.02rem] font-semibold tracking-[-0.03em] text-slate-800">
                  {{ task.title }}
                </p>
                <p class="mt-1 text-sm text-slate-400">
                  {{ taskStatusLabel(task) }}
                </p>
              </div>

              <span
                class="shrink-0 text-sm font-semibold"
                :class="task.completed ? 'text-blue-500' : 'text-slate-400'"
              >
                {{ taskTrailingLabel(task) }}
              </span>
            </CardContent>
          </Card>
        </div>
      </section>
    </section>
  </AppShell>
</template>

<style scoped>
.calendar-panel-enter-active,
.calendar-panel-leave-active {
  transition:
    opacity 220ms ease,
    transform 220ms ease;
}

.calendar-panel-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.985);
}

.calendar-panel-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.985);
}
</style>
