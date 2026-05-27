<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Check, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  formatDurationLabel,
} from '@/lib/timer-duration'

type DurationOption = {
  label?: string
  value: number
}

type SettingsThemeMode = 'light' | 'dark'

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    description?: string
    selectedValue: number
    options: Array<number | DurationOption>
    theme?: SettingsThemeMode
  }>(),
  {
    description: undefined,
    theme: 'light',
  },
)

const allowedControlKeys = new Set([
  'Backspace',
  'Delete',
  'ArrowLeft',
  'ArrowRight',
  'Tab',
  'Home',
  'End'
])

const emit = defineEmits<{
  'update:open': [value: boolean]
  select: [value: number]
}>()

const customMode = ref(false)
const MIN_CUSTOM_DURATION_SECONDS = 60
const customMinutes = ref('1')

const normalizedOptions = computed(() => {
  return props.options.map((option) =>
    typeof option === 'number'
      ? { value: option, label: formatDurationLabel(option) }
      : {
        value: option.value,
        label: option.label ?? formatDurationLabel(option.value),
      },
  )
})

const hasPresetMatch = computed(() => {
  return normalizedOptions.value.some((option) => option.value === props.selectedValue)
})

const customTotalSeconds = computed(() => {
  const minutes = Math.min(360, sanitizeNumber(customMinutes.value))

  return minutes * 60
})

const canApplyCustom = computed(() => customTotalSeconds.value >= MIN_CUSTOM_DURATION_SECONDS)
const isDarkTheme = computed(() => props.theme === 'dark')

watch(
  () => [props.open, props.selectedValue, normalizedOptions.value.length] as const,
  ([isOpen]) => {
    if (!isOpen) return

    const minutes = Math.max(1, Math.ceil(props.selectedValue / 60))

    customMode.value = !hasPresetMatch.value
    customMinutes.value = `${minutes}`
  },
  { immediate: true },
)

function closeDialog() {
  emit('update:open', false)
}

function selectDuration(value: number) {
  emit('select', value)
  emit('update:open', false)
}

function openCustomMode() {
  customMode.value = true
}

function applyCustomDuration() {
  if (!canApplyCustom.value) return

  const normalizedMinutes = clampNumber(sanitizeNumber(customMinutes.value), 1, 360)
  const nextTotalSeconds = normalizedMinutes * 60

  if (nextTotalSeconds < MIN_CUSTOM_DURATION_SECONDS) return

  customMinutes.value = `${normalizedMinutes}`
  selectDuration(nextTotalSeconds)
}

function sanitizeNumber(value: string) {
  const parsed = Number.parseInt(value, 10)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function clampNumber(value: number, min: number, max: number) {
  if (!Number.isFinite(value)) return min

  return Math.min(max, Math.max(min, value))
}

function handleMinutesBeforeInput(event: InputEvent) {
  if (event.inputType.startsWith('delete')) return
  if (!event.data) return

  if (!/^\d$/.test(event.data)) {
    event.preventDefault()
  }
}

function handleMinutesKeydown(event: KeyboardEvent) {
  if (
    allowedControlKeys.has(event.key) ||
    event.ctrlKey ||
    event.metaKey
  ) {
    return
  }

  if (!/^\d$/.test(event.key)) {
    event.preventDefault()
  }
}

function handleMinutesPaste(event: ClipboardEvent) {
  const pastedText = event.clipboardData?.getData('text/plain').trim() ?? ''

  if (!/^\d{1,3}$/.test(pastedText)) {
    event.preventDefault()
    return
  }

  event.preventDefault()
  customMinutes.value = pastedText
}

function handleMinutesInput(event: Event) {
  const target = event.target as HTMLInputElement
  customMinutes.value = target.value.slice(0, 3)
}

function normalizeCustomMinutes() {
  if (!customMinutes.value.trim()) return

  const normalizedMinutes = clampNumber(
    sanitizeNumber(customMinutes.value),
    1,
    360
  )

  customMinutes.value = `${normalizedMinutes}`
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-[23rem] overflow-hidden rounded-[1.9rem] p-0 transition-colors duration-300"
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

          <DialogTitle class="text-xl font-semibold tracking-[-0.03em]"
            :class="isDarkTheme ? 'text-white' : 'text-slate-900'">
            {{ title }}
          </DialogTitle>

          <span class="inline-block h-8 w-8" aria-hidden="true" />
        </div>

        <div class="space-y-5 px-5 py-5">
          <div class="text-center">
            <p v-if="description" class="mx-auto max-w-[16rem] text-sm leading-6"
              :class="isDarkTheme ? 'text-slate-300' : 'text-slate-400'">
              {{ description }}
            </p>
            <div
              class="mx-auto mt-4 inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-300"
              :class="isDarkTheme
                ? 'bg-[#1E293B] text-blue-400'
                : 'bg-[#eef2ff] text-blue-500'
                ">
              Current: {{ formatDurationLabel(selectedValue) }}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button v-for="option in normalizedOptions" :key="option.value" type="button"
              class="flex min-h-14 items-center justify-between rounded-[1.15rem] border px-4 py-3 text-left transition-colors"
              :class="option.value === selectedValue && !customMode
                ? 'border-blue-200 bg-[#eef4ff] text-blue-500 shadow-[0_18px_34px_-26px_rgba(59,130,246,0.45)]'
                : isDarkTheme
                  ? 'border-slate-600/80 bg-[#334155] text-white hover:bg-[#3f4d61]'
                  : 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50'
                " @click="selectDuration(option.value)">
              <span class="text-sm font-semibold">{{ option.label }}</span>
              <Check v-if="option.value === selectedValue && !customMode" class="size-4 shrink-0 stroke-[2.5]" />
            </button>

            <button type="button"
              class="flex min-h-14 items-center justify-between rounded-[1.15rem] border px-4 py-3 text-left transition-colors"
              :class="customMode
                ? 'border-blue-200 bg-[#eef4ff] text-blue-500 shadow-[0_18px_34px_-26px_rgba(59,130,246,0.45)]'
                : isDarkTheme
                  ? 'border-slate-600/80 bg-[#334155] text-white hover:bg-[#3f4d61]'
                  : 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50'
                " @click="openCustomMode">
              <span class="text-sm font-semibold">Custom</span>
              <Check v-if="customMode && !hasPresetMatch" class="size-4 shrink-0 stroke-[2.5]" />
            </button>
          </div>

          <div v-if="customMode" class="space-y-4 rounded-[1.4rem] border p-4 transition-colors duration-300" :class="isDarkTheme
            ? 'border-slate-600/80 bg-[#1E293B]'
            : 'border-slate-200/80 bg-[#f8faff]'
            ">
            <div class="space-y-2 text-center">
              <p class="text-[0.68rem] font-semibold uppercase tracking-[0.14em]"
                :class="isDarkTheme ? 'text-slate-300' : 'text-slate-400'">
                Minutes
              </p>

              <input :value="customMinutes" type="text" inputmode="numeric" maxlength="3" placeholder="25"
                class="mx-auto block h-16 w-28 rounded-[1.15rem] border text-center text-[2.15rem] font-semibold leading-none tracking-[-0.06em] outline-none transition-colors duration-300"
                :class="isDarkTheme
                    ? 'border-slate-600/80 bg-[#334155] text-white placeholder:text-slate-500'
                    : 'border-slate-200/80 bg-white text-slate-800 placeholder:text-slate-300'
                  " @beforeinput="handleMinutesBeforeInput" @keydown="handleMinutesKeydown" @paste="handleMinutesPaste"
                @input="handleMinutesInput" @blur="normalizeCustomMinutes" />
            </div>

            <Button type="button"
              class="h-12 w-full rounded-xl bg-blue-500 text-sm font-semibold uppercase tracking-[0.08em] shadow-[0_18px_32px_-18px_rgba(59,130,246,0.95)] hover:bg-blue-500/90"
              :disabled="!canApplyCustom" @click="applyCustomDuration">
              Apply {{ formatDurationLabel(customTotalSeconds) }}
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
