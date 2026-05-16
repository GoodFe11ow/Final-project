import { defineStore } from "pinia"
import { apiRequest } from "@/lib/api"
import { useAuthStore } from "./auth"

export type AppSettings = {
    themeMode: 'light' | 'dark'
    focusDurationSeconds: number
    breakDurationSeconds: number
    focusRemindersEnabled: boolean
    focusRemindersTime: string
    focusRemindersEveryDay: boolean
    focusRemindersWeekdays: boolean
    dailySummaryEnabled: boolean
    dailySummaryTime: string
    timezone: string
    lastUsedFocusTaskId: string | null
}

const defaultSettings: AppSettings = {
    themeMode: 'light',
    focusDurationSeconds: 2100,
    breakDurationSeconds: 300,
    focusRemindersEnabled: true,
    focusRemindersTime: '09:00',
    focusRemindersEveryDay: false,
    focusRemindersWeekdays: true,
    dailySummaryEnabled: true,
    dailySummaryTime: '20:00',
    timezone: 'Europe/Tallinn',
    lastUsedFocusTaskId: null,
}

type GetSettingsResponse = {
    ok: true
    data: AppSettings
}

type UpdateSettingsResponse = {
    ok: true
    data: AppSettings
}

export const useSettingStore = defineStore('settings', {
    state: () => ({
        settings: { ...defaultSettings } as AppSettings,
        isLoading: false,
        isSaving: false,
        errorMessage: '',
        loadedForUserId: null as string | null,
    }),

    actions: {
        resetSettingsState() {
            this.settings = { ...defaultSettings }
            this.isLoading = false
            this.isSaving = false
            this.errorMessage = ''
            this.loadedForUserId = null
        },

        async fetchSettings() {
            const authStore = useAuthStore()

            if(!authStore.token || !authStore.user) {
                this.resetSettingsState()
                return
            }

            this.isLoading = true
            this.errorMessage = ''

            try {
                const response = await apiRequest<GetSettingsResponse>('/settings', {
                    token: authStore.token,
                })

                this.settings = response.data
                this.loadedForUserId = authStore.user.id
            } catch (error) {
                this.errorMessage = 
                    error instanceof Error ? error.message : 'Failed to load settings'
                throw error
            } finally {
                this.isLoading = false
            }
        },

        async ensureSettingsLoaded() {
            const authStore = useAuthStore()

            if(!authStore.token || !authStore.user) {
                this.resetSettingsState()
                return
            }

            if(this.loadedForUserId === authStore.user.id || this.isLoading) {
                return
            }

            await this.fetchSettings()
        },

        async updateSettings(patch: Partial<AppSettings>) {
            const authStore = useAuthStore()

            if(!authStore.token || !authStore.user) {
                throw new Error('Unauthorized')
            }

            this.isSaving = true
            this.errorMessage = ''

            try {
                const  response = await apiRequest<UpdateSettingsResponse>('/settings', {
                    method: 'PATCH',
                    token: authStore.token,
                    body: JSON.stringify(patch),
                })

                this.settings = response.data
                this.loadedForUserId = authStore.user.id
            } catch (error) {
                this.errorMessage = 
                    error instanceof Error ? error.message : 'Failed to save settings'
                throw error
            } finally {
                this.isSaving = false
            }
        }

    }
})