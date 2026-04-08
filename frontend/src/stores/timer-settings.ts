import { defineStore } from 'pinia'

export type TimerSettingKey = 'focus' | 'break'

function normalizeDurationSeconds(totalSeconds: number) {
  return Math.max(1, Math.floor(totalSeconds))
}

export function splitDurationSeconds(totalSeconds: number) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds))

  return {
    minutes: Math.floor(safeSeconds / 60),
    seconds: safeSeconds % 60,
  }
}

export function formatDurationLabel(totalSeconds: number) {
  const { minutes, seconds } = splitDurationSeconds(totalSeconds)

  if (seconds === 0) return `${minutes} min`
  if (minutes === 0) return `${seconds} sec`

  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}

export const useTimerSettingsStore = defineStore('timerSettings', {
  state: () => ({
    focusDurationSeconds: 35 * 60,
    breakDurationSeconds: 5 * 60,
  }),
  actions: {
    setDurationSeconds(settingKey: TimerSettingKey, totalSeconds: number) {
      const nextValue = normalizeDurationSeconds(totalSeconds)

      if (settingKey === 'focus') {
        this.focusDurationSeconds = nextValue
        return
      }

      this.breakDurationSeconds = nextValue
    },
  },
})
