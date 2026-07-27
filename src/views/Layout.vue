<template>
  <n-layout has-sider style="height: 100%">
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="220"
      show-trigger
    >
      <n-menu
        :value="activeKey"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        @update:value="handleMenuSelect"
      />
    </n-layout-sider>
    <n-layout>
      <n-layout-content content-style="padding: 24px;">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NIcon } from 'naive-ui'
import {
  KeyOutline,
  LockClosedOutline,
  CreateOutline,
  SwapHorizontalOutline,
  SettingsOutline
} from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()

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
</script>
