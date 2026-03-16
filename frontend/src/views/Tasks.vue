<script setup lang="ts">
import AppShell from '@/components/layout/AppShell.vue'
</script>

<template>
  <AppShell>
    <section class="flex flex-1 flex-col gap-4">
      <header class="flex flex-col gap-2">
        <h2 class="text-xl font-semibold">Tasks</h2>
        <p class="text-sm text-muted-foreground">
          Placeholder for your task lists, filters and quick add.
        </p>
      </header>

      <div class="rounded-lg border bg-card p-3 text-card-foreground shadow-sm">
        <form class="flex items-center gap-2">
          <input
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Quick add task…"
          />
        </form>
      </div>

      <div class="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Task list will live here.
      </div>
    </section>
  </AppShell>
</template>

