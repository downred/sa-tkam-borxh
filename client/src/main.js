import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import pinia from './stores'
import { useAuthStore } from './stores/auth'
import './style.css'

const app = createApp(App)

app.use(pinia)
app.use(router)

// Initialize auth store (fetch user if token exists)
const authStore = useAuthStore()
authStore.init()

app.mount('#app')
