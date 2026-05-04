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

type CreateSubtaskResponse = {
  ok: true
  data: {
    id: string
    title: string
    isCompleted: boolean
    taskId: string
  }
}

type UpdateSubtaskResponse = {
  ok: true
  data: {
    id: string
    title: string
    isCompleted: boolean
    taskId: string
  }
}

type DeleteSubtaskResponse = {
  ok: true
  message: string
}

type NormalizedDraftSubtask = {
  id?: string
  title: string
}

function normalizeDraftSubtasks(subtasks: TaskDraftSubtask[]): NormalizedDraftSubtask[] {
  return subtasks
    .map((subtask) => ({
      id: subtask.id,
      title: subtask.title.trim(),
    }))
    .filter((subtask) => subtask.title.length > 0)
}

function buildTaskPayload(draft: TaskDraft) {
  const description = draft.description.trim()

  return {
    title: draft.title.trim(),
    ...(description ? { description } : {}),
    assignedDate: draft.assignedDate,
  }
}

function mapBackendTask(task: BackendTask): TaskItem {
  const subtasks = (Array.isArray(task.subtasks) ? task.subtasks : []).map((subtask) => ({
    id: subtask.id,
    title: subtask.title,
    completed: subtask.isCompleted,
  }))

  return {
    id: task.id,
    title: task.title,
    description: task.description ?? '',
    assignedDate: task.assignatedDate ? task.assignatedDate.slice(0, 10) : '',
    completed: subtasks.length > 0 ? subtasks.every((subtask) => subtask.completed) : task.isCompleted,
    subtasks,
  }
}

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as TaskItem[],
    isLoading: false,
    errorMessage: '',
    loadedForUserId: null as string | null,
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
          body: JSON.stringify(buildTaskPayload(draft)),
        })

        const subtaskTitles = normalizeDraftSubtasks(draft.subtasks).map((subtask) => subtask.title)

          for (const title of subtaskTitles) {
            await apiRequest<CreateSubtaskResponse>(`/tasks/${response.data.id}/subtasks`, {
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
        const existingTask = this.tasks.find((task) => task.id === taskId)

        if (!existingTask) {
          throw new Error('Task not found')
        }

        const normalizedDraftSubtasks = normalizeDraftSubtasks(draft.subtasks)
        const existingSubtasksById = new Map(
          existingTask.subtasks.map((subtask) => [subtask.id, subtask]),
        )
        const nextCompleted =
          normalizedDraftSubtasks.length > 0
            ? normalizedDraftSubtasks.every((subtask) => {
                if (!subtask.id) return false

                return existingSubtasksById.get(subtask.id)?.completed ?? false
              })
            : existingTask.completed

        await apiRequest<UpdateTaskResponse>(`/tasks/${taskId}`, {
          method: 'PATCH',
          token: authStore.token,
          body: JSON.stringify({
            ...buildTaskPayload(draft),
            isCompleted: nextCompleted,
          }),
        })

        for (const subtask of existingTask.subtasks) {
          const stillExists = normalizedDraftSubtasks.some((draftSubtask) => draftSubtask.id === subtask.id)

          if (!stillExists) {
            await apiRequest<DeleteSubtaskResponse>(`/tasks/${taskId}/subtasks/${subtask.id}`, {
              method: 'DELETE',
              token: authStore.token,
            })
          }
        }

        for (const draftSubtask of normalizedDraftSubtasks) {
          const existingSubtask = draftSubtask.id
            ? existingSubtasksById.get(draftSubtask.id)
            : undefined

          if (!existingSubtask) {
            await apiRequest<CreateSubtaskResponse>(`/tasks/${taskId}/subtasks`, {
              method: 'POST',
              token: authStore.token,
              body: JSON.stringify({ title: draftSubtask.title }),
            })

            continue
          }

          if (existingSubtask.title === draftSubtask.title) {
            continue
          }

          await apiRequest<UpdateSubtaskResponse>(`/tasks/${taskId}/subtasks/${draftSubtask.id}`, {
            method: 'PATCH',
            token: authStore.token,
            body: JSON.stringify({ title: draftSubtask.title }),
          })
        }

        await this.fetchTasks()
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to update task'

        throw error
      }
    },
    async toggleSubtask(taskId: string, subtaskId: string) {
      const authStore = useAuthStore()
      const task = this.tasks.find((item) => item.id === taskId)
      const subtask = task?.subtasks.find((item) => item.id === subtaskId)

      if(!authStore.token) {
        throw new Error('Unauthorized')
      }

      if (!task || !subtask) return

      const nextCompleted = !subtask.completed
      const nextTaskCompleted = task.subtasks.every((item) => {
        if (item.id === subtaskId) {
          return nextCompleted
        }

        return item.completed
      })

      this.errorMessage = ''

      try {
        await apiRequest<UpdateSubtaskResponse>(`/tasks/${taskId}/subtasks/${subtaskId}`, {
          method: 'PATCH',
          token: authStore.token,
          body: JSON.stringify({ isCompleted: nextCompleted }),
        })

        await apiRequest<UpdateTaskResponse>(`/tasks/${taskId}`, {
          method: 'PATCH',
          token: authStore.token,
          body: JSON.stringify({ isCompleted: nextTaskCompleted }),
        })

        subtask.completed = nextCompleted
        task.completed = nextTaskCompleted
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to update subtask'

        throw error
      }
    },
    async markTaskComplete(taskId: string) {
      const authStore = useAuthStore()
      const task = this.tasks.find((item) => item.id === taskId)

      if(!authStore.token) {
        throw new Error('Unauthorized')
      }

      if (!task) return

      this.errorMessage = ''

      try {
        for (const subtask of task.subtasks) {
          if (subtask.completed) {
            continue
          }

          await apiRequest<UpdateSubtaskResponse>(`/tasks/${taskId}/subtasks/${subtask.id}`, {
            method: 'PATCH',
            token: authStore.token,
            body: JSON.stringify({ isCompleted: true }),
          })
        }

        await apiRequest<UpdateTaskResponse>(`/tasks/${taskId}`, {
          method: 'PATCH',
          token: authStore.token,
          body: JSON.stringify({ isCompleted: true }),
        })

        if (task.subtasks.length > 0) {
          task.subtasks = task.subtasks.map((subtask) => ({
            ...subtask,
            completed: true,
          }))
        }

        task.completed = true
      } catch (error) {
        this.errorMessage = error instanceof Error ? error.message : 'Failed to complete task'

        throw error
      }
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

      if(!authStore.token || !authStore.user) {
        this.tasks = []
        this.loadedForUserId = null
        return
      }

      this.isLoading = true
      this.errorMessage = ''

      try {
        const response = await apiRequest<GetTasksResponse>('/tasks', {
          token: authStore.token,
        })

        const tasks = Array.isArray(response.data) ? response.data : []

        this.tasks = tasks.map(mapBackendTask)
        this.loadedForUserId = authStore.user.id
      } catch (error) {
        this.loadedForUserId = null
        this.errorMessage = error instanceof Error ? error.message : 'Failed to load tasks'  
      } finally {
        this.isLoading = false
      }
    },
    async ensureTasksLoaded() {
      const authStore = useAuthStore()

      if (!authStore.token || !authStore.user) {
        this.tasks = []
        this.loadedForUserId = null
        return
      }

      if (this.loadedForUserId === authStore.user.id || this.isLoading) {
        return
      }

      await this.fetchTasks()
    }
  },
})
