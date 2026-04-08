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
type SettingsThemeMode = 'light' | 'dark'

const router = useRouter()
const timerSettingsStore = useTimerSettingsStore()
const { breakDurationSeconds, focusDurationSeconds } = storeToRefs(timerSettingsStore)

const activeTimerSetting = ref<TimerSettingKey | null>(null)
const focusRemindersOpen = ref(false)
const dailySummaryOpen = ref(false)
const settingsTheme = ref<SettingsThemeMode>('light')

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

const isDarkTheme = computed(() => settingsTheme.value === 'dark')

const pageSurfaceClass = computed(() =>
  isDarkTheme.value
    ? 'flex flex-1 flex-col gap-7 -mx-4 -my-4 bg-[#0F172A] px-4 py-6 text-white transition-colors duration-300'
    : 'flex flex-1 flex-col gap-7 -mx-4 -my-4 bg-[#f8faff] px-4 py-6 text-slate-900 transition-colors duration-300',
)

const sectionShellClass = computed(() =>
  isDarkTheme.value
    ? 'space-y-3 rounded-[1rem] border border-slate-700/80 bg-[#1E293B] p-3 shadow-[0_24px_56px_-44px_rgba(2,6,23,0.72)] transition-colors duration-300'
    : 'space-y-3 rounded-[1rem] border border-slate-200/80 bg-[#f5f7ff] p-3 shadow-[0_24px_56px_-44px_rgba(15,23,42,0.14)] transition-colors duration-300',
)

const rowCardClass = computed(() =>
  isDarkTheme.value
    ? 'rounded-[1rem] border border-slate-600/80 bg-[#334155] shadow-[0_18px_38px_-34px_rgba(2,6,23,0.76)] transition-colors duration-300'
    : 'rounded-[1rem] border border-slate-200/80 bg-white shadow-[0_18px_38px_-34px_rgba(15,23,42,0.14)] transition-colors duration-300',
)

const sectionLabelClass = computed(() =>
  isDarkTheme.value
    ? 'px-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-400'
    : 'px-1 text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-slate-500',
)

const titleTextClass = computed(() =>
  isDarkTheme.value
    ? 'text-[1.02rem] font-semibold tracking-[-0.02em] text-white'
    : 'text-[1.02rem] font-semibold tracking-[-0.02em] text-slate-800',
)

const descriptionTextClass = computed(() =>
  isDarkTheme.value ? 'mt-1 text-sm text-slate-300' : 'mt-1 text-sm text-slate-400',
)

const valueTextClass = computed(() =>
  isDarkTheme.value
    ? 'text-[1.02rem] font-semibold text-blue-400'
    : 'text-[1.02rem] font-semibold text-blue-500',
)

const blueIconClass = computed(() =>
  isDarkTheme.value
    ? 'flex size-11 items-center justify-center rounded-[1rem] bg-[#0F172A] text-blue-500'
    : 'flex size-11 items-center justify-center rounded-[1rem] bg-[#eef2ff] text-blue-500',
)

const neutralIconClass = computed(() =>
  isDarkTheme.value
    ? 'flex size-11 items-center justify-center rounded-[1rem] bg-[#0F172A] text-slate-200'
    : 'flex size-11 items-center justify-center rounded-[1rem] bg-[#eef2ff] text-slate-500',
)

const chevronClass = computed(() =>
  isDarkTheme.value ? 'size-4 text-slate-500' : 'size-4 text-slate-300',
)

const themeToggleShellClass = computed(() =>
  isDarkTheme.value
    ? 'flex items-center rounded-full bg-[#0F172A] p-1'
    : 'flex items-center rounded-full bg-[#e7ebf8] p-1',
)

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

function setSettingsTheme(nextTheme: SettingsThemeMode) {
  settingsTheme.value = nextTheme
}

function getThemeToggleButtonClass(themeMode: SettingsThemeMode) {
  const isActive = settingsTheme.value === themeMode

  if (isDarkTheme.value) {
    return isActive
      ? 'rounded-full bg-[#334155] px-4 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors'
      : 'rounded-full px-4 py-1.5 text-sm font-semibold text-slate-300 transition-colors'
  }

  return isActive
    ? 'rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-blue-500 shadow-sm transition-colors'
    : 'rounded-full px-4 py-1.5 text-sm font-semibold text-slate-500 transition-colors'
}
</script>

<template>
  <AppShell>
    <section :class="pageSurfaceClass">
      <section :class="sectionShellClass">
        <p :class="sectionLabelClass">
          Statistics
        </p>

        <button type="button" class="w-full text-left" @click="router.push('/stats')">
          <Card :class="rowCardClass">
            <CardContent class="flex items-center gap-4 p-4">
              <span :class="blueIconClass">
                <BarChart3 class="size-5" />
              </span>

              <div class="min-w-0 flex-1">
                <p :class="titleTextClass">
                  View Statistics
                </p>
              </div>

              <ChevronRight class="size-5 text-blue-500" />
            </CardContent>
          </Card>
        </button>
      </section>

      <section :class="sectionShellClass">
        <p :class="sectionLabelClass">
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
                <span :class="blueIconClass">
                  <component :is="setting.icon" class="size-5" />
                </span>

                <div class="min-w-0 flex-1">
                  <p :class="titleTextClass">
                    {{ setting.title }}
                  </p>
                  <p :class="descriptionTextClass">
                    {{ setting.description }}
                  </p>
                </div>

                <div class="flex items-center gap-2">
                  <span :class="valueTextClass">
                    {{ setting.value }}
                  </span>
                  <ChevronRight :class="chevronClass" />
                </div>
              </CardContent>
            </Card>
          </button>
        </div>
      </section>

      <section :class="sectionShellClass">
        <p :class="sectionLabelClass">
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
                <span :class="neutralIconClass">
                  <component :is="setting.icon" class="size-5" />
                </span>

                <div class="min-w-0 flex-1">
                  <p :class="titleTextClass">
                    {{ setting.title }}
                  </p>
                  <p :class="descriptionTextClass">
                    {{ setting.description }}
                  </p>
                </div>

                <ChevronRight :class="chevronClass" />
              </CardContent>
            </Card>
          </button>
        </div>
      </section>

      <section :class="sectionShellClass">
        <p :class="sectionLabelClass">
          Appearance
        </p>

        <Card :class="rowCardClass">
          <CardContent class="flex items-center gap-4 p-4">
            <span :class="neutralIconClass">
              <MoonStar class="size-5" />
            </span>

            <div class="min-w-0 flex-1">
              <p :class="titleTextClass">
                Theme
              </p>
            </div>

            <div :class="themeToggleShellClass">
              <button
                type="button"
                :class="getThemeToggleButtonClass('light')"
                @click="setSettingsTheme('light')"
              >
                Light
              </button>
              <button
                type="button"
                :class="getThemeToggleButtonClass('dark')"
                @click="setSettingsTheme('dark')"
              >
                Dark
              </button>
            </div>
          </CardContent>
        </Card>
      </section>

      <div class="pt-2 pb-2 flex justify-center">
        <Button
          type="button"
          variant="outline"
          class="mx-auto h-12 rounded-xl px-6 text-base font-semibold transition-colors"
          :class="
            isDarkTheme
              ? 'border-red-400/60 bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-300'
              : 'border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600'
          "
          @click="router.push('/welcome')"
        >
          <LogOut class="size-4" />
          Log out
        </Button>
      </div>

      <TimerDurationDialog
        v-model:open="isDurationDialogOpen"
        :theme="settingsTheme"
        :title="durationDialogConfig.title"
        :description="durationDialogConfig.description"
        :selected-value="durationDialogConfig.selectedValue"
        :options="durationDialogConfig.options"
        @select="updateTimerDuration"
      />

      <NotificationSettingsDialog
        v-model:open="focusRemindersOpen"
        :theme="settingsTheme"
        title="Focus Reminders"
        enabled-label="Enable Reminders"
        enabled-description="Stay on track with daily notifications"
        :value="focusReminderSettings"
        show-frequency
        @save="saveFocusReminderSettings"
      />

      <NotificationSettingsDialog
        v-model:open="dailySummaryOpen"
        :theme="settingsTheme"
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
