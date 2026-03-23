<script setup lang="ts">
import AppShell from '@/components/layout/AppShell.vue'
</script>

<template>
  <AppShell>
    <section class="flex flex-1 flex-col gap-4">
      <header>
        <h2 class="text-xl font-semibold">Stats</h2>
        <p class="text-sm text-muted-foreground">
          Placeholder for focus time, completed tasks and streaks.
        </p>
      </header>

      <div class="grid grid-cols-2 gap-3">
        <div class="rounded-lg border bg-card p-3 text-card-foreground shadow-sm">
          <p class="text-xs text-muted-foreground">Focus today</p>
          <p class="mt-2 text-lg font-semibold">0 min</p>
        </div>
        <div class="rounded-lg border bg-card p-3 text-card-foreground shadow-sm">
          <p class="text-xs text-muted-foreground">Tasks done</p>
          <p class="mt-2 text-lg font-semibold">0</p>
        </div>
      </div>

      <div class="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Charts and insights will go here.
      </div>
    </section>
  </AppShell>
</template>

