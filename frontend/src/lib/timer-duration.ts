export type TimerSettingKey = 'focus' | 'break'

export function splitDurationSeconds(totalSeconds: number) {
    const safeSeconds = Math.max(0, Math.floor(totalSeconds))

    return {
        minutes: Math.floor(safeSeconds / 60),
        seconds: safeSeconds % 60,
    }
}

export function formatDurationLabel(totalSeconds: number) {
    const { minutes, seconds } = splitDurationSeconds(totalSeconds)

    if(seconds === 0) return `${minutes} min`
    if(minutes === 0) return `${seconds} sec`

    return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}