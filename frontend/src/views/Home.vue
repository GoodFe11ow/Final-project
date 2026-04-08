<script setup lang="ts">
import AppShell from '@/components/layout/AppShell.vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Clock3, Flame, Music2, Play, Plus } from 'lucide-vue-next'

type HomeTask = {
  title: string
  source: string
  progress?: string
  completed?: boolean
}

type QuickAction = {
  label: string
  icon: typeof Clock3
}

const router = useRouter()

const todayLabel = 'Thursday, 24 Oct'
const userName = 'User'

const currentTasks: HomeTask[] = [
  {
    title: 'Design System Audit',
    source: 'Component Library',
    progress: '1/2',
  },
  {
    title: 'Client Meeting Prep',
    source: 'Presentation Deck',
    progress: '0/4',
  },
  {
    title: 'Review Code PRs',
    source: 'Frontend Repo',
    completed: true,
  },
  {
    title: 'Weekly Planning',
    source: 'Notion',
    progress: '1/2',
  },
]

const quickActions: QuickAction[] = [
  {
    label: 'Custom Timer',
    icon: Clock3,
  },
  {
    label: 'Focus Sounds',
    icon: Music2,
  },
]
</script>

<template>
  <AppShell>
    <section class="flex flex-1 flex-col gap-5 pb-2">
      <div class="space-y-3 pt-1 text-center">
        <div
          class="mx-auto inline-flex rounded-full bg-slate-100/90 px-5 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-blue-500 shadow-[0_12px_24px_-20px_rgba(59,130,246,0.8)] ring-1 ring-slate-200/70"
        >
          Home
        </div>
        <p
          class="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-400"
        >
          {{ todayLabel }}
        </p>
        <h2
          class="mx-auto max-w-[16rem] text-[2rem] font-light leading-tight tracking-[-0.05em] text-slate-800 sm:max-w-none"
        >
          Welcome back,
          <span class="font-normal text-blue-400">{{ userName }}!</span>
        </h2>
      </div>

      <Card
        class="overflow-hidden rounded-[2rem] border-white/80 bg-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.28)]"
      >
        <CardContent class="p-0">
          <div class="flex items-center justify-between px-5 py-4">
            <p
              class="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-500"
            >
              Current Tasks
            </p>
            <Button
              type="button"
              size="icon-sm"
              class="size-7 rounded-full bg-blue-500 p-0 text-white shadow-[0_12px_24px_-18px_rgba(59,130,246,0.95)] hover:bg-blue-500/90"
              @click="router.push('/tasks')"
            >
              <Plus class="size-3.5" />
            </Button>
          </div>

          <div class="divide-y divide-slate-100">
            <article
              v-for="task in currentTasks"
              :key="task.title"
              class="flex items-center gap-3 px-5 py-4"
            >
              <div class="min-w-0 flex-1">
                <h3 class="truncate text-[1.08rem] font-medium tracking-[-0.02em] text-slate-800">
                  {{ task.title }}
                </h3>
                <p class="mt-0.5 text-sm text-slate-400">
                  {{ task.source }}
                </p>
              </div>

              <span
                v-if="task.completed"
                class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-500"
              >
                Done
              </span>
              <span
                v-else
                class="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
              >
                {{ task.progress }}
              </span>

              <span
                class="flex size-7 shrink-0 items-center justify-center rounded-full border"
                :class="
                  task.completed
                    ? 'border-blue-500 bg-blue-500 text-white'
                    : 'border-slate-200 bg-white text-transparent'
                "
              >
                <Check class="size-4" />
              </span>
            </article>
          </div>
        </CardContent>
      </Card>

      <Card
        class="rounded-[2rem] border-white/80 bg-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.26)]"
      >
        <CardContent class="space-y-4 p-5">
          <Button
            type="button"
            class="h-14 w-full rounded-[1.2rem] bg-blue-500 px-5 text-sm font-semibold uppercase tracking-[0.08em] text-white shadow-[0_18px_30px_-18px_rgba(59,130,246,0.95)] hover:bg-blue-500/90"
            @click="router.push('/focus')"
          >
            <span
              class="mr-2 flex size-7 items-center justify-center rounded-full bg-white text-blue-500 shadow-sm"
            >
              <Play class="size-4 fill-current" />
            </span>
            Start Focus Session
          </Button>

          <div class="grid grid-cols-2 gap-3">
            <Button
              v-for="action in quickActions"
              :key="action.label"
              type="button"
              variant="ghost"
              class="flex h-auto min-h-24 flex-col items-center justify-center gap-2 rounded-[1.35rem] bg-slate-50 px-3 py-4 text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] hover:bg-slate-100"
              @click="router.push('/focus')"
            >
              <component :is="action.icon" class="size-5 text-blue-500" />
              <span class="text-center text-sm font-medium leading-snug">
                {{ action.label }}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card
        class="rounded-[2rem] border-blue-100/60 bg-[linear-gradient(180deg,#eef5ff_0%,#f8fbff_100%)] shadow-[0_24px_60px_-34px_rgba(59,130,246,0.3)]"
      >
        <CardContent
          class="flex min-h-[9rem] flex-col items-center justify-center gap-2 p-6 text-center"
        >
          <p
            class="text-[0.78rem] font-semibold uppercase tracking-[0.24em] text-blue-400"
          >
            Daily Streak
          </p>
          <div class="flex items-center gap-2 text-[2.1rem] font-semibold tracking-[-0.05em] text-slate-800">
            <Flame class="size-5 text-orange-400" />
            <span>5 Days</span>
          </div>
        </CardContent>
      </Card>
    </section>
  </AppShell>
</template>
