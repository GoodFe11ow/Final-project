<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import AppShell from '@/components/layout/AppShell.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Circle,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-vue-next'
import {
  getTaskProgress,
  useTasksStore,
  type TaskDraftSubtask,
  type TaskItem,
} from '@/stores/tasks'

type DialogMode = 'create' | 'edit'

type TaskFormState = {
  title: string
  description: string
  assignedDate: string
  subtasks: TaskDraftSubtask[]
}

const tasksStore = useTasksStore()
const { tasks } = storeToRefs(tasksStore)

const selectedTaskId = ref<string | null>(null)
const dialogMode = ref<DialogMode | null>(null)
const taskForm = reactive<TaskFormState>(createEmptyTaskForm())

const sortedTasks = computed(() => {
  return [...tasks.value].sort((left, right) => Number(left.completed) - Number(right.completed))
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
      dialogMode.value = null
    }
  },
})

const isCreateMode = computed(() => dialogMode.value === 'create')

const dialogTitle = computed(() => {
  return isCreateMode.value ? 'Create Task' : 'Edit Task'
})

const submitLabel = computed(() => {
  return isCreateMode.value ? 'Create Task' : 'Confirm Changes'
})

const canSubmitForm = computed(() => taskForm.title.trim().length > 0)

function createDraftSubtaskId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `draft-subtask-${crypto.randomUUID()}`
  }

  return `draft-subtask-${Math.random().toString(36).slice(2, 10)}`
}

function createEmptyTaskForm(): TaskFormState {
  return {
    title: '',
    description: '',
    assignedDate: getDefaultAssignedDate(),
    subtasks: [],
  }
}

function getDefaultAssignedDate() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  return tomorrow.toISOString().slice(0, 10)
}

function resetTaskForm() {
  taskForm.title = ''
  taskForm.description = ''
  taskForm.assignedDate = getDefaultAssignedDate()
  taskForm.subtasks = []
}

function fillTaskForm(task: TaskItem) {
  taskForm.title = task.title
  taskForm.description = task.description
  taskForm.assignedDate = task.assignedDate
  taskForm.subtasks = task.subtasks.map((subtask) => ({
    id: subtask.id,
    title: subtask.title,
  }))
}

function openCreateDialog() {
  resetTaskForm()
  dialogMode.value = 'create'
}

function openEditDialog() {
  if (!selectedTask.value) return

  fillTaskForm(selectedTask.value)
  dialogMode.value = 'edit'
}

function closeDialog() {
  dialogMode.value = null
}

function addSubtaskField() {
  taskForm.subtasks.push({
    id: createDraftSubtaskId(),
    title: '',
  })
}

function removeSubtaskField(index: number) {
  taskForm.subtasks.splice(index, 1)
}

function openTaskDetails(taskId: string) {
  selectedTaskId.value = taskId
}

function goBackToList() {
  selectedTaskId.value = null
}

function saveTask() {
  if (!canSubmitForm.value) return

  const payload = {
    title: taskForm.title,
    description: taskForm.description,
    assignedDate: taskForm.assignedDate,
    subtasks: taskForm.subtasks,
  }

  if (isCreateMode.value) {
    tasksStore.createTask(payload)
  } else if (selectedTask.value) {
    tasksStore.updateTask(selectedTask.value.id, payload)
  }

  closeDialog()
}

function toggleSelectedSubtask(subtaskId: string) {
  if (!selectedTask.value) return

  tasksStore.toggleSubtask(selectedTask.value.id, subtaskId)
}

function markSelectedTaskComplete() {
  if (!selectedTask.value) return

  tasksStore.markTaskComplete(selectedTask.value.id)
}

function deleteSelectedTask() {
  if (!selectedTask.value) return

  tasksStore.deleteTask(selectedTask.value.id)
  selectedTaskId.value = null
}

function progressMessage(task: TaskItem) {
  const progress = getTaskProgress(task)

  if (progress.isComplete) return 'Everything is done. Great work.'
  if (progress.percent >= 50) return 'Keep going! You are halfway there.'
  if (progress.percent > 0) return 'Good start. Keep the momentum going.'

  return 'Start with the first small step.'
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

        <div v-if="sortedTasks.length === 0" class="flex flex-1 items-center">
          <div class="flex w-full flex-1 flex-col items-center justify-center px-6 text-center">
            <div
              class="flex size-20 items-center justify-center rounded-full border-[3px] border-blue-400 text-blue-500"
            >
              <Check class="size-10 stroke-[2.4]" />
            </div>
            <p class="mt-8 max-w-[15.5rem] text-[1.1rem] font-medium leading-8 text-slate-600">
              No tasks yet. Start your journey by creating your first task.
            </p>
            <Button
              type="button"
              class="mt-16 h-14 rounded-[1.1rem] bg-blue-500 px-8 text-base font-semibold shadow-[0_18px_32px_-18px_rgba(59,130,246,0.95)] hover:bg-blue-500/90"
              @click="openCreateDialog"
            >
              <Plus class="size-4" />
              Add New Task
            </Button>
          </div>
        </div>

        <div v-else class="flex flex-1 flex-col gap-4">
          <button
            v-for="task in sortedTasks"
            :key="task.id"
            type="button"
            class="text-left"
            @click="openTaskDetails(task.id)"
          >
            <Card
              class="rounded-[1.6rem] border-slate-200/80 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.32)] transition-transform duration-200 hover:-translate-y-0.5"
              :class="task.completed ? 'bg-[#eef2ff]' : 'bg-white'"
            >
              <CardContent class="p-4">
                <div class="flex items-start justify-between gap-3">
                  <h3
                    class="min-w-0 flex-1 text-[1.12rem] font-semibold tracking-[-0.03em]"
                    :class="task.completed ? 'text-slate-500' : 'text-slate-800'"
                  >
                    {{ task.title }}
                  </h3>

                  <div class="flex items-center gap-2">
                    <span
                      class="text-sm font-semibold"
                      :class="task.completed ? 'text-slate-500' : 'text-blue-500'"
                    >
                      {{ getTaskProgress(task).completedCount }}/{{ getTaskProgress(task).totalCount }}
                    </span>
                    <span
                      v-if="task.completed"
                      class="flex size-6 items-center justify-center rounded-full bg-blue-500 text-white"
                    >
                      <Check class="size-3.5 stroke-[3]" />
                    </span>
                  </div>
                </div>

                <Progress
                  :model-value="getTaskProgress(task).percent"
                  class="mt-5 h-2"
                  :indicator-class="task.completed ? 'bg-slate-400' : 'bg-blue-500'"
                />
              </CardContent>
            </Card>
          </button>

          <div class="mt-auto flex justify-center pt-4">
            <Button
              type="button"
              class="h-14 rounded-[1.15rem] bg-blue-500 px-9 text-base font-semibold shadow-[0_18px_32px_-18px_rgba(59,130,246,0.95)] hover:bg-blue-500/90"
              @click="openCreateDialog"
            >
              Add New Task
            </Button>
          </div>
        </div>
      </template>

      <template v-else>
        <header class="flex items-center justify-between gap-3 pt-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            class="rounded-full text-blue-500 hover:bg-blue-50 hover:text-blue-600"
            @click="goBackToList"
          >
            <ArrowLeft class="size-5" />
          </Button>

          <h2 class="text-lg font-semibold tracking-[-0.02em] text-slate-900">
            Task Details
          </h2>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            class="rounded-full text-blue-500 hover:bg-blue-50 hover:text-blue-600"
            @click="openEditDialog"
          >
            <Pencil class="size-4" />
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
              <div
                v-for="subtask in selectedTask.subtasks"
                :key="subtask.id"
                class="flex items-center gap-3"
              >
                <Checkbox
                  :model-value="subtask.completed"
                  @update:model-value="toggleSelectedSubtask(subtask.id)"
                />
                <span
                  class="text-[1.02rem]"
                  :class="
                    subtask.completed
                      ? 'text-slate-400 line-through'
                      : 'text-slate-700'
                  "
                >
                  {{ subtask.title }}
                </span>
              </div>

              <p
                v-if="selectedTask.subtasks.length === 0"
                class="text-sm text-slate-400"
              >
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

            <Progress
              :model-value="selectedTaskProgress?.percent ?? 0"
              class="mt-5 h-2.5"
            />

            <p class="mt-5 text-center text-sm text-slate-400">
              {{ progressMessage(selectedTask) }}
            </p>
          </CardContent>
        </Card>

        <Button
          type="button"
          class="h-14 rounded-[1.2rem] bg-blue-500 text-base font-semibold shadow-[0_18px_32px_-18px_rgba(59,130,246,0.95)] hover:bg-blue-500/90"
          :disabled="selectedTask.completed"
          @click="markSelectedTaskComplete"
        >
          {{ selectedTask.completed ? 'Task Completed' : 'Mark as Complete' }}
        </Button>

        <Button
          type="button"
          variant="outline"
          class="h-14 rounded-[1.2rem] border-red-200 bg-white text-base font-semibold text-red-500 shadow-[0_16px_28px_-24px_rgba(239,68,68,0.45)] hover:bg-red-50 hover:text-red-600"
          @click="deleteSelectedTask"
        >
          <Trash2 class="size-4" />
          Delete Task
        </Button>
      </template>

      <Dialog v-model:open="isDialogOpen">
        <DialogContent class="max-w-[23rem] overflow-hidden rounded-[1.9rem] border-white/80 p-0">
          <form class="bg-white" @submit.prevent="saveTask">
            <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                class="rounded-full text-slate-500 hover:bg-slate-100"
                @click="closeDialog"
              >
                <X class="size-5" />
              </Button>

              <DialogTitle class="text-xl font-semibold tracking-[-0.03em]">
                {{ dialogTitle }}
              </DialogTitle>

              <Button
                type="submit"
                variant="ghost"
                class="px-0 text-sm font-semibold text-blue-500 hover:bg-transparent hover:text-blue-600"
                :disabled="!canSubmitForm"
              >
                Save
              </Button>
            </div>

            <div class="space-y-5 px-5 py-5">
              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-500" for="task-title">
                  Task name
                </label>
                <Input
                  id="task-title"
                  v-model="taskForm.title"
                  type="text"
                  placeholder="Enter task name"
                  class="h-12 rounded-xl bg-[#f4f6ff] text-base shadow-none"
                />
              </div>

              <div class="space-y-2">
                <label class="text-sm font-medium text-slate-500" for="task-description">
                  Description
                </label>
                <textarea
                  id="task-description"
                  v-model="taskForm.description"
                  rows="4"
                  placeholder="Enter description"
                  class="flex w-full resize-none rounded-xl border border-input bg-[#f4f6ff] px-4 py-3 text-base shadow-none outline-none transition-colors placeholder:text-slate-300 focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div class="space-y-3">
                <p class="text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Subtask
                </p>

                <div v-if="taskForm.subtasks.length > 0" class="space-y-3">
                  <div
                    v-for="(subtask, index) in taskForm.subtasks"
                    :key="subtask.id ?? `subtask-${index}`"
                    class="flex items-center gap-3 rounded-xl bg-[#f4f6ff] px-3 py-2.5 transition-shadow"
                  >
                    <span class="flex shrink-0 items-center text-slate-300">
                      <Circle class="size-4" />
                    </span>
                    <Input
                      v-model="subtask.title"
                      type="text"
                      placeholder="Write subtask"
                      class="h-10 border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      class="shrink-0 rounded-full text-slate-400 hover:bg-white hover:text-red-500"
                      aria-label="Delete subtask"
                      @click="removeSubtaskField(index)"
                    >
                      <X class="size-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  class="h-12 w-full rounded-xl border-blue-200 text-base font-medium text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                  @click="addSubtaskField"
                >
                  <Plus class="size-4" />
                  Add subtask
                </Button>
              </div>

              <div class="flex items-center gap-4 rounded-[1.25rem] bg-[#f4f6ff] px-4 py-4">
                <span class="flex size-10 items-center justify-center rounded-full bg-white text-slate-500">
                  <CalendarDays class="size-5" />
                </span>

                <div class="min-w-0 flex-1">
                  <p class="text-sm font-semibold tracking-[-0.02em] text-slate-700">
                    Scheduled for
                  </p>
                </div>

                <Input
                  id="task-assigned-date"
                  v-model="taskForm.assignedDate"
                  type="date"
                  class="h-11 w-[10rem] rounded-xl border-white bg-white px-3 text-sm font-medium text-slate-700 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.28)] focus-visible:ring-1"
                />
              </div>

              <Button
                type="submit"
                class="mt-2 h-14 w-full rounded-[1.2rem] bg-blue-500 text-base font-semibold shadow-[0_18px_32px_-18px_rgba(59,130,246,0.95)] hover:bg-blue-500/90"
                :disabled="!canSubmitForm"
              >
                {{ submitLabel }}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  </AppShell>
</template>
