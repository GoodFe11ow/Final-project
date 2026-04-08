<script setup lang="ts">
import type { SwitchRootEmits, SwitchRootProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { SwitchRoot, SwitchThumb, useForwardPropsEmits } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<
  SwitchRootProps & {
    class?: HTMLAttributes['class']
  }
>()

const emits = defineEmits<SwitchRootEmits>()

const delegatedProps = reactiveOmit(props, 'class')
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <SwitchRoot
    v-bind="forwarded"
    :class="
      cn(
        'peer inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-slate-200 bg-slate-200 p-0.5 shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-blue-200 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50',
        props.class,
      )"
  >
    <SwitchThumb
      class="block size-6 rounded-full bg-white shadow-sm transition-transform duration-200 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
    />
  </SwitchRoot>
</template>
