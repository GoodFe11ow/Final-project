<script setup lang="ts">
import AppShell from '@/components/layout/AppShell.vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ClipboardList, Clock3, Play, Plus } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { getTaskProgress, useTasksStore } from '@/stores/tasks'

type QuickAction = {
  label: string
  icon: typeof Clock3
}

const router = useRouter()
const authStore = useAuthStore()
const tasksStore = useTasksStore()
const { user } = storeToRefs(authStore)
const { tasks } = storeToRefs(tasksStore)
const hasSeenHomeBefore = ref(false)

const todayLabel = computed(() =>
  new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(new Date()),
)
const userName = computed(() => user.value?.name ?? 'User')
const welcomeHeading = computed(() =>
  hasSeenHomeBefore.value ? 'Welcome back,' : 'Welcome,',
)

function getTodayKey() {
  return new Date().toISOString().slice(0, 10)
}

function getTaskPriorityGroup(task: { assignedDate: string; completed: boolean}) {
  if (task.completed) return 4

  if (!task.assignedDate) return 3

  const  todayKey = getTodayKey()

  if(task.assignedDate < todayKey) return 0
  if(task.assignedDate === todayKey) return 1

  return 2
}

const currentTasks = computed(() => {
  return [...tasks.value]
    .filter((task) => !task.completed)
    .sort((left, right) => {
      const leftGroup = getTaskPriorityGroup(left)
      const rightGroup = getTaskPriorityGroup(right)

      if (leftGroup !== rightGroup) {
        return leftGroup - rightGroup
      }

      if ( leftGroup === 0 || leftGroup === 2) {
        return left.assignedDate.localeCompare(right.assignedDate)
      }

      return 0
    })
    .slice(0, 4)
    .map((task) => {
      const progress = getTaskProgress(task)

      return {
        id: task.id,
        title: task.title,
        statusLabel: `${progress.completedCount}/${progress.totalCount}`,
        completed: progress.isComplete,
      }
    })
})

const quickActions: QuickAction[] = [
  {
    label: 'Timer Settings',
    icon: Clock3,
  },
  {
    label: 'Change Task',
    icon: ClipboardList,
  },
]

function openQuickFocusSession() {
  router.push({
    path: '/focus',
    query: { autostart: '1' },
  })
}

function handleQuickAction(label: QuickAction['label']) {
  if (label === 'Timer Settings') {
    router.push({
      path: '/focus',
      query: { modal: 'focus-duration' },
    })
    return
  }

  router.push({
    path: '/focus',
    query: { modal: 'task-picker' },
  })
}

function openCreateTaskModal() {
  router.push({
    path: '/tasks',
    query: { modal: 'create' },
  })
}

function getHomeSeenStorageKey(userId: string) {
  return `productivity-home-seen:${userId}`
}

watch(
  () => user.value?.id ?? '',
  (userId) => {
    if (!userId) {
      hasSeenHomeBefore.value = false
      return
    }

    const storageKey = getHomeSeenStorageKey(userId)
    const hasSeen = localStorage.getItem(storageKey) === '1'

    hasSeenHomeBefore.value = hasSeen

    if (!hasSeen) {
      localStorage.setItem(storageKey, '1')
    }
  },
  { immediate: true },
)
</script>

<template>
  <AppShell>
    <section class="flex flex-1 flex-col gap-5 pb-2">
      <div class="space-y-3 pt-1 text-center">
        <div
          class="text-[2.05rem] font-semibold uppercase tracking-[0.2em] text-slate-900"
        >
          Home
        </div>
        <p
          class="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-400"
        >
          {{ todayLabel }}
        </p>
        <h2
          class="mx-auto max-w-[16rem] text-[2rem] font-light leading-tight tracking-[-0.05em] text-slate-800 sm:max-w-none"
        >
          {{ welcomeHeading }}
          <span class="font-normal text-blue-400">{{ userName }}!</span>
        </h2>
      </div>

      <Card
        class="overflow-hidden rounded-[2rem] border-slate-200/80 bg-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.28)]"
      >
        <CardContent class="p-0">
          <div class="flex items-center justify-between px-5 py-4">
            <p
              class="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500"
            >
              Current Tasks
            </p>
            <Button
              type="button"
              size="icon-sm"
              class="size-9 rounded-xl bg-blue-500 p-0 text-white shadow-[0_12px_24px_-18px_rgba(59,130,246,0.95)] hover:bg-blue-500/90"
              @click="openCreateTaskModal"
            >
              <Plus class="size-4" />
            </Button>
          </div>

          <div v-if="currentTasks.length > 0" class="divide-y divide-slate-100">
            <article
              v-for="task in currentTasks"
              :key="task.id"
              class="flex items-center gap-3 px-5 py-4"
            >
              <div class="min-w-0 flex-1">
                <h3 class="truncate text-[1.08rem] font-medium tracking-[-0.02em] text-slate-800">
                  {{ task.title }}
                </h3>
              </div>

              <span
                class="rounded-full px-3 py-1 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
                :class="
                  task.completed
                    ? 'bg-emerald-50 text-emerald-500'
                    : 'bg-sky-50 text-sky-500'
                "
              >
                {{ task.statusLabel }}
              </span>
            </article>
          </div>

          <div v-else class="px-5 py-6 text-sm text-slate-400">
            No active tasks yet.
          </div>
        </CardContent>
      </Card>

      <Card
        class="rounded-[2rem] border-slate-200/80 bg-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.26)]"
      >
        <CardContent class="space-y-4 p-5">
          <Button
            type="button"
            class="h-14 w-full rounded-[1.2rem] bg-blue-500 px-5 text-sm font-semibold uppercase tracking-[0.08em] text-white shadow-[0_18px_30px_-18px_rgba(59,130,246,0.95)] hover:bg-blue-500/90"
            @click="openQuickFocusSession"
          >
            <span
              class="mr-2 flex size-7 items-center justify-center rounded-full bg-white text-blue-500 shadow-sm"
            >
              <Play class="size-4 fill-current" />
            </span>
            Quick Focus Session
          </Button>

          <div class="grid grid-cols-2 gap-3">
            <Button
              v-for="action in quickActions"
              :key="action.label"
              type="button"
              variant="ghost"
              class="flex h-auto min-h-24 flex-col items-center justify-center gap-2 rounded-[1.35rem] bg-slate-50 px-3 py-4 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] hover:bg-slate-100"
              @click="handleQuickAction(action.label)"
            >
              <component :is="action.icon" class="size-5 text-blue-500" />
              <span class="text-center text-sm font-medium leading-snug">
                {{ action.label }}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  </AppShell>
</template>
