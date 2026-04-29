<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useRouter } from 'vue-router'
import { Eye, EyeOff } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiRequest } from '@/lib/api'

const router = useRouter()
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

async function handleSubmit() {
  errorMessage.value = ''

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Password do not match'
    return
  }

  try {
    isSubmitting.value = true

    await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: name.value,
        email: email.value,
        password: password.value,
      }),
    })

    router.push('/login')
  } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : "Registration failed"
  } finally {
    isSubmitting.value = false
  }
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
          <Input id="register-name" v-model="name" type="text" placeholder="Your name" autocomplete="name" class="h-12 rounded-xl bg-white/80" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/90" for="register-email">Email</label>
          <Input id="register-email" v-model="email" type="email" placeholder="Enter your email" autocomplete="email" class="h-12 rounded-xl bg-white/80" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/90" for="register-password">Password</label>
          <div class="relative">
            <Input
              id="register-password"
              v-model="password"
              :type="isPasswordVisible ? 'text' : 'password'"
              placeholder="Create a password"
              autocomplete="new-password"
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
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/90" for="register-confirm-password">Confirm Password</label>
          <div class="relative">
            <Input
              id="register-confirm-password"
              v-model="confirmPassword"
              :type="isConfirmPasswordVisible ? 'text' : 'password'"
              placeholder="Confirm your password"
              autocomplete="new-password"
              class="h-12 rounded-xl bg-white/80 pr-11"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
              :aria-label="isConfirmPasswordVisible ? 'Hide confirm password' : 'Show confirm password'"
              @click="isConfirmPasswordVisible = !isConfirmPasswordVisible"
            >
              <EyeOff v-if="isConfirmPasswordVisible" class="h-5 w-5" />
              <Eye v-else class="h-5 w-5" />
            </button>
          </div>
        </div>

        <Button type="submit" :disabled="isSubmitting" class="mt-2 h-12 w-full bg-blue-500 hover:bg-blue-600 rounded-xl text-base shadow-md">
          {{ isSubmitting ? 'Create account...' : 'Create account' }}
        </Button>
        <p v-if="errorMessage" class="text-sm text-red-500">
          {{ errorMessage }}
        </p>
      </form>

      <p class="mt-8 text-center text-sm font-semibold text-primary">
        <RouterLink to="/login" class="text-blue-500 ">
          Already have an account? Log in
        </RouterLink>
      </p>
    </section>
  </main>
</template>
