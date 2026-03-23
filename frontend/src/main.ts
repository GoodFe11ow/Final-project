import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import router from './router'
import { pinia } from './stores'
import { registerSW } from 'virtual:pwa-register'

const app = createApp(App)

app.use(pinia)
app.use(router)

app.mount('#app')

registerSW({ immediate: true })
