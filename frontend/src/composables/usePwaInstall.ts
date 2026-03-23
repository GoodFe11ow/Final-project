import { computed, onMounted, onBeforeUnmount, ref } from 'vue'

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null)
const isInstalled = ref(false)

function detectStandaloneMode() {
  return window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true
}

export function usePwaInstall() {
  const canInstall = computed(() => !isInstalled.value && deferredPrompt.value !== null)

  const onBeforeInstallPrompt = (event: Event) => {
    event.preventDefault()
    deferredPrompt.value = event as BeforeInstallPromptEvent
  }

  const onInstalled = () => {
    isInstalled.value = true
    deferredPrompt.value = null
  }

  onMounted(() => {
    isInstalled.value = detectStandaloneMode()
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onInstalled)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.removeEventListener('appinstalled', onInstalled)
  })

  async function install() {
    if (!deferredPrompt.value) return

    await deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice

    if (outcome === 'accepted') {
      deferredPrompt.value = null
    }
  }

  return {
    canInstall,
    install,
  }
}
