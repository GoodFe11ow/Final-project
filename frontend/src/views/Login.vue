<script setup lang="ts">
import { ref, onBeforeUnmount, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useRouter } from 'vue-router'
import { Eye, EyeOff, LoaderCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/stores/auth'


const router = useRouter()
const authStore = useAuthStore()

const isPasswordVisible = ref(false)
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)
const isDemoSubmitting = ref(false)
const isDemoModeEnabled = import.meta.env.VITE_DEMO_MODE === 'true'
const googleButtonContainer = ref<HTMLElement | null>(null)
const isGoogleSubmitting = ref(false)
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string
            callback: (response: { credential?: string }) => void
          }) => void
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string>
          ) => void
          cancel: () => void
        }
      }
    }
  }
}

async function handleDemoLogin() {
  if (isSubmitting.value || isDemoSubmitting.value) return

  errorMessage.value = ''

  try {
    isDemoSubmitting.value = true

    await authStore.loginAsDemo()

    router.push('/home')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Demo login failed'
  } finally {
    isDemoSubmitting.value = false
  }
}

async function handleSubmit() {
  if (isSubmitting.value) return

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

function waitForGoogleClient() {
  return new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve()
      return
    }

    const maxAttempts = 50
    let attempts = 0

    const intervaId = window.setInterval(() => {
      attempts += 1

      if (window.google?.accounts?.id) {
        window.clearInterval(intervaId)
        reject(new Error('Google client failed to load'))
      }
    }, 100)
  })
}

async function handleGoogleCredential(response: { credential?: string }) {
  if (!response.credential || isSubmitting.value || isGoogleSubmitting.value) return

  errorMessage.value = ''

  try {
    isGoogleSubmitting.value = true

    await authStore.loginWithGoogle(response.credential)

    router.push('/home')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Google login failed'
  } finally {
    isGoogleSubmitting.value = false
  }
}


onMounted(async () => {
  if (!googleClientId) return
  if (!googleButtonContainer.value) return
  try {
    await waitForGoogleClient()

    if(!googleButtonContainer.value) return

    window.google!.accounts.id.initialize({
      client_id: googleClientId,
      callback: handleGoogleCredential,
    })

    googleButtonContainer.value.innerHTML = ''

    window.google!.accounts.id.renderButton(googleButtonContainer.value, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'continue_with',
      width: '320',
    })
  } catch (error) {

  }
})

onBeforeUnmount(() => {
  window.google?.accounts?.id.cancel()
})
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
          <Input id="login-identity" v-model="email" type="text" placeholder="Enter your email" autocomplete="username"
            class="h-12 rounded-xl bg-white/80" />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium text-foreground/90" for="login-password">Password</label>
          <div class="relative">
            <Input id="login-password" v-model="password" :type="isPasswordVisible ? 'text' : 'password'"
              placeholder="Enter your password" autocomplete="current-password"
              class="h-12 rounded-xl bg-white/80 pr-11" />
            <button type="button"
              class="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
              :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
              @click="isPasswordVisible = !isPasswordVisible">
              <EyeOff v-if="isPasswordVisible" class="h-5 w-5" />
              <Eye v-else class="h-5 w-5" />
            </button>
          </div>
        </div>

        <Button type="submit" :disabled="isSubmitting"
          class="mt-2 h-12 w-full rounded-xl bg-blue-500 hover:bg-blue-600 text-base shadow-md">
          <LoaderCircle v-if="isSubmitting" class="size-4 animate-spin" />
          {{ isSubmitting ? 'Logging in...' : 'Log in' }}
        </Button>
        <Button v-if="isDemoModeEnabled" type="button" variant="outline" :disabled="isSubmitting || isDemoSubmitting"
          class="h-12 w-full rounded-xl border-blue-200 text-base font-medium text-blue-500 hover:bg-blue-50 hover:text-blue-600"
          @click="handleDemoLogin">
          <LoaderCircle v-if="isDemoSubmitting" class="size-4 animate-spin" />
          {{ isDemoSubmitting ? 'Opening demo...' : 'Open Demo Workspace' }}
        </Button>
        <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
      </form>
      <div class="mt-4 space-y-3">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t border-slate-200" />
          </div>
          <div class="relative flex justify-center text-xs uppercase tracking-[0.16em] text-slate-400">
            <span class="bg-[#f5f5f7] px-3">or</span>
          </div>
        </div>

        <div class="flex justify-center">
          <div ref="googleButtonContainer" />
        </div>

        <p v-if="isGoogleSubmitting" class="text-center text-sm text-slate-500">
          Signing in with Google...
        </p>
      </div>

      <p class="mt-10 text-center text-sm text-foreground/70">
        Don't have an account?
        <RouterLink to="/register" class="font-semibold text-blue-500">
          Sign up
        </RouterLink>
      </p>
    </section>
  </main>
</template>
