<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useRouter } from 'vue-router'
import { Eye, EyeOff } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const isPasswordVisible =ref(false)
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

async function handleSubmit() {
  errorMessage.value = ''

  try {
    isSubmitting.value = true

    await authStore.login({
      email: email.value,
      password: password.value,
    })

    router.push('/home')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Login failed'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <main class="min-h-svh bg-[#f5f5f7] px-6 py-8 text-foreground">
    <section class="mx-auto flex w-full max-w-sm flex-col">
      <div class="pt-28">
        <h1 class="text-center text-5xl font-semibold tracking-tight">Log in</h1>
      </div>

      <form class="mt-14 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/90" for="login-identity">Email</label>
          <Input id="login-identity" v-model="email" type="text" placeholder="Enter your email" autocomplete="username" class="h-12 rounded-xl bg-white/80" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/90" for="login-password">Password</label>
          <div class="relative">
            <Input
              id="login-password"
              v-model="password"
              :type="isPasswordVisible ? 'text' : 'password'"
              placeholder="Enter your password"
              autocomplete="current-password"
              class="h-12 rounded-xl bg-white/80 pr-11"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
              :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
              @click="isPasswordVisible = !isPasswordVisible"
            >
              <EyeOff v-if="isPasswordVisible" class="h-5 w-5" />
              <Eye v-else class="h-5 w-5" />
            </button>
          </div>
        </div>

        <Button type="submit" :disabled="isSubmitting" class="mt-2 h-12 w-full rounded-xl bg-blue-500 hover:bg-blue-600 text-base shadow-md">
          {{  isSubmitting ? 'Logging in...' : 'Log in' }}
        </Button>
        <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
      </form>

      <p class="mt-10 text-center text-sm text-foreground/70">
        Don't have an account?
        <RouterLink to="/register" class="font-semibold text-blue-500">
          Sign up
        </RouterLink>
      </p>
    </section>
  </main>
</template>
