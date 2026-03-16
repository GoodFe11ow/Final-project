<script setup lang="ts">
import AppShell from '@/components/layout/AppShell.vue'
</script>

<template>
  <AppShell>
    <section class="flex flex-1 flex-col gap-4">
      <header>
        <h2 class="text-xl font-semibold">Focus</h2>
        <p class="text-sm text-muted-foreground">
          Placeholder for focus timer, sessions and breaks.
        </p>
      </header>

      <div
        class="flex flex-col items-center gap-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm"
      >
        <div class="text-5xl font-semibold tracking-tight">25:00</div>
        <p class="text-xs uppercase tracking-wide text-muted-foreground">
          Focus session
        </p>
        <button
          type="button"
          class="h-11 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground"
        >
          Start
        </button>
      </div>
    </section>
  </AppShell>
</template>

