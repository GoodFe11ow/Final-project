import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import router from './router'
import { pinia } from './stores'
import { registerSW } from 'virtual:pwa-register'
import { useAuthStore } from './stores/auth'
import { useTasksStore } from './stores/tasks'
import { useSettingStore } from './stores/settings'
import { useTimerSettingsStore } from './stores/timer-settings'

async function bootstrap() {
const app = createApp(App)

app.use(pinia)

const authStore = useAuthStore(pinia)
await authStore.fetchMe()

const tasksStore = useTasksStore(pinia)
void tasksStore.ensureTasksLoaded()

const settingsStore = useSettingStore(pinia)
await settingsStore.ensureSettingsLoaded()

const timerSettingsStore = useTimerSettingsStore(pinia)
timerSettingsStore.applySettings(
  settingsStore.settings.focusDurationSeconds,
  settingsStore.settings.breakDurationSeconds,
)

app.use(router)
app.mount('#app')

registerSW({ immediate: true })
}

void bootstrap()
