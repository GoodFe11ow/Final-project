<script setup lang="ts">
import { reactive, computed, ref, watch} from 'vue';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { CalendarDays, Circle, Plus, RefreshCw, X } from 'lucide-vue-next';
import { useTasksStore, type TaskDraftSubtask, type TaskItem } from '@/stores/tasks';

type DialogMode = 'create' | 'edit'

type TaskFormState = {
  title: string
  description: string
  assignedDate: string
  subtasks: TaskDraftSubtask[]
}

const props = withDefaults(defineProps<{
    open: boolean
    mode: DialogMode
    task?: TaskItem | null
}>(), {
    task: null
})

const emit = defineEmits<{
    'update:open': [value: boolean]
    saved: []
}>()

const taskForm = reactive<TaskFormState>(createEmptyTaskForm())
const isSavingTask = ref(false)
const tasksStore = useTasksStore()

const isCreateMode = computed(() => props.mode === 'create')

const saveButtonLabel = computed(() => {
    if (isSavingTask.value) {
        return isCreateMode.value ? 'Creating...' : 'Saving...'
    }

    return submitLabel.value
})

const dialogTitle = computed(() => {
    return isCreateMode.value ? 'Create Task' : 'Edit Task'
})

const submitLabel = computed(() => {
    return isCreateMode.value ? 'Create Task' : 'Confirm Changes'
})

const canSubmitForm = computed(() => taskForm.title.trim().length > 0)

const isDialogOpen = computed({
    get: () => props.open,
    set: (nextOpen) => {
        emit('update:open', nextOpen)
    },
})

function closeDialog() {
    emit('update:open', false)
}

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

function addSubtaskField() {
    taskForm.subtasks.push({
        id: createDraftSubtaskId(),
        title: '',
    })
}

function removeSubtaskField(index: number) {
    taskForm.subtasks.splice(index, 1)
}

async function saveTask() {
    if (!canSubmitForm.value || isSavingTask.value) return

    const payload = {
        title: taskForm.title,
        description: taskForm.description,
        assignedDate: taskForm.assignedDate,
        subtasks: taskForm.subtasks,
    }
    isSavingTask.value = true

    try {
        if (isCreateMode.value) {
            await tasksStore.createTask(payload)
            emit('saved')
            closeDialog()
            return
        }

        if (props.task) {
            await tasksStore.updateTask(props.task.id, payload)
            emit('saved')
            closeDialog()
        }
    } finally {
        isSavingTask.value = false
    }
}

watch(
    () => [props.open, props.mode, props.task?.id] as const,
    ([open, mode]) => {
        if(!open) return

        if(mode === 'create') {
            resetTaskForm()
            return
        }

        if(mode === 'edit' && props.task) {
            fillTaskForm(props.task)
        }
    },
    { immediate: true }
)
</script>

<template>
    <Dialog v-model:open="isDialogOpen">
        <DialogContent
            class="flex max-h-[85vh] max-w-[23rem] flex-col gap-0 overflow-hidden rounded-[1.9rem] border-white/80 p-0">
            <form class="flex min-h-0 flex-1 flex-col bg-white" @submit.prevent="saveTask">
                <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <Button type="button" variant="ghost" size="icon-sm"
                        class="rounded-full text-slate-500 hover:bg-slate-100" @click="closeDialog">
                        <X class="size-5" />
                    </Button>

                    <DialogTitle class="text-xl font-semibold tracking-[-0.03em]">
                        {{ dialogTitle }}
                    </DialogTitle>

                    <div class="size-8" aria-hidden="true" />
                </div>

                <div class="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
                    <div class="space-y-2">
                        <label class="text-sm font-medium text-slate-500" for="task-title">
                            Task name
                        </label>
                        <Input id="task-title" v-model="taskForm.title" type="text" placeholder="Enter task name"
                            class="h-12 rounded-xl bg-[#f4f6ff] text-base shadow-none" />
                    </div>

                    <div class="space-y-2">
                        <label class="text-sm font-medium text-slate-500" for="task-description">
                            Description
                        </label>
                        <textarea id="task-description" v-model="taskForm.description" rows="4"
                            placeholder="Enter description"
                            class="flex w-full resize-none rounded-xl border border-input bg-[#f4f6ff] px-4 py-3 text-base shadow-none outline-none transition-colors placeholder:text-slate-300 focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>

                    <div class="space-y-3">
                        <p class="text-[0.8rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            Subtask
                        </p>

                        <div v-if="taskForm.subtasks.length > 0" class="space-y-3">
                            <div v-for="(subtask, index) in taskForm.subtasks" :key="subtask.id ?? `subtask-${index}`"
                                class="flex items-center gap-3 rounded-xl bg-[#f4f6ff] px-3 py-2.5 transition-shadow">
                                <span class="flex shrink-0 items-center text-slate-300">
                                    <Circle class="size-4" />
                                </span>
                                <Input v-model="subtask.title" type="text" placeholder="Write subtask"
                                    class="h-10 border-0 bg-transparent px-0 py-0 text-sm shadow-none focus-visible:ring-0" />
                                <Button type="button" variant="ghost" size="icon-sm"
                                    class="shrink-0 rounded-full text-slate-400 hover:bg-white hover:text-red-500"
                                    aria-label="Delete subtask" @click="removeSubtaskField(index)">
                                    <X class="size-4" />
                                </Button>
                            </div>
                        </div>

                        <Button type="button" variant="outline"
                            class="h-12 w-full rounded-xl border-blue-200 text-base font-medium text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                            @click="addSubtaskField">
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

                        <Input id="task-assigned-date" v-model="taskForm.assignedDate" type="date"
                            class="h-11 w-[10rem] rounded-xl border-white bg-white px-3 text-sm font-medium text-slate-700 shadow-[0_12px_24px_-20px_rgba(15,23,42,0.28)] focus-visible:ring-1" />
                    </div>

                </div>

                <div class="border-t border-slate-100 bg-white px-5 py-4">
                    <Button type="submit"
                        class="h-14 w-full rounded-[1.2rem] bg-blue-500 text-base font-semibold shadow-[0_18px_32px_-18px_rgba(59,130,246,0.95)] hover:bg-blue-500/90"
                        :disabled="!canSubmitForm || isSavingTask">
                        <RefreshCw v-if="isSavingTask" class="size-4 animate-spin" />
                        <span>{{ saveButtonLabel }}</span>
                    </Button>
                </div>
            </form>
        </DialogContent>
    </Dialog>
</template>