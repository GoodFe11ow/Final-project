<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { Clock3, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import TimeStepper from '@/components/settings/TimeStepper.vue'

type NotificationSettingsValue = {
  enabled: boolean
  time: string
  everyDay?: boolean
  weekdays?: boolean
}

type SettingsThemeMode = 'light' | 'dark'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    enabledLabel: string
    enabledDescription: string
    value: NotificationSettingsValue
    showFrequency?: boolean
    timeHint?: string
    theme?: SettingsThemeMode
  }>(),
  {
    showFrequency: false,
    timeHint: undefined,
    theme: 'light',
  },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  save: [value: NotificationSettingsValue]
}>()

const draft = reactive<NotificationSettingsValue>({
  enabled: false,
  time: '09:00',
  everyDay: false,
  weekdays: false,
})

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return

    draft.enabled = props.value.enabled
    draft.time = props.value.time
    draft.everyDay = props.value.everyDay ?? false
    draft.weekdays = props.value.weekdays ?? false
  },
  { immediate: true },
)

function closeDialog() {
  emit('update:open', false)
}

function saveChanges() {
  emit('save', {
    enabled: draft.enabled,
    time: draft.time,
    everyDay: draft.everyDay,
    weekdays: draft.weekdays,
  })
  closeDialog()
}

const timeParts = computed(() => parseTimeValue(draft.time))
const isDarkTheme = computed(() => props.theme === 'dark')

const hourLabel = computed(() => String(timeParts.value.hour12).padStart(2, '0'))
const minuteLabel = computed(() => String(timeParts.value.minutes).padStart(2, '0'))

function stepHours(direction: 1 | -1) {
  const nextHour24 = (timeParts.value.hour24 + direction + 24) % 24
  draft.time = formatTimeValue(nextHour24, timeParts.value.minutes)
}

function stepMinutes(direction: 1 | -1) {
  const currentTotalMinutes = timeParts.value.hour24 * 60 + timeParts.value.minutes
  const nextTotalMinutes = (currentTotalMinutes + direction + 24 * 60) % (24 * 60)
  const nextHour24 = Math.floor(nextTotalMinutes / 60)
  const nextMinutes = nextTotalMinutes % 60

  draft.time = formatTimeValue(nextHour24, nextMinutes)
}

function setMeridiem(nextMeridiem: 'AM' | 'PM') {
  let nextHour24 = timeParts.value.hour12 % 12

  if (nextMeridiem === 'PM') {
    nextHour24 += 12
  }

  draft.time = formatTimeValue(nextHour24, timeParts.value.minutes)
}

function formatDisplayTime(timeValue: string) {
  const { hour12, minutes, meridiem } = parseTimeValue(timeValue)

  return `${String(hour12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${meridiem}`
}

function parseTimeValue(timeValue: string) {
  const [hoursRaw, minutesRaw] = timeValue.split(':')
  const safeHour24 = clampNumber(Number.parseInt(hoursRaw, 10), 0, 23)
  const safeMinutes = clampNumber(Number.parseInt(minutesRaw, 10), 0, 59)
  const meridiem: 'AM' | 'PM' = safeHour24 >= 12 ? 'PM' : 'AM'
  const hour12 = safeHour24 % 12 === 0 ? 12 : safeHour24 % 12

  return {
    hour24: safeHour24,
    hour12,
    minutes: safeMinutes,
    meridiem,
  }
}

function formatTimeValue(hour24: number, minutes: number) {
  return `${String(clampNumber(hour24, 0, 23)).padStart(2, '0')}:${String(clampNumber(minutes, 0, 59)).padStart(2, '0')}`
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min

  return Math.min(max, Math.max(min, value))
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-[21rem] overflow-hidden rounded-[1.9rem] p-0 transition-colors duration-300"
      :class="isDarkTheme ? 'border-slate-700/80' : 'border-slate-200/80'">
      <div :class="isDarkTheme ? 'bg-[#0F172A]' : 'bg-white'">
        <div class="flex items-center justify-between border-b px-5 py-4 transition-colors duration-300"
          :class="isDarkTheme ? 'border-slate-700/80' : 'border-slate-100'">
          <Button type="button" variant="ghost" size="icon-sm" class="rounded-full transition-colors" :class="isDarkTheme
            ? 'text-slate-300 hover:bg-[#1E293B]'
            : 'text-slate-500 hover:bg-slate-100'
            " @click="closeDialog">
            <X class="size-5" />
          </Button>

          <DialogTitle class="text-[1.65rem] font-semibold tracking-[-0.04em]"
            :class="isDarkTheme ? 'text-white' : 'text-slate-900'">
            {{ title }}
          </DialogTitle>
          
          <span class="inline-block h-8 w-8" aria-hidden="true" />
        </div>

        <div class="space-y-8 px-5 py-6">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <p class="text-[1.02rem] font-semibold tracking-[-0.02em]"
                :class="isDarkTheme ? 'text-white' : 'text-slate-800'">
                {{ enabledLabel }}
              </p>
              <p class="mt-1 text-sm leading-6" :class="isDarkTheme ? 'text-slate-300' : 'text-slate-400'">
                {{ enabledDescription }}
              </p>
            </div>

            <Switch v-model="draft.enabled" />
          </div>

          <div class="space-y-3">
            <p class="text-sm font-medium" :class="isDarkTheme ? 'text-slate-300' : 'text-slate-500'">
              Select Time
            </p>

            <div class="flex items-center gap-2 rounded-[0.9rem] px-3 py-2 transition-colors duration-300"
              :class="isDarkTheme ? 'bg-[#1E293B]' : 'bg-[#f4f6ff]'">
              <Clock3 class="size-4 shrink-0 text-blue-500" />

              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold tracking-[-0.02em]"
                  :class="isDarkTheme ? 'text-white' : 'text-slate-700'">
                  {{ formatDisplayTime(draft.time) }}
                </p>
              </div>
            </div>

            <TimeStepper
              left-label="Hour"
              right-label="Minute"
              :left-value="hourLabel"
              :right-value="minuteLabel"
              :meridiem="timeParts.meridiem"
              :theme="theme"
              @increase-left="stepHours(1)"
              @decrease-left="stepHours(-1)"
              @increase-right="stepMinutes(1)"
              @decrease-right="stepMinutes(-1)"
              @set-meridiem="setMeridiem"
            />

            <p v-if="timeHint" class="pl-1 text-sm" :class="isDarkTheme ? 'text-slate-400' : 'text-slate-400'">
              {{ timeHint }}
            </p>
          </div>

          <div v-if="showFrequency" class="space-y-4">
            <p class="text-sm font-medium" :class="isDarkTheme ? 'text-slate-300' : 'text-slate-500'">
              Frequency
            </p>

            <label class="flex items-center gap-3">
              <Checkbox v-model:model-value="draft.everyDay" />
              <span class="text-[1.02rem] font-semibold tracking-[-0.02em]"
                :class="isDarkTheme ? 'text-white' : 'text-slate-700'">
                Every day
              </span>
            </label>

            <label class="flex items-center gap-3">
              <Checkbox v-model:model-value="draft.weekdays" />
              <span class="text-[1.02rem] font-semibold tracking-[-0.02em]"
                :class="isDarkTheme ? 'text-white' : 'text-slate-700'">
                Weekdays
              </span>
            </label>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 px-5 py-4 transition-colors duration-300"
          :class="isDarkTheme ? 'bg-[#1E293B]' : 'bg-[#f5f7ff]'">
          <Button type="button" variant="ghost"
            class="px-3 text-base font-semibold text-blue-500 hover:bg-transparent hover:text-blue-600"
            @click="closeDialog">
            Cancel
          </Button>

          <Button type="button"
            class="h-11 rounded-xl bg-blue-500 px-6 text-base font-semibold shadow-[0_18px_32px_-18px_rgba(59,130,246,0.95)] hover:bg-blue-500/90"
            @click="saveChanges">
            Save
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
