<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Rocket } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
</script>

<template>
  <main class="flex min-h-svh w-full items-center justify-center bg-[#f5f5f7] px-6 py-10 text-foreground">
    <section class="w-full max-w-sm rounded-3xl bg-background px-6 py-12 shadow-sm">
      <div class="mx-auto max-w-xs space-y-10 text-center">
        <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-primary">
          <Rocket class="h-7 w-7 text-white" />
        </div>

        <div class="space-y-2">
          <h1 class="text-3xl font-semibold tracking-tight">
            Productivity app
          </h1>
        </div>

        <div class="space-y-3">
          <Button as-child class="h-12 w-full rounded-xl text-base bg-blue-500 hover:bg-blue-600 shadow-sm">
            <RouterLink to="/login">
              Log In
            </RouterLink>
          </Button>
          <Button as-child variant="outline" class="h-12 w-full rounded-xl text-base text-primary">
            <RouterLink to="/register">
              Sign Up
            </RouterLink>
          </Button>
        </div>
      </div>
    </section>
  </main>
</template>
