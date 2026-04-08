<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Check, X } from 'lucide-vue-next'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import {
  formatDurationLabel,
  splitDurationSeconds,
} from '@/stores/timer-settings'

type DurationOption = {
  label?: string
  value: number
}

const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    description?: string
    selectedValue: number
    options: Array<number | DurationOption>
  }>(),
  {
    description: undefined,
  },
)

const emit = defineEmits<{
  'update:open': [value: boolean]
  select: [value: number]
}>()

const customMode = ref(false)
const customMinutes = ref('0')
const customSeconds = ref('00')

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
  const minutes = sanitizeNumber(customMinutes.value)
  const seconds = Math.min(59, sanitizeNumber(customSeconds.value))

  return minutes * 60 + seconds
})

const canApplyCustom = computed(() => customTotalSeconds.value > 0)

watch(
  () => [props.open, props.selectedValue, normalizedOptions.value.length] as const,
  ([isOpen]) => {
    if (!isOpen) return

    const { minutes, seconds } = splitDurationSeconds(props.selectedValue)

    customMode.value = !hasPresetMatch.value
    customMinutes.value = `${minutes}`
    customSeconds.value = String(seconds).padStart(2, '0')
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

  const normalizedSeconds = Math.min(59, sanitizeNumber(customSeconds.value))
  const normalizedMinutes = sanitizeNumber(customMinutes.value)
  const nextTotalSeconds = normalizedMinutes * 60 + normalizedSeconds

  customMinutes.value = `${normalizedMinutes}`
  customSeconds.value = String(normalizedSeconds).padStart(2, '0')
  selectDuration(nextTotalSeconds)
}

function sanitizeNumber(value: string) {
  const parsed = Number.parseInt(value, 10)

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="max-w-[23rem] overflow-hidden rounded-[1.9rem] border-slate-200/80 p-0">
      <div class="bg-white">
        <div class="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            class="rounded-full text-slate-500 hover:bg-slate-100"
            @click="closeDialog"
          >
            <X class="size-5" />
          </Button>

          <DialogTitle class="text-xl font-semibold tracking-[-0.03em]">
            {{ title }}
          </DialogTitle>

          <span class="inline-block h-8 w-8" aria-hidden="true" />
        </div>

        <div class="space-y-5 px-5 py-5">
          <div class="text-center">
            <p v-if="description" class="mx-auto max-w-[16rem] text-sm leading-6 text-slate-400">
              {{ description }}
            </p>
            <div
              class="mx-auto mt-4 inline-flex items-center rounded-full bg-[#eef2ff] px-4 py-2 text-sm font-semibold text-blue-500"
            >
              Current: {{ formatDurationLabel(selectedValue) }}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <button
              v-for="option in normalizedOptions"
              :key="option.value"
              type="button"
              class="flex min-h-14 items-center justify-between rounded-[1.15rem] border px-4 py-3 text-left transition-colors"
              :class="
                option.value === selectedValue && !customMode
                  ? 'border-blue-200 bg-[#eef4ff] text-blue-500 shadow-[0_18px_34px_-26px_rgba(59,130,246,0.45)]'
                  : 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50'
              "
              @click="selectDuration(option.value)"
            >
              <span class="text-sm font-semibold">{{ option.label }}</span>
              <Check
                v-if="option.value === selectedValue && !customMode"
                class="size-4 shrink-0 stroke-[2.5]"
              />
            </button>

            <button
              type="button"
              class="flex min-h-14 items-center justify-between rounded-[1.15rem] border px-4 py-3 text-left transition-colors"
              :class="
                customMode
                  ? 'border-blue-200 bg-[#eef4ff] text-blue-500 shadow-[0_18px_34px_-26px_rgba(59,130,246,0.45)]'
                  : 'border-slate-200/80 bg-white text-slate-700 hover:bg-slate-50'
              "
              @click="openCustomMode"
            >
              <span class="text-sm font-semibold">Custom</span>
              <Check
                v-if="customMode && !hasPresetMatch"
                class="size-4 shrink-0 stroke-[2.5]"
              />
            </button>
          </div>

          <div
            v-if="customMode"
            class="space-y-4 rounded-[1.4rem] border border-slate-200/80 bg-[#f8faff] p-4"
          >
            <div class="grid grid-cols-2 gap-3">
              <div class="space-y-2">
                <label class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Minutes
                </label>
                <Input
                  v-model="customMinutes"
                  type="number"
                  inputmode="numeric"
                  min="0"
                  class="h-11 rounded-xl border-slate-200/80 bg-white text-center text-base font-semibold shadow-none"
                />
              </div>

              <div class="space-y-2">
                <label class="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  Seconds
                </label>
                <Input
                  v-model="customSeconds"
                  type="number"
                  inputmode="numeric"
                  min="0"
                  max="59"
                  class="h-11 rounded-xl border-slate-200/80 bg-white text-center text-base font-semibold shadow-none"
                />
              </div>
            </div>

            <Button
              type="button"
              class="h-12 w-full rounded-xl bg-blue-500 text-sm font-semibold uppercase tracking-[0.08em] shadow-[0_18px_32px_-18px_rgba(59,130,246,0.95)] hover:bg-blue-500/90"
              :disabled="!canApplyCustom"
              @click="applyCustomDuration"
            >
              Apply {{ formatDurationLabel(customTotalSeconds) }}
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
