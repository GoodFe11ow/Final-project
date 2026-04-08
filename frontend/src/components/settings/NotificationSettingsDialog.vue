<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { ChevronUp, ChevronDown, Clock3, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'

type NotificationSettingsValue = {
  enabled: boolean
  time: string
  everyDay?: boolean
  weekdays?: boolean
}

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    enabledLabel: string
    enabledDescription: string
    value: NotificationSettingsValue
    showFrequency?: boolean
    timeHint?: string
  }>(),
  {
    showFrequency: false,
    timeHint: undefined,
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
  const meridiem = safeHour24 >= 12 ? 'PM' : 'AM'
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
    <DialogContent class="max-w-[21rem] overflow-hidden rounded-[1.9rem] border-slate-200/80 p-0">
      <div class="bg-white">
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <DialogTitle class="text-[1.65rem] font-semibold tracking-[-0.04em] text-slate-900">
            {{ title }}
          </DialogTitle>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            class="rounded-full text-slate-500 hover:bg-slate-100"
            @click="closeDialog"
          >
            <X class="size-5" />
          </Button>
        </div>

        <div class="space-y-8 px-5 py-6">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0 flex-1">
              <p class="text-[1.02rem] font-semibold tracking-[-0.02em] text-slate-800">
                {{ enabledLabel }}
              </p>
              <p class="mt-1 text-sm leading-6 text-slate-400">
                {{ enabledDescription }}
              </p>
            </div>

            <Switch v-model="draft.enabled" />
          </div>

          <div class="space-y-3">
            <p class="text-sm font-medium text-slate-500">
              Select Time
            </p>

            <div class="flex items-center gap-3 rounded-[1rem] bg-[#f4f6ff] px-4 py-3">
              <Clock3 class="size-5 shrink-0 text-blue-500" />

              <div class="min-w-0 flex-1">
                <p class="text-[1.02rem] font-semibold tracking-[-0.02em] text-slate-700">
                  {{ formatDisplayTime(draft.time) }}
                </p>
              </div>
            </div>

            <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-[1rem] border border-slate-200/80 bg-white p-3">
              <div class="space-y-2 text-center">
                <p class="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Hour
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  class="mx-auto rounded-full text-slate-500 hover:bg-slate-100"
                  @click="stepHours(1)"
                >
                  <ChevronUp class="size-4" />
                </Button>
                <div class="text-[1.35rem] font-semibold tracking-[-0.04em] text-slate-800">
                  {{ hourLabel }}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  class="mx-auto rounded-full text-slate-500 hover:bg-slate-100"
                  @click="stepHours(-1)"
                >
                  <ChevronDown class="size-4" />
                </Button>
              </div>

              <div class="pt-6 text-[1.35rem] font-semibold text-slate-300">
                :
              </div>

              <div class="space-y-2 text-center">
                <p class="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Minute
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  class="mx-auto rounded-full text-slate-500 hover:bg-slate-100"
                  @click="stepMinutes(1)"
                >
                  <ChevronUp class="size-4" />
                </Button>
                <div class="text-[1.35rem] font-semibold tracking-[-0.04em] text-slate-800">
                  {{ minuteLabel }}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  class="mx-auto rounded-full text-slate-500 hover:bg-slate-100"
                  @click="stepMinutes(-1)"
                >
                  <ChevronDown class="size-4" />
                </Button>
              </div>
            </div>

            <div class="flex items-center rounded-full bg-[#eef2ff] p-1">
              <button
                type="button"
                class="flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
                :class="
                  timeParts.meridiem === 'AM'
                    ? 'bg-white text-blue-500 shadow-sm'
                    : 'text-slate-500'
                "
                @click="setMeridiem('AM')"
              >
                AM
              </button>
              <button
                type="button"
                class="flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
                :class="
                  timeParts.meridiem === 'PM'
                    ? 'bg-white text-blue-500 shadow-sm'
                    : 'text-slate-500'
                "
                @click="setMeridiem('PM')"
              >
                PM
              </button>
            </div>

            <p v-if="timeHint" class="pl-1 text-sm text-slate-400">
              {{ timeHint }}
            </p>
          </div>

          <div v-if="showFrequency" class="space-y-4">
            <p class="text-sm font-medium text-slate-500">
              Frequency
            </p>

            <label class="flex items-center gap-3">
              <Checkbox v-model:model-value="draft.everyDay" />
              <span class="text-[1.02rem] font-semibold tracking-[-0.02em] text-slate-700">
                Every day
              </span>
            </label>

            <label class="flex items-center gap-3">
              <Checkbox v-model:model-value="draft.weekdays" />
              <span class="text-[1.02rem] font-semibold tracking-[-0.02em] text-slate-700">
                Weekdays
              </span>
            </label>
          </div>
        </div>

        <div class="flex items-center justify-end gap-3 bg-[#f5f7ff] px-5 py-4">
          <Button
            type="button"
            variant="ghost"
            class="px-3 text-base font-semibold text-blue-500 hover:bg-transparent hover:text-blue-600"
            @click="closeDialog"
          >
            Cancel
          </Button>

          <Button
            type="button"
            class="h-11 rounded-xl bg-blue-500 px-6 text-base font-semibold shadow-[0_18px_32px_-18px_rgba(59,130,246,0.95)] hover:bg-blue-500/90"
            @click="saveChanges"
          >
            Save
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
