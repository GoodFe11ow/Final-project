<script setup lang="ts">
import AppShell from '@/components/layout/AppShell.vue'
</script>

<template>
  <AppShell>
    <section class="flex flex-1 flex-col gap-3">
      <p class="text-sm text-muted-foreground">
        Placeholder for your daily overview: focus sessions, key tasks and quick actions.
      </p>
      <div class="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          class="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          Start focus
        </button>
        <button
          type="button"
          class="rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium"
        >
          Add task
        </button>
      </div>
    </section>
  </AppShell>
</template>
