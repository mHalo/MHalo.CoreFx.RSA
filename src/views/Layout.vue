<template>
  <n-config-provider :theme="isDark ? darkTheme : null" :theme-overrides="themeOverrides">
    <n-layout has-sider style="height: 100vh">
      <n-layout-sider
        v-model:collapsed="collapsed"
        collapse-mode="width"
        :collapsed-width="64"
        :width="220"
        show-trigger
        :native-scrollbar="false"
        class="app-sider"
      >
        <div class="sidebar-logo">
          <div class="sidebar-logo__mark">
            <n-icon size="20" color="#fff">
              <key-outline />
            </n-icon>
          </div>
          <div v-if="!collapsed" class="sidebar-logo__text">
            <div class="sidebar-logo__name">RSA ToolBox</div>
            <div class="sidebar-logo__sub">跨平台版</div>
          </div>
        </div>
        <n-menu
          :value="activeKey"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
          @update:value="handleMenuSelect"
        />
        <div v-if="!collapsed" class="sidebar-footer">
          <span v-if="keyStore.wasmReady" class="wasm-status wasm-status--ok">
            <span class="wasm-status__dot" />核心已就绪
          </span>
          <span v-else-if="keyStore.wasmError" class="wasm-status wasm-status--err">
            <span class="wasm-status__dot" />核心加载失败
          </span>
          <span v-else class="wasm-status">
            <span class="wasm-status__dot wasm-status__dot--loading" />核心加载中…
          </span>
        </div>
      </n-layout-sider>
      <n-layout style="overflow: hidden">
        <n-layout-content
          :native-scrollbar="false"
          content-style="padding: 28px 36px; min-height: 100vh;"
        >
          <n-message-provider>
            <router-view />
          </n-message-provider>
        </n-layout-content>
      </n-layout>
    </n-layout>
  </n-config-provider>
</template>

<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NConfigProvider,
  NIcon,
  NMessageProvider,
  NLayout,
  NLayoutSider,
  NLayoutContent,
  NMenu,
  darkTheme
} from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'
import {
  KeyOutline,
  LockClosedOutline,
  CreateOutline,
  SwapHorizontalOutline,
  SettingsOutline
} from '@vicons/ionicons5'
import { useKeyStore } from '@/stores/keyStore'

const route = useRoute()
const router = useRouter()
const keyStore = useKeyStore()
const collapsed = ref(false)

const isDark = computed(() => keyStore.isDark)

watch(isDark, (value) => {
  if (value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}, { immediate: true })

const activeKey = computed(() => route.name as string)

function renderIcon(icon: any) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menuOptions = [
  { label: '密钥生成', key: 'generate', icon: renderIcon(KeyOutline) },
  { label: '加密 / 解密', key: 'crypt', icon: renderIcon(LockClosedOutline) },
  { label: '签名 / 验签', key: 'sign', icon: renderIcon(CreateOutline) },
  { label: '格式转换', key: 'transform', icon: renderIcon(SwapHorizontalOutline) },
  { label: '设置', key: 'settings', icon: renderIcon(SettingsOutline) }
]

function handleMenuSelect(key: string) {
  router.push({ name: key })
}

const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#3d5af1',
    primaryColorHover: '#5a73f4',
    primaryColorPressed: '#2f49c9',
    primaryColorSuppl: '#3d5af1',
    borderRadius: '6px',
    fontSize: '13px'
  },
  Card: {
    borderRadius: '12px'
  },
  Menu: {
    itemHeight: '40px',
    borderRadius: '8px'
  },
  Button: {
    borderRadiusMedium: '8px'
  },
  Input: {
    borderRadius: '8px'
  }
}
</script>

<style scoped>
.app-sider {
  border-right: 1px solid var(--n-border-color);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 20px 16px;
}

.sidebar-logo__mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: linear-gradient(135deg, #3d5af1 0%, #6a3df1 100%);
  flex-shrink: 0;
}

.sidebar-logo__name {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--n-text-color-base);
  white-space: nowrap;
  line-height: 1.3;
}

.sidebar-logo__sub {
  font-size: 11px;
  color: var(--n-text-color-3);
  white-space: nowrap;
  margin-top: 1px;
}

.sidebar-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 20px;
  border-top: 1px solid var(--n-divider-color);
  font-size: 12px;
}

.wasm-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--n-text-color-3);
  white-space: nowrap;
}

.wasm-status__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--n-text-color-3);
  flex-shrink: 0;
}

.wasm-status--ok {
  color: #059669;
}
.wasm-status--ok .wasm-status__dot {
  background: #059669;
}

.wasm-status--err {
  color: #d03050;
}
.wasm-status--err .wasm-status__dot {
  background: #d03050;
}

.wasm-status__dot--loading {
  animation: wasm-pulse 1.2s ease-in-out infinite;
}

@keyframes wasm-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
