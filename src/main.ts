import { createApp } from 'vue'
import { createPinia } from 'pinia'
import naive from 'naive-ui'
import App from './App.vue'
import router from './router'
import { initializeRuntime } from './services/wasmRsaService'
import './style.css'

async function bootstrap() {
  await initializeRuntime()

  const app = createApp(App)
  app.use(createPinia())
  app.use(router)
  app.use(naive)
  app.mount('#app')
}

bootstrap().catch((err) => {
  console.error('Failed to initialize RSA ToolBox:', err)
})
