import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import router from './router'
import { pinia } from './stores'
import { registerSW } from 'virtual:pwa-register'
import { useAuthStore } from './stores/auth'
import { useTasksStore } from './stores/tasks'
import { useSettingStore } from './stores/settings'
import { ensurePushSubscription } from './lib/push.ts'

async function bootstrap() {
    const app = createApp(App)

    app.use(pinia)

    const authStore = useAuthStore(pinia)
    await authStore.fetchMe()

    const tasksStore = useTasksStore(pinia)
    void tasksStore.ensureTasksLoaded()

    const settingsStore = useSettingStore(pinia)
    await settingsStore.ensureSettingsLoaded()

    app.use(router)
    app.mount('#app')

    registerSW({ immediate: true,

        onRegisteredSW(_swScriptUrl, registration) {
            if(!registration || !authStore.token) return

            void ensurePushSubscription(authStore.token).catch((error) => {
                console.error('Failed to ensure push subscription', error)
            })
        },
        onRegisterError(error) {
            console.error('Failed to register service worker', error);
        },
    })    
}

void bootstrap()
