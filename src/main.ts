import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'
import App from './App.vue'
import router from './router'
import { initializeRuntime } from './services/wasmRsaService'
import { useKeyStore } from './stores/keyStore'
import './style.css'

async function bootstrap() {
  const app = createApp(App)
  const pinia = createPinia()
  app.use(pinia)
  app.use(router)
  app.use(naive)
  app.mount('#app')

  // Initialize WASM runtime in the background so the UI renders immediately.
  const store = useKeyStore()
  try {
    await initializeRuntime()
    store.wasmReady = true
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    store.wasmError = msg
    console.error('Failed to initialize RSA ToolBox:', err)
  }
}

bootstrap()
