<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  ArrowUpDown,
  Check,
  LoaderCircle,
  LoaderPinwheel,
  Pencil,
  Plus,
  Trash2,
  ChevronDown,
} from 'lucide-vue-next'
import {
  getTaskProgress,
  useTasksStore,
  type TaskItem,
} from '@/stores/tasks'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import TaskEditorDialog from '@/components/modal/TaskEditorDialog.vue'

type DialogMode = 'create' | 'edit'

type ActiveTaskMode =
  | 'created_desc'
  | 'created_asc'
  | 'assigned_asc'
  | 'assigned_desc'

const tasksStore = useTasksStore()
const { tasks, isLoading, errorMessage } = storeToRefs(tasksStore)
const route = useRoute()
const router = useRouter()

const dialogMode = computed<DialogMode | null>(() => {
  const modalQuery = route.query.modal

  if (modalQuery === 'create') return 'create'
  if (modalQuery === 'edit') return 'edit'

  return null
})
const isDeletingTask = ref(false)
const pendingSubtaskIds = ref<string[]>([])
const isCompletingTask = ref(false)
const isActiveSectionOpen = ref(true)
const isCompletedSectionOpen = ref(false)
const activeTaskSortMode = ref<ActiveTaskMode>('created_desc')

const activeTaskSortLabel = computed(() => {
  switch (activeTaskSortMode.value) {
    case 'created_desc':
      return 'Newest first'
    case 'created_asc':
      return 'Oldest first'
    case 'assigned_asc':
      return 'Planned: earliest first'
    case 'assigned_desc':
      return 'Planned: latest first'
  }
})



const activeTasks = computed(() => {
  const nextTasks = tasks.value.filter((task) => !task.completed)

  return nextTasks.sort((left, right) => {
    switch (activeTaskSortMode.value) {
      case 'created_desc':
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()

      case 'created_asc':
        return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()

      case 'assigned_asc':
        return commpareAssignedDate(left, right, 'asc')

      case 'assigned_desc':
        return commpareAssignedDate(left, right, 'desc')

    }
  })
})

const completedTasks = computed(() => {
  return tasks.value.filter((task) => task.completed)
})

const selectedTask = computed(() => {
  return tasks.value.find((task) => task.id === selectedTaskId.value) ?? null
})

const selectedTaskProgress = computed(() => {
  return selectedTask.value ? getTaskProgress(selectedTask.value) : null
})

const isDialogOpen = computed({
  get: () => dialogMode.value !== null,
  set: (nextOpen) => {
    if (!nextOpen) {
      closeDialog()
    }
  },
})

const selectedTaskId = computed(() => {
  const taskQuery = route.query.task

  return typeof taskQuery === 'string' ? taskQuery : null
})

function openCreateDialog() {
  void router.push({
    path: '/tasks',
    query: { modal: 'create' },
  })
}

function openEditDialog() {
  if (!selectedTask.value) return

  void router.push({
    path: '/tasks',
    query: {
      task: selectedTask.value.id,
      modal: 'edit'
    }
  })
}

function closeDialog() {
  const { modal, ...restQuery } = route.query

  void router.push({
    path: route.path,
    query: restQuery,
  })
}

function openTaskDetails(taskId: string) {
  router.push({ path: '/tasks', query: { task: taskId } })
}

function goBackToList() {
  void router.push({ path: '/tasks' })
}

function isSubtaskPending(subtaskId: string) {
  return pendingSubtaskIds.value.includes(subtaskId)
}

async function toggleSelectedSubtask(subtaskId: string) {
  if (!selectedTask.value || isSubtaskPending(subtaskId) || isCompletingTask.value) return

  pendingSubtaskIds.value = [...pendingSubtaskIds.value, subtaskId]

  try {
    await tasksStore.toggleSubtask(selectedTask.value.id, subtaskId)
  } catch {
  } finally {
    pendingSubtaskIds.value = pendingSubtaskIds.value.filter((id) => id !== subtaskId)
  }
}

async function markSelectedTaskComplete() {
  if (!selectedTask.value || isCompletingTask.value) return

  isCompletingTask.value = true

  try {
    await tasksStore.markTaskComplete(selectedTask.value.id)
  } catch {
  } finally {
    isCompletingTask.value = false
  }
}

async function deleteSelectedTask() {
  if (!selectedTask.value || isDeletingTask.value) return

  isDeletingTask.value = true

  try {
    await tasksStore.deleteTask(selectedTask.value.id)
    void router.replace({ path: '/tasks' })
  } finally {
    isDeletingTask.value = false
  }
}

function progressMessage(task: TaskItem) {
  const progress = getTaskProgress(task)

  if (progress.isComplete) return 'Everything is done. Great work.'
  if (progress.percent >= 50) return 'Keep going! You are halfway there.'
  if (progress.percent > 0) return 'Good start. Keep the momentum going.'

  return 'Start with the first small step.'
}

function commpareAssignedDate(left: TaskItem, right: TaskItem, direction: 'asc' | 'desc') {
  const leftDate = left.assignedDate
  const rightDate = right.assignedDate

  if (!leftDate && !rightDate) return 0
  if (!leftDate) return 1
  if (!rightDate) return -1

  return direction === 'asc'
    ? leftDate.localeCompare(rightDate)
    : rightDate.localeCompare(leftDate)
}

</script>

<template>
  <AppShell>
    <section class="flex flex-1 flex-col gap-6 pb-2 pt-3">
      <template v-if="!selectedTask">
        <header class="pt-1 text-center">
          <h2 class="text-[2.1rem] font-semibold uppercase tracking-[0.08em] text-slate-900">
            Tasks
          </h2>
        </header>
        <div v-if="isLoading" class="flex flex-1 items-center justify-center">
          <div class="flex items-center gap-3 text-slate-500">
            <LoaderPinwheel class="size-5 animate-spin text-blue-500" />
            <p>Loading tasks...</p>
          </div>
        </div>
        <div v-else-if="errorMessage" class="flex flex-1 items-center justify-center px-6 text-center">
          <p class="text-red-500">{{ errorMessage }}</p>
        </div>

        <div v-else-if="tasks.length === 0" class="flex flex-1 items-center">
          <div class="flex w-full flex-1 flex-col items-center justify-center px-6 text-center">
            <div
              class="flex size-20 items-center justify-center rounded-full border-[3px] border-blue-400 text-blue-500">
              <Check class="size-10 stroke-[2.4]" />
            </div>
            <p class="mt-8 max-w-[15.5rem] text-[1.1rem] font-medium leading-8 text-slate-600">
              No tasks yet. Start your journey by creating your first task.
            </p>
            <Button type="button"
              class="mt-16 h-14 rounded-[1.1rem] bg-blue-500 px-8 text-base font-semibold shadow-[0_18px_32px_-18px_rgba(59,130,246,0.95)] hover:bg-blue-500/90"
              @click="openCreateDialog">
              <Plus class="size-4" />
              Add New Task
            </Button>
          </div>
        </div>

        <div v-else class="flex flex-1 flex-col gap-4">
          <div class="max-h-[64vh] space-y-4 overflow-y-auto pr-1">
            <div class="space-y-3">
              <Card
                class="rounded-[1.6rem] py-3 border-slate-200/80 bg-white shadow-[0_18px_40px_-32px_rgba(15,23,42,0.32)]">
                <CardContent class="flex items-center justify-between gap-3 p-4">
                  <button type="button" class="flex min-w-0 flex-1 items-center justify-between text-left"
                    @click="isActiveSectionOpen = !isActiveSectionOpen">
                    <span class="text-[1.12rem] font-semibold tracking-[-0.03em] text-slate-800">
                      Active Tasks
                    </span>

                    <span class="ml-3 flex items-center gap-2 text-slate-500">
                      <span class="text-sm font-semibold">{{ activeTasks.length }}</span>
                      <ChevronDown class="size-4 transition-transform duration-300"
                        :class="isActiveSectionOpen ? 'rotate-0' : '-rotate-90'" />
                    </span>
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button type="button" variant="outline"
                        class="h-9 rounded-full border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
                        :title="activeTaskSortLabel">
                        <ArrowUpDown class="mr-2 size-4 shrink-0 text-slate-500" />
                        Sort
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" class="w-56">
                      <DropdownMenuLabel>Sort active tasks</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <DropdownMenuRadioGroup v-model="activeTaskSortMode">
                        <DropdownMenuRadioItem value="created_desc">
                          Newest first
                        </DropdownMenuRadioItem>

                        <DropdownMenuRadioItem value="created_asc">
                          Oldest first
                        </DropdownMenuRadioItem>

                        <DropdownMenuRadioItem value="assigned_asc">
                          Planned: earliest first
                        </DropdownMenuRadioItem>

                        <DropdownMenuRadioItem value="assigned_desc">
                          Planned: latest first
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>

              <div class="grid transition-all duration-300 ease-out"
                :class="isActiveSectionOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
                <div class="overflow-hidden">
                  <p v-if="activeTasks.length === 0" class="px-2 py-3 text-sm text-slate-400">
                    No active tasks right now.
                  </p>

                  <div v-else class="space-y-4 pt-1">
                    <button v-for="task in activeTasks" :key="task.id" type="button" class="w-full text-left"
                      @click="openTaskDetails(task.id)">
                      <Card
                        class="rounded-[1.6rem] border-slate-200/80 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.32)] transition-transform duration-200 hover:-translate-y-0.5"
                        :class="task.completed ? 'bg-[#eef2ff]' : 'bg-white'">
                        <CardContent class="p-4">
                          <div class="flex items-start justify-between gap-3">
                            <h3 class="min-w-0 flex-1 text-[1.12rem] font-semibold tracking-[-0.03em]"
                              :class="task.completed ? 'text-slate-500' : 'text-slate-800'">
                              {{ task.title }}
                            </h3>
                            <div class="flex items-center gap-2">
                              <span class="text-sm font-semibold"
                                :class="task.completed ? 'text-slate-500' : 'text-blue-500'">
                                {{ getTaskProgress(task).completedCount }}/{{ getTaskProgress(task).totalCount }}
                              </span>
                              <span v-if="task.completed"
                                class="flex size-6 items-center justify-center rounded-full bg-blue-500 text-white">
                                <Check class="size-3.5 stroke-[3]" />
                              </span>
                            </div>
                          </div>
                          <Progress :model-value="getTaskProgress(task).percent" class="mt-5 h-2"
                            :indicator-class="task.completed ? 'bg-slate-400' : 'bg-blue-500'" />
                        </CardContent>
                      </Card>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <button type="button" class="w-full text-left" @click="isCompletedSectionOpen = !isCompletedSectionOpen">
                <Card
                  class="rounded-[1.6rem] py-3 border-slate-200/80 bg-[#eef2ff] shadow-[0_18px_40px_-32px_rgba(15,23,42,0.32)]">
                  <CardContent class="flex items-center justify-between p-4">
                    <span class="text-[1.12rem] font-semibold tracking-[-0.03em] text-slate-800">
                      Completed Tasks
                    </span>

                    <span class="flex items-center gap-2 text-slate-500">
                      <span class="text-sm font-semibold">{{ completedTasks.length }}</span>
                      <ChevronDown class="size-4 transition-transform duration-300"
                        :class="isCompletedSectionOpen ? 'rotate-0' : '-rotate-90'" />
                    </span>
                  </CardContent>
                </Card>
              </button>

              <div class="grid transition-all duration-300 ease-out"
                :class="isCompletedSectionOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
                <div class="overflow-hidden">
                  <p v-if="completedTasks.length === 0" class="px-2 py-3 text-sm text-slate-400">
                    No completed tasks yet.
                  </p>

                  <div v-else class="space-y-4 pt-1">
                    <button v-for="task in completedTasks" :key="task.id" type="button" class="w-full text-left"
                      @click="openTaskDetails(task.id)">
                      <Card
                        class="rounded-[1.6rem] border-slate-200/80 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.32)] transition-transform duration-200 hover:-translate-y-0.5"
                        :class="task.completed ? 'bg-[#eef2ff]' : 'bg-white'">
                        <CardContent class="p-4">
                          <div class="flex items-start justify-between gap-3">
                            <h3 class="min-w-0 flex-1 text-[1.12rem] font-semibold tracking-[-0.03em]"
                              :class="task.completed ? 'text-slate-500' : 'text-slate-800'">
                              {{ task.title }}
                            </h3>
                            <div class="flex items-center gap-2">
                              <span class="text-sm font-semibold"
                                :class="task.completed ? 'text-slate-500' : 'text-blue-500'">
                                {{ getTaskProgress(task).completedCount }}/{{ getTaskProgress(task).totalCount }}
                              </span>
                              <span v-if="task.completed"
                                class="flex size-6 items-center justify-center rounded-full bg-blue-500 text-white">
                                <Check class="size-3.5 stroke-[3]" />
                              </span>
                            </div>
                          </div>
                          <Progress :model-value="getTaskProgress(task).percent" class="mt-5 h-2"
                            :indicator-class="task.completed ? 'bg-slate-400' : 'bg-blue-500'" />
                        </CardContent>
                      </Card>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-auto flex justify-center pt-4">
            <Button type="button"
              class="h-14 rounded-[1.15rem] bg-blue-500 px-9 text-base font-semibold shadow-[0_18px_32px_-18px_rgba(59,130,246,0.95)] hover:bg-blue-500/90"
              @click="openCreateDialog">
              Add New Task
            </Button>
          </div>
        </div>
      </template>

      <template v-else>
        <header class="flex items-center justify-between gap-3 pt-3">
          <Button type="button" variant="ghost" size="icon-lg"
            class="rounded-full  text-blue-500 bg-[#F1F6FF] hover:bg-blue-50 hover:text-blue-600" @click="goBackToList">
            <ArrowLeft class="!size-6" />
          </Button>

          <h2 class="text-2xl font-semibold  text-slate-900">
            Task Details
          </h2>

          <Button type="button" variant="ghost" size="icon-lg"
            class="rounded-full text-blue-500 bg-[#F1F6FF] hover:bg-blue-50 hover:text-blue-600"
            @click="openEditDialog">
            <Pencil class="!size-6" />
          </Button>
        </header>

        <Card class="rounded-[1.75rem] border-white/80 bg-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.18)]">
          <CardContent class="space-y-3 p-5">
            <h3 class="text-[2rem] font-semibold tracking-[-0.05em] text-slate-900">
              {{ selectedTask.title }}
            </h3>
            <p class="text-[1.02rem] leading-8 text-slate-400">
              {{ selectedTask.description || 'No description yet.' }}
            </p>
          </CardContent>
        </Card>

        <Card class="rounded-[1.75rem] border-white/80 bg-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.18)]">
          <CardContent class="p-5">
            <h3 class="text-[1.25rem] font-semibold text-slate-900">
              Subtask :
            </h3>

            <div class="mt-4 space-y-4">
              <div v-for="subtask in selectedTask.subtasks" :key="subtask.id" class="flex items-center gap-3">
                <div class="flex size-5 items-center justify-center">
                  <LoaderCircle v-if="isSubtaskPending(subtask.id)" class="size-4 animate-spin text-blue-500" />
                  <Checkbox v-else :model-value="subtask.completed" :disabled="isCompletingTask"
                    @update:model-value="toggleSelectedSubtask(subtask.id)" />
                </div>
                <button type="button"
                  class="min-w-0 flex-1 text-left text-[1.02rem] transition-colors disabled:cursor-not-allowed" :class="[
                    subtask.completed ? 'text-slate-400 line-through' : 'text-slate-700',
                    isSubtaskPending(subtask.id) ? 'opacity-60' : '',
                  ]" :disabled="isCompletingTask || isSubtaskPending(subtask.id)" @click="toggleSelectedSubtask(subtask.id)">
                  {{ subtask.title }}
                </button>
              </div>

              <p v-if="selectedTask.subtasks.length === 0" class="text-sm text-slate-400">
                No subtasks yet.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card class="rounded-[1.75rem] border-white/80 bg-white shadow-[0_24px_60px_-34px_rgba(15,23,42,0.18)]">
          <CardContent class="p-5">
            <div class="flex items-center justify-between gap-3">
              <p class="text-sm font-semibold text-slate-400">Progress:</p>
              <span class="text-lg font-semibold text-blue-500">
                {{ selectedTaskProgress?.completedCount }}/{{ selectedTaskProgress?.totalCount }}
              </span>
            </div>

            <Progress :model-value="selectedTaskProgress?.percent ?? 0" class="mt-5 h-2.5" />

            <p class="mt-5 text-center text-sm text-slate-400">
              {{ progressMessage(selectedTask) }}
            </p>
          </CardContent>
        </Card>

        <Button type="button"
          class="h-14 rounded-[1.2rem] bg-blue-500 text-base font-semibold shadow-[0_18px_32px_-18px_rgba(59,130,246,0.95)] hover:bg-blue-500/90"
          :disabled="selectedTask.completed || isCompletingTask" @click="markSelectedTaskComplete">
          <LoaderCircle v-if="isCompletingTask" class="size-4 animate-spin" />
          {{ selectedTask.completed ? 'Task Completed' : isCompletingTask ? 'Completing...' : 'Mark as Complete' }}
        </Button>

        <Button type="button" variant="outline"
          class="h-14 rounded-[1.2rem] border-red-200 bg-white text-base font-semibold text-red-500 shadow-[0_16px_28px_-24px_rgba(239,68,68,0.45)] hover:bg-red-50 hover:text-red-600"
          :disabled="isDeletingTask" @click="deleteSelectedTask">
          <LoaderCircle v-if="isDeletingTask" class="size-4 animate-spin" />
          <Trash2 v-else class="size-4" />
          {{ isDeletingTask ? 'Deleting...' : 'Delete Task' }}
        </Button>
      </template>
      <TaskEditorDialog :open="isDialogOpen" :mode="dialogMode ?? 'create'" :task="selectedTask"
        @update:open="isDialogOpen = $event" @saved='tasksStore.fetchTasks()' />
    </section>
  </AppShell>
</template>
