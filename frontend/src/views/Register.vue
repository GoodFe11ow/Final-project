<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useRouter } from 'vue-router'
import { Eye } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const router = useRouter()

function handleSubmit() {
  router.push('/home')
}
</script>

<template>
  <main class="min-h-svh bg-[#f5f5f7] px-6 py-8 text-foreground">
    <section class="mx-auto flex w-full max-w-sm flex-col">
      
      <div class="pt-24">
        <h1 class="text-center text-5xl font-semibold tracking-tight">Sign up</h1>
      </div>

      <form class="mt-12 space-y-5" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/90" for="register-name">Name or username</label>
          <Input id="register-name" type="text" placeholder="Your name" autocomplete="name" class="h-12 rounded-xl bg-white/80" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/90" for="register-email">Email</label>
          <Input id="register-email" type="email" placeholder="Enter your email" autocomplete="email" class="h-12 rounded-xl bg-white/80" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/90" for="register-password">Password</label>
          <div class="relative">
            <Input
              id="register-password"
              type="password"
              placeholder="Create a password"
              autocomplete="new-password"
              class="h-12 rounded-xl bg-white/80 pr-11"
            />
            <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
              <Eye class="h-5 w-5" />
            </span>
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/90" for="register-confirm-password">Confirm Password</label>
          <div class="relative">
            <Input
              id="register-confirm-password"
              type="password"
              placeholder="Confirm your password"
              autocomplete="new-password"
              class="h-12 rounded-xl bg-white/80 pr-11"
            />
            <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted-foreground">
              <Eye class="h-5 w-5" />
            </span>
          </div>
        </div>

        <Button type="submit" class="mt-2 h-12 w-full bg-blue-500 rounded-xl text-base shadow-md">
          Create account
        </Button>
      </form>

      <p class="mt-8 text-center text-sm font-semibold text-primary">
        <RouterLink to="/login" class="text-blue-500">
          Already have an account? Log in
        </RouterLink>
      </p>
    </section>
  </main>
</template>
