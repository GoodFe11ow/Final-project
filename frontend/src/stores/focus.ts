import { defineStore } from 'pinia'

function normalizeTaskIndex(index: number, taskCount: number) {
  if (taskCount <= 0) return 0

  const safeIndex = Number.isFinite(index) ? Math.floor(index) : 0
  const normalizedIndex = safeIndex % taskCount

  return normalizedIndex >= 0 ? normalizedIndex : normalizedIndex + taskCount
}

export const useFocusStore = defineStore('focus', {
  state: () => ({
    lastUsedTaskIndex: 0,
  }),
  actions: {
    setLastUsedTaskIndex(index: number, taskCount: number) {
      this.lastUsedTaskIndex = normalizeTaskIndex(index, taskCount)
    },
  },
})
