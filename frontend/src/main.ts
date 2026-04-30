import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import router from './router'
import { pinia } from './stores'
import { registerSW } from 'virtual:pwa-register'
import { useAuthStore } from './stores/auth'

 async function bootstrap() {
const app = createApp(App)

app.use(pinia)

const authStore = useAuthStore(pinia)
await authStore.fetchMe()

app.use(router)
app.mount('#app')

registerSW({ immediate: true })
}

void bootstrap()
