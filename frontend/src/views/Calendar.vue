<script setup lang="ts">
import AppShell from '@/components/layout/AppShell.vue'
</script>

<template>
  <AppShell>
    <section class="flex flex-1 flex-col gap-4">
      <p class="text-sm text-muted-foreground">
        Placeholder for calendar view, upcoming tasks and schedule blocks.
      </p>

      <div class="rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
        <p class="text-xs text-muted-foreground">This week</p>
        <p class="mt-2 text-lg font-semibold">No events yet</p>
      </div>

      <div class="flex flex-1 items-center justify-center text-sm text-muted-foreground">
        Calendar timeline will live here.
      </div>
    </section>
  </AppShell>
</template>
