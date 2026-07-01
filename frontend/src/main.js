import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useFinanceStore } from './stores/financeStore'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)

const financeStore = useFinanceStore(pinia)
financeStore.initState()

app.use(router)
app.mount('#app')
