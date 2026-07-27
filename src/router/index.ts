import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout.vue'
import RsaKeyGenerateView from '@/views/RsaKeyGenerateView.vue'
import RsaCryptView from '@/views/RsaCryptView.vue'
import RsaSignView from '@/views/RsaSignView.vue'
import RsaTransKeyFormatView from '@/views/RsaTransKeyFormatView.vue'
import SettingsView from '@/views/SettingsView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Layout,
      redirect: { name: 'generate' },
      children: [
        { path: 'generate', name: 'generate', component: RsaKeyGenerateView },
        { path: 'crypt', name: 'crypt', component: RsaCryptView },
        { path: 'sign', name: 'sign', component: RsaSignView },
        { path: 'transform', name: 'transform', component: RsaTransKeyFormatView },
        { path: 'settings', name: 'settings', component: SettingsView }
      ]
    }
  ]
})

export default router
