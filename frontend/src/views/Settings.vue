<script setup lang="ts">
import { useRouter } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'

const router = useRouter()
</script>

<template>
  <AppShell>
    <section class="flex flex-1 flex-col gap-4">
      <p class="text-sm text-muted-foreground">
        App preferences, account options and additional sections.
      </p>

      <button
        type="button"
        class="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-left text-sm font-medium text-card-foreground shadow-sm"
        @click="router.push('/stats')"
      >
        <span>Open stats</span>
        <span aria-hidden="true">></span>
      </button>
    </section>
  </AppShell>
</template>
