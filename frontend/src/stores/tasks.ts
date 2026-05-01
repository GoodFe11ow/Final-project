import { defineStore } from 'pinia'
import { apiRequest } from '@/lib/api'
import { useAuthStore } from './auth'

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
}//TODO: delete later


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
]//TODO: delete later

type BackendSubtask = {
  id: string
  title: string
  isCompleted: boolean
}

type BackendTask = {
  id: string
  title: string
  description: string | null
  assignatedDate: string | null
  isCompleted: boolean
  subtasks: BackendSubtask[]
}

type GetTasksResponse = {
  ok: true
  data: BackendTask[]
}
 type CreateTaskResponse = {
  ok: true
  data: BackendTask
 }

 type DeleteTaskResponse = {
  ok: true
  message: string
 }
 
 type UpdateTaskResponse = {
    ok: true
    data: BackendTask
 }

function mapBackendTask(task: BackendTask): TaskItem {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? '',
    assignedDate: task.assignatedDate ? task.assignatedDate.slice(0, 10) : '',
    completed: task.isCompleted,
    subtasks: task.subtasks.map((subtask) => ({
      id: subtask.id,
      title: subtask.title,
      completed: subtask.isCompleted,
    })),
  }
}

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as TaskItem[],
    isLoading: false,
    errorMessage: '',
  }),
  actions: {
     async createTask(draft: TaskDraft) {
      const authStore = useAuthStore()

      if(!authStore.token) {
        throw new Error('Unauthorized')
      }

      this.errorMessage = ''
      
      try {
        const response = await apiRequest<CreateTaskResponse>('/tasks', {
          method: 'POST',
          token: authStore.token,
          body: JSON.stringify({
            title: draft.title.trim(),
            description: draft.description.trim(),
            assignedDate: draft.assignedDate,
          }),
        })

        const subtaskTitles = draft.subtasks
          .map((subtask) => subtask.title.trim())
          .filter((title) => title.length > 0)

          for (const title of subtaskTitles) {
            await apiRequest(`/tasks/${response.data.id}/subtasks`, {
              method: 'POST',
              token: authStore.token,
              body: JSON.stringify({ title }),
            })
          }

          await this.fetchTasks()

          return response.data
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to create task'

        throw error
      }
    },
     async updateTask(taskId: string, draft: TaskDraft) {
      const authStore = useAuthStore()

      if(!authStore.token) {
        throw new Error('Unauthorized')
      }

      this.errorMessage = ''

      try {
        await apiRequest<UpdateTaskResponse>(`/tasks/${taskId}`, {
          method: 'PATCH',
          token: authStore.token,
          body: JSON.stringify({
            title: draft.title.trim(),
            description: draft.description.trim(),
            assignedDate: draft.assignedDate,
          }),
        })

        await this.fetchTasks()
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to update task'

        throw error
      }
    },
    toggleSubtask(taskId: string, subtaskId: string) {
      const task = this.tasks.find((item) => item.id === taskId)
      const subtask = task?.subtasks.find((item) => item.id === subtaskId)

      if (!task || !subtask) return

      subtask.completed = !subtask.completed
      task.completed = getTaskProgress(task).isComplete
    },//TODO: delete later, has no use
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
    async deleteTask(taskId: string) {
      const authStore = useAuthStore()

      if(!authStore.token) {
        throw new Error('Unauthorized')
      }

      this.errorMessage = ''

      try {
        await apiRequest<DeleteTaskResponse>(`/tasks/${taskId}`, {
          method: 'DELETE',
          token: authStore.token,
        })

        this.tasks = this.tasks.filter((task) => task.id !== taskId)
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to delete task'
        throw error
      }
    },
    async fetchTasks() {
      const authStore = useAuthStore()

      if(!authStore.token) {
        this.tasks = []
        return
      }

      this.isLoading = true
      this.errorMessage = ''

      try {
        const response = await apiRequest<GetTasksResponse>('/tasks', {
          token: authStore.token,
        })
        
        this.tasks = response.data.map(mapBackendTask)
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to load tasks'  
      } finally {
        this.isLoading = false
      }
    }
  },
})
