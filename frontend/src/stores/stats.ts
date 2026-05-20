import { defineStore } from 'pinia'
import { apiRequest } from '@/lib/api'
import { useAuthStore } from '@/stores/auth'

type StreakStatus = 'completed_today' | 'pending_today' | 'broken'

type StatsSummaryResponse = {
  ok: true
  data: {
    streakDays: number
    streakStatus: StreakStatus
    currentStreakDays: number
  }
}

export const useStatsStore = defineStore('stats', {
  state: () => ({
    streakDays: 0,
    streakStatus: 'broken' as StreakStatus,
    isLoadingSummary: false,
    loadedForUserId: null as string | null,
    errorMessage: '',
  }),
  actions: {
    async fetchSummary(options: { force?: boolean } = {}) {
      const authStore = useAuthStore()

      if (!authStore.token || !authStore.user) {
        this.streakStatus = 'broken'
        this.streakDays = 0
        this.loadedForUserId = null
        this.errorMessage = ''
        return
      }

      if (!options.force && this.loadedForUserId === authStore.user.id) {
        return
      }

      if (this.isLoadingSummary) {
        return
      }

      this.isLoadingSummary = true
      this.errorMessage = ''

      try {
        const response = await apiRequest<StatsSummaryResponse>('/stats/summary', {
          token: authStore.token,
        })

        this.streakDays = response.data.streakDays
        this.streakStatus = response.data.streakStatus
        this.loadedForUserId = authStore.user.id
      } catch (error) {
        this.loadedForUserId = null
        this.errorMessage = error instanceof Error ? error.message : 'Failed to load stats summary'
      } finally {
        this.isLoadingSummary = false
      }
    },
  },
})
