<script setup lang="ts">
import { computed, useId, type HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'
import type { ChartConfig } from './types'

const props = defineProps<{
  config: ChartConfig
  class?: HTMLAttributes['class']
}>()

const chartId = useId()

const chartStyles = computed(() => {
  return Object.fromEntries(
    Object.entries(props.config).flatMap(([key, item]) =>
      item.color ? [[`--color-${key}`, item.color]] : [],
    ),
  )
})
</script>

<template>
  <div
    :data-chart="chartId"
    :class="
      cn(
        'w-full text-xs',
        props.class,
      )
    "
    :style="chartStyles"
  >
    <slot />
  </div>
</template>
