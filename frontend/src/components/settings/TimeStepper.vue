<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDown, ChevronUp } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

type SettingsThemeMode = 'light' | 'dark'
type Meridiem = 'AM' | 'PM'

const props = withDefaults(
  defineProps<{
    leftLabel: string
    rightLabel: string
    leftValue: string
    rightValue: string
    theme?: SettingsThemeMode
    meridiem?: Meridiem
  }>(),
  {
    theme: 'light',
    meridiem: undefined,
  },
)

const emit = defineEmits<{
  'increase-left': []
  'decrease-left': []
  'increase-right': []
  'decrease-right': []
  'set-meridiem': [value: Meridiem]
}>()

const isDarkTheme = computed(() => props.theme === 'dark')
const touchStartY = ref<number | null>(null)

// Tune these classes when checking tap/swipe comfort on different mobile screens.
const valueButtonClass = 'mx-auto flex h-9 min-w-16 touch-none select-none items-center justify-center rounded-xl text-lg font-semibold leading-none tracking-[-0.04em] transition-colors'
const swipeThresholdPx = 16

function stepValue(side: 'left' | 'right', direction: 1 | -1) {
  if (side === 'left') {
    if (direction === 1) {
      emit('increase-left')
      return
    }

    emit('decrease-left')
    return
  }

  if (direction === 1) {
    emit('increase-right')
    return
  }

  emit('decrease-right')
}

function handleWheel(event: WheelEvent, side: 'left' | 'right') {
  const direction = event.deltaY < 0 ? 1 : -1

  stepValue(side, direction)
}

function handleTouchStart(event: TouchEvent) {
  touchStartY.value = event.touches[0]?.clientY ?? null
}

function handleTouchEnd(event: TouchEvent, side: 'left' | 'right') {
  if (touchStartY.value === null) return

  const touchEndY = event.changedTouches[0]?.clientY ?? touchStartY.value
  const deltaY = touchStartY.value - touchEndY

  touchStartY.value = null

  if (Math.abs(deltaY) < swipeThresholdPx) return

  stepValue(side, deltaY > 0 ? 1 : -1)
}
</script>

<template>
  <div
    class="rounded-[0.9rem] border p-2 transition-colors duration-300"
    :class="
      isDarkTheme
        ? 'border-slate-600/80 bg-[#334155]'
        : 'border-slate-200/80 bg-white'
    "
  >
    <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <div class="space-y-0.5 text-center">
        <p
          class="text-[0.62rem] font-semibold uppercase tracking-[0.12em]"
          :class="isDarkTheme ? 'text-slate-300' : 'text-slate-400'"
        >
          {{ leftLabel }}
        </p>

        <Button
          type="button"
          variant="ghost"
          class="mx-auto h-6 w-6 rounded-full p-0 transition-colors"
          :class="
            isDarkTheme
              ? 'text-slate-200 hover:bg-[#1E293B]'
              : 'text-slate-500 hover:bg-slate-100'
          "
          @click="emit('increase-left')"
        >
          <ChevronUp class="size-3.5" />
        </Button>

        <button
          type="button"
          :class="[
            valueButtonClass,
            isDarkTheme
              ? 'text-white hover:bg-[#1E293B]'
              : 'text-slate-800 hover:bg-slate-50',
          ]"
          @wheel.prevent="handleWheel($event, 'left')"
          @touchstart.passive="handleTouchStart"
          @touchend.prevent="handleTouchEnd($event, 'left')"
        >
          {{ leftValue }}
        </button>

        <Button
          type="button"
          variant="ghost"
          class="mx-auto h-6 w-6 rounded-full p-0 transition-colors"
          :class="
            isDarkTheme
              ? 'text-slate-200 hover:bg-[#1E293B]'
              : 'text-slate-500 hover:bg-slate-100'
          "
          @click="emit('decrease-left')"
        >
          <ChevronDown class="size-3.5" />
        </Button>
      </div>

      <div class="pt-4 text-lg font-semibold" :class="isDarkTheme ? 'text-slate-500' : 'text-slate-300'">
        :
      </div>

      <div class="space-y-0.5 text-center">
        <p
          class="text-[0.62rem] font-semibold uppercase tracking-[0.12em]"
          :class="isDarkTheme ? 'text-slate-300' : 'text-slate-400'"
        >
          {{ rightLabel }}
        </p>

        <Button
          type="button"
          variant="ghost"
          class="mx-auto h-6 w-6 rounded-full p-0 transition-colors"
          :class="
            isDarkTheme
              ? 'text-slate-200 hover:bg-[#1E293B]'
              : 'text-slate-500 hover:bg-slate-100'
          "
          @click="emit('increase-right')"
        >
          <ChevronUp class="size-3.5" />
        </Button>

        <button
          type="button"
          :class="[
            valueButtonClass,
            isDarkTheme
              ? 'text-white hover:bg-[#1E293B]'
              : 'text-slate-800 hover:bg-slate-50',
          ]"
          @wheel.prevent="handleWheel($event, 'right')"
          @touchstart.passive="handleTouchStart"
          @touchend.prevent="handleTouchEnd($event, 'right')"
        >
          {{ rightValue }}
        </button>

        <Button
          type="button"
          variant="ghost"
          class="mx-auto h-6 w-6 rounded-full p-0 transition-colors"
          :class="
            isDarkTheme
              ? 'text-slate-200 hover:bg-[#1E293B]'
              : 'text-slate-500 hover:bg-slate-100'
          "
          @click="emit('decrease-right')"
        >
          <ChevronDown class="size-3.5" />
        </Button>
      </div>
    </div>

    <div
      v-if="meridiem"
      class="mt-2 flex items-center rounded-full p-0.5 transition-colors duration-300"
      :class="isDarkTheme ? 'bg-[#1E293B]' : 'bg-[#eef2ff]'"
    >
      <button
        type="button"
        class="flex-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors"
        :class="
          meridiem === 'AM'
            ? isDarkTheme
              ? 'bg-[#334155] text-blue-400 shadow-sm'
              : 'bg-white text-blue-500 shadow-sm'
            : isDarkTheme
              ? 'text-slate-300'
              : 'text-slate-500'
        "
        @click="emit('set-meridiem', 'AM')"
      >
        AM
      </button>

      <button
        type="button"
        class="flex-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors"
        :class="
          meridiem === 'PM'
            ? isDarkTheme
              ? 'bg-[#334155] text-blue-400 shadow-sm'
              : 'bg-white text-blue-500 shadow-sm'
            : isDarkTheme
              ? 'text-slate-300'
              : 'text-slate-500'
        "
        @click="emit('set-meridiem', 'PM')"
      >
        PM
      </button>
    </div>
  </div>
</template>
