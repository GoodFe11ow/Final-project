<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { Check } from "lucide-vue-next"
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<CheckboxRootProps & {
  class?: HTMLAttributes["class"]
}>()
const emits = defineEmits<CheckboxRootEmits>()

const delegatedProps = reactiveOmit(props, "class")
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <CheckboxRoot
    v-bind="forwarded"
    :class="
      cn(
        'peer flex size-6 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white text-white shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-200 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
        props.class,
      )"
  >
    <CheckboxIndicator class="flex items-center justify-center">
      <Check class="size-3.5 stroke-[3]" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
