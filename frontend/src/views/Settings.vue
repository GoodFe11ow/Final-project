<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import {
  BarChart3,
  BellRing,
  ChevronRight,
  Clock3,
  Coffee,
  FileText,
  LogOut,
  MoonStar,
} from 'lucide-vue-next'
import AppShell from '@/components/layout/AppShell.vue'
import NotificationSettingsDialog from '@/components/settings/NotificationSettingsDialog.vue'
import TimerDurationDialog from '@/components/settings/TimerDurationDialog.vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  formatDurationLabel,
  useTimerSettingsStore,
  type TimerSettingKey,
} from '@/stores/timer-settings'

type NotificationSettingKey = 'focus-reminders' | 'daily-summary'

const router = useRouter()
const timerSettingsStore = useTimerSettingsStore()
const { breakDurationSeconds, focusDurationSeconds } = storeToRefs(timerSettingsStore)
const sectionShellClass =
  'space-y-3 rounded-[1rem] border border-slate-200/80 bg-[#f5f7ff] p-3 shadow-[0_24px_56px_-44px_rgba(15,23,42,0.14)]'
const rowCardClass =
  'rounded-[1rem] border border-slate-200/80 bg-white shadow-[0_18px_38px_-34px_rgba(15,23,42,0.14)]'

const activeTimerSetting = ref<TimerSettingKey | null>(null)
const focusRemindersOpen = ref(false)
const dailySummaryOpen = ref(false)

const focusReminderSettings = reactive({
  enabled: true,
  time: '09:00',
  everyDay: false,
  weekdays: true,
})

const dailySummarySettings = reactive({
  enabled: true,
  time: '20:00',
})

const timerSettings = computed(() => [
  {
    key: 'focus' as const,
    icon: Clock3,
    title: 'Focus',
    description: 'Deep work period',
    value: formatDurationLabel(focusDurationSeconds.value),
  },
  {
    key: 'break' as const,
    icon: Coffee,
    title: 'Break',
    description: 'Rest and recharge',
    value: formatDurationLabel(breakDurationSeconds.value),
  },
])

const notificationSettings = computed(() => [
  {
    key: 'focus-reminders' as const,
    icon: BellRing,
    title: 'Focus reminders',
    description: focusReminderSettings.enabled
      ? `${formatTimeLabel(focusReminderSettings.time)} · ${focusReminderSettings.everyDay ? 'Every day' : focusReminderSettings.weekdays ? 'Weekdays' : 'Custom'}`
      : 'Off',
  },
  {
    key: 'daily-summary' as const,
    icon: FileText,
    title: 'Daily summary',
    description: dailySummarySettings.enabled
      ? formatTimeLabel(dailySummarySettings.time)
      : 'Off',
  },
])

const isDurationDialogOpen = computed({
  get: () => activeTimerSetting.value !== null,
  set: (nextOpen) => {
    if (!nextOpen) {
      activeTimerSetting.value = null
    }
  },
})

const durationDialogConfig = computed(() => {
  if (activeTimerSetting.value === 'break') {
    return {
      title: 'Break Duration',
      description: 'Choose how long each recovery break should last.',
      selectedValue: breakDurationSeconds.value,
      options: [5 * 60, 10 * 60, 15 * 60, 20 * 60],
    }
  }

  return {
    title: 'Focus Duration',
      description: 'Choose your default deep work session length.',
    selectedValue: focusDurationSeconds.value,
    options: [25 * 60, 30 * 60, 35 * 60, 45 * 60, 50 * 60, 60 * 60],
  }
})

function openTimerDuration(settingKey: TimerSettingKey) {
  activeTimerSetting.value = settingKey
}

function updateTimerDuration(nextValue: number) {
  if (!activeTimerSetting.value) return

  timerSettingsStore.setDurationSeconds(activeTimerSetting.value, nextValue)
}

function openNotificationSetting(settingKey: NotificationSettingKey) {
  if (settingKey === 'focus-reminders') {
    focusRemindersOpen.value = true
    return
  }

  dailySummaryOpen.value = true
}

function saveFocusReminderSettings(nextValue: {
  enabled: boolean
  time: string
  everyDay?: boolean
  weekdays?: boolean
}) {
  focusReminderSettings.enabled = nextValue.enabled
  focusReminderSettings.time = nextValue.time
  focusReminderSettings.everyDay = nextValue.everyDay ?? false
  focusReminderSettings.weekdays = nextValue.weekdays ?? false
}

function saveDailySummarySettings(nextValue: {
  enabled: boolean
  time: string
}) {
  dailySummarySettings.enabled = nextValue.enabled
  dailySummarySettings.time = nextValue.time
}

function formatTimeLabel(timeValue: string) {
  if (!timeValue) return '--:--'

  const [hoursRaw, minutesRaw] = timeValue.split(':')
  const hours = Number(hoursRaw)
  const minutes = Number(minutesRaw)

  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return timeValue

  const date = new Date()
  date.setHours(hours, minutes, 0, 0)

  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}
</script>

<template>
  <AppShell>
    <section class="flex flex-1 flex-col gap-7 pb-4 pt-2">
      <section :class="sectionShellClass">
        <p class="px-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Statistics
        </p>

        <button type="button" class="w-full text-left" @click="router.push('/stats')">
          <Card :class="rowCardClass">
            <CardContent class="flex items-center gap-4 p-4">
              <span class="flex size-11 items-center justify-center rounded-[1rem] bg-[#eef2ff] text-blue-500">
                <BarChart3 class="size-5" />
              </span>

              <div class="min-w-0 flex-1">
                <p class="text-[1.02rem] font-semibold tracking-[-0.02em] text-slate-800">
                  View Statistics
                </p>
              </div>

              <ChevronRight class="size-5 text-blue-500" />
            </CardContent>
          </Card>
        </button>
      </section>

      <section :class="sectionShellClass">
        <p class="px-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Timer Settings
        </p>

        <div class="space-y-3">
          <button
            v-for="setting in timerSettings"
            :key="setting.key"
            type="button"
            class="w-full text-left"
            @click="openTimerDuration(setting.key)"
          >
            <Card :class="rowCardClass">
              <CardContent class="flex items-center gap-4 p-4">
                <span class="flex size-11 items-center justify-center rounded-[1rem] bg-[#eef2ff] text-blue-500">
                  <component :is="setting.icon" class="size-5" />
                </span>

                <div class="min-w-0 flex-1">
                  <p class="text-[1.02rem] font-semibold tracking-[-0.02em] text-slate-800">
                    {{ setting.title }}
                  </p>
                  <p class="mt-1 text-sm text-slate-400">
                    {{ setting.description }}
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <span class="text-[1.02rem] font-semibold text-blue-500">
                    {{ setting.value }}
                  </span>
                  <ChevronRight class="size-4 text-slate-300" />
                </div>
              </CardContent>
            </Card>
          </button>
        </div>
      </section>

      <section :class="sectionShellClass">
        <p class="px-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Notifications
        </p>

        <div class="space-y-3">
          <button
            v-for="setting in notificationSettings"
            :key="setting.key"
            type="button"
            class="w-full text-left"
            @click="openNotificationSetting(setting.key)"
          >
            <Card :class="rowCardClass">
              <CardContent class="flex items-center gap-4 p-4">
                <span class="flex size-11 items-center justify-center rounded-[1rem] bg-[#eef2ff] text-slate-500">
                  <component :is="setting.icon" class="size-5" />
                </span>

                <div class="min-w-0 flex-1">
                  <p class="text-[1.02rem] font-semibold tracking-[-0.02em] text-slate-800">
                    {{ setting.title }}
                  </p>
                  <p class="mt-1 text-sm text-slate-400">
                    {{ setting.description }}
                  </p>
                </div>

                <ChevronRight class="size-4 text-slate-300" />
              </CardContent>
            </Card>
          </button>
        </div>
      </section>

      <section :class="sectionShellClass">
        <p class="px-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500">
          Appearance
        </p>

        <Card :class="rowCardClass">
          <CardContent class="flex items-center gap-4 p-4">
            <span class="flex size-11 items-center justify-center rounded-[1rem] bg-[#eef2ff] text-slate-500">
              <MoonStar class="size-5" />
            </span>

            <div class="min-w-0 flex-1">
              <p class="text-[1.02rem] font-semibold tracking-[-0.02em] text-slate-800">
                Theme
              </p>
            </div>

            <div class="flex items-center rounded-full bg-[#e7ebf8] p-1">
              <button
                type="button"
                class="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-blue-500 shadow-sm"
              >
                Light
              </button>
              <button
                type="button"
                class="rounded-full px-4 py-1.5 text-sm font-semibold text-slate-500"
              >
                Dark
              </button>
            </div>
          </CardContent>
        </Card>
      </section>

      <div class="pt-2">
        <Button
          type="button"
          variant="outline"
          class="mx-auto h-12 rounded-xl border-red-300 px-6 text-base font-semibold text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <LogOut class="size-4" />
          Log out
        </Button>
      </div>

      <TimerDurationDialog
        v-model:open="isDurationDialogOpen"
        :title="durationDialogConfig.title"
        :description="durationDialogConfig.description"
        :selected-value="durationDialogConfig.selectedValue"
        :options="durationDialogConfig.options"
        @select="updateTimerDuration"
      />

      <NotificationSettingsDialog
        v-model:open="focusRemindersOpen"
        title="Focus Reminders"
        enabled-label="Enable Reminders"
        enabled-description="Stay on track with daily notifications"
        :value="focusReminderSettings"
        show-frequency
        @save="saveFocusReminderSettings"
      />

      <NotificationSettingsDialog
        v-model:open="dailySummaryOpen"
        title="Daily Summary"
        enabled-label="Enable Summary"
        enabled-description="Get a notification at the end of your day."
        :value="dailySummarySettings"
        time-hint="Scheduled delivery"
        @save="saveDailySummarySettings"
      />
    </section>
  </AppShell>
</template>
