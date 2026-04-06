<script setup lang="ts">
import type { ProgressRootEmits, ProgressRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { computed } from "vue"
import { ProgressIndicator, ProgressRoot, useForwardPropsEmits } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<ProgressRootProps & {
  class?: HTMLAttributes["class"]
  indicatorClass?: HTMLAttributes["class"]
}>()
const emits = defineEmits<ProgressRootEmits>()

const delegatedProps = reactiveOmit(props, "class", "indicatorClass")
const forwarded = useForwardPropsEmits(delegatedProps, emits)

const value = computed(() => {
  const nextValue = Number(props.modelValue ?? 0)

  return Number.isFinite(nextValue)
    ? Math.min(100, Math.max(0, nextValue))
    : 0
})
</script>

<template>
  <ProgressRoot
    v-bind="forwarded"
    :model-value="value"
    :class="cn('relative h-2.5 w-full overflow-hidden rounded-full bg-slate-200/90', props.class)"
  >
    <ProgressIndicator
      :class="cn('h-full w-full rounded-full bg-blue-500 transition-transform duration-300 ease-out', props.indicatorClass)"
      :style="{ transform: `translateX(-${100 - value}%)` }"
    />
  </ProgressRoot>
</template>
