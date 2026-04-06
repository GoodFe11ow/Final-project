import { defineStore } from 'pinia'

export type TaskSubtask = {
  id: string
  title: string
  completed: boolean
}

export type TaskItem = {
  id: string
  title: string
  description: string
  assignedDate: string
  completed: boolean
  subtasks: TaskSubtask[]
}

export type TaskDraftSubtask = {
  id?: string
  title: string
}

export type TaskDraft = {
  title: string
  description: string
  assignedDate: string
  subtasks: TaskDraftSubtask[]
}

type TaskProgress = {
  completedCount: number
  totalCount: number
  percent: number
  isComplete: boolean
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}

function nextDate(offsetDays = 0) {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)

  return date.toISOString().slice(0, 10)
}

function normalizeSubtasks(
  subtasks: TaskDraftSubtask[],
  previous?: TaskSubtask[],
) {
  const existingSubtasks = new Map((previous ?? []).map((subtask) => [subtask.id, subtask]))

  return subtasks
    .map((subtask) => ({
      id: subtask.id,
      title: subtask.title.trim(),
    }))
    .filter((subtask) => subtask.title.length > 0)
    .map((subtask) => {
      const previousSubtask = subtask.id ? existingSubtasks.get(subtask.id) : undefined

      return {
        id: previousSubtask?.id ?? createId('subtask'),
        title: subtask.title,
        completed: previousSubtask?.completed ?? false,
      }
    })
}

export function getTaskProgress(task: TaskItem): TaskProgress {
  const totalCount = task.subtasks.length > 0 ? task.subtasks.length : 1
  const completedCount =
    task.subtasks.length > 0
      ? task.subtasks.filter((subtask) => subtask.completed).length
      : task.completed
        ? 1
        : 0

  const percent = Math.round((completedCount / totalCount) * 100)

  return {
    completedCount,
    totalCount,
    percent,
    isComplete: completedCount === totalCount,
  }
}

const initialTasks: TaskItem[] = [
  {
    id: createId('task'),
    title: 'Project Architecture Review',
    description: 'Review the current frontend structure and document the strongest opportunities for cleanup.',
    assignedDate: nextDate(1),
    completed: false,
    subtasks: [
      { id: createId('subtask'), title: 'Inspect routing setup', completed: true },
      { id: createId('subtask'), title: 'Review layout components', completed: false },
      { id: createId('subtask'), title: 'List technical risks', completed: false },
    ],
  },
  {
    id: createId('task'),
    title: 'Q3 Financial Reporting',
    description: 'Prepare the reporting structure and gather the remaining finance inputs for the Q3 summary.',
    assignedDate: nextDate(2),
    completed: false,
    subtasks: [
      { id: createId('subtask'), title: 'Collect invoices', completed: false },
      { id: createId('subtask'), title: 'Draft summary sheet', completed: false },
    ],
  },
  {
    id: createId('task'),
    title: 'Social Media Strategy',
    description: 'Finalize the channel plan and map the next set of weekly content pieces.',
    assignedDate: nextDate(3),
    completed: false,
    subtasks: [
      { id: createId('subtask'), title: 'Audit current channels', completed: true },
      { id: createId('subtask'), title: 'Define campaign themes', completed: true },
      { id: createId('subtask'), title: 'Plan posting schedule', completed: true },
      { id: createId('subtask'), title: 'Create asset checklist', completed: false },
    ],
  },
  {
    id: createId('task'),
    title: 'Weekly Team Sync',
    description: 'Prepare notes for the weekly sync and follow up on the open action items afterward.',
    assignedDate: nextDate(4),
    completed: true,
    subtasks: [
      { id: createId('subtask'), title: 'Collect agenda topics', completed: true },
      { id: createId('subtask'), title: 'Share updates', completed: true },
      { id: createId('subtask'), title: 'Capture blockers', completed: true },
      { id: createId('subtask'), title: 'Send recap', completed: true },
    ],
  },
  {
    id: createId('task'),
    title: 'Client Onboarding Call',
    description: 'Walk the client through the next milestones and confirm the project onboarding timeline.',
    assignedDate: nextDate(5),
    completed: true,
    subtasks: [
      { id: createId('subtask'), title: 'Confirm attendees', completed: true },
    ],
  },
]

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: initialTasks as TaskItem[],
  }),
  actions: {
    createTask(draft: TaskDraft) {
      const task: TaskItem = {
        id: createId('task'),
        title: draft.title.trim(),
        description: draft.description.trim(),
        assignedDate: draft.assignedDate,
        completed: false,
        subtasks: normalizeSubtasks(draft.subtasks),
      }

      task.completed = getTaskProgress(task).isComplete
      this.tasks.unshift(task)

      return task
    },
    updateTask(taskId: string, draft: TaskDraft) {
      const task = this.tasks.find((item) => item.id === taskId)

      if (!task) return

      task.title = draft.title.trim()
      task.description = draft.description.trim()
      task.assignedDate = draft.assignedDate
      task.subtasks = normalizeSubtasks(draft.subtasks, task.subtasks)
      task.completed = getTaskProgress(task).isComplete
    },
    toggleSubtask(taskId: string, subtaskId: string) {
      const task = this.tasks.find((item) => item.id === taskId)
      const subtask = task?.subtasks.find((item) => item.id === subtaskId)

      if (!task || !subtask) return

      subtask.completed = !subtask.completed
      task.completed = getTaskProgress(task).isComplete
    },
    markTaskComplete(taskId: string) {
      const task = this.tasks.find((item) => item.id === taskId)

      if (!task) return

      if (task.subtasks.length > 0) {
        task.subtasks = task.subtasks.map((subtask) => ({
          ...subtask,
          completed: true,
        }))
      }

      task.completed = true
    },
    deleteTask(taskId: string) {
      this.tasks = this.tasks.filter((task) => task.id !== taskId)
    },
  },
})
