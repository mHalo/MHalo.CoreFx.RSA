<template>
  <div class="page">
    <header class="page-header">
      <div class="page-header__icon">
        <n-icon size="20"><key-outline /></n-icon>
      </div>
      <div class="page-header__text">
        <div class="page-title">密钥生成</div>
        <div class="page-subtitle">生成 RSA 公钥 / 私钥对，支持多种格式与密钥长度</div>
      </div>
    </header>

    <!-- 顶部工具栏 -->
    <div class="rs-toolbar">
      <div class="rs-toolbar__field">
        <span class="rs-toolbar__label">密钥类型</span>
        <n-select v-model:value="keyType" :options="keyTypeOptions" style="width: 130px;" />
      </div>
      <div class="rs-toolbar__field">
        <span class="rs-toolbar__label">密钥格式</span>
        <n-select v-model:value="formatType" :options="formatOptions" style="width: 110px;" />
      </div>
      <div class="rs-toolbar__field">
        <span class="rs-toolbar__label">密钥长度</span>
        <n-select v-model:value="keySize" :options="keySizeOptions" style="width: 110px;" />
      </div>
      <div style="flex: 1;"></div>
      <n-button type="primary" :loading="generating" @click="handleGenerate">
        <template #icon>
          <n-icon><refresh-outline /></n-icon>
        </template>
        生成密钥
      </n-button>
    </div>

    <!-- 公钥 + 私钥 左右展示 -->
    <div class="rs-grid rs-grid-2">
      <!-- 公钥 -->
      <div class="rs-key-panel">
        <div class="rs-key-panel__header">
          <span class="rs-key-panel__label">
            <n-icon size="15"><megaphone-outline /></n-icon>公钥
          </span>
          <n-button v-if="keyPair.publicKey" size="tiny" quaternary @click="copyText(keyPair.publicKey)">
            <template #icon><n-icon><copy-outline /></n-icon></template>
            复制
          </n-button>
        </div>
        <div class="rs-key-panel__body">
          <n-input
            v-model:value="keyPair.publicKey"
            type="textarea"
            :rows="10"
            placeholder="公钥将显示在这里"
            readonly
            class="rs-input-readonly"
          />
        </div>
        <div v-if="keyPair.publicKey" class="rs-key-panel__footer">
          <span>密钥格式：{{ formatLabel }}</span>
          <key-type-tag :type="keyType" />
        </div>
      </div>

      <!-- 私钥 -->
      <div class="rs-key-panel">
        <div class="rs-key-panel__header">
          <span class="rs-key-panel__label">
            <n-icon size="15"><lock-closed-outline /></n-icon>私钥
          </span>
          <n-button v-if="keyPair.privateKey" size="tiny" quaternary @click="copyText(keyPair.privateKey)">
            <template #icon><n-icon><copy-outline /></n-icon></template>
            复制
          </n-button>
        </div>
        <div class="rs-key-panel__body">
          <n-input
            v-model:value="keyPair.privateKey"
            type="textarea"
            :rows="10"
            placeholder="私钥将显示在这里"
            readonly
            class="rs-input-readonly"
          />
        </div>
        <div v-if="keyPair.privateKey" class="rs-key-panel__footer">
          <span>密钥格式：{{ formatLabel }}</span>
          <key-type-tag :type="keyType" />
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <n-space v-if="keyPair.publicKey" style="margin-top: 20px;">
      <n-button type="primary" secondary @click="sendToCrypt">
        <template #icon><n-icon><arrow-forward-outline /></n-icon></template>
        发送到加密/解密
      </n-button>
      <n-button type="primary" secondary @click="sendToSign">
        <template #icon><n-icon><arrow-forward-outline /></n-icon></template>
        发送到签名/验签
      </n-button>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NSelect, NIcon, NSpace, NInput } from 'naive-ui'
import { RefreshOutline, CopyOutline, ArrowForwardOutline, KeyOutline, MegaphoneOutline, LockClosedOutline } from '@vicons/ionicons5'
import { RSAKeyType } from '@/types/rsa'
import { generateKeyPair } from '@/services/wasmRsaService'
import { useKeyStore } from '@/stores/keyStore'
import KeyTypeTag from '@/components/KeyTypeTag.vue'
import { useMessage } from 'naive-ui'

const router = useRouter()
const keyStore = useKeyStore()
const message = useMessage()

const keySize = ref(2048)
const keyType = ref<RSAKeyType>(RSAKeyType.Pkcs8)
const formatType = ref<'pem' | 'txt'>('pem')
const generating = ref(false)

const keyPair = reactive({ publicKey: '', privateKey: '' })

const formatLabel = computed(() => formatType.value === 'pem' ? 'PEM' : 'TXT')
const usePemFormat = computed(() => formatType.value === 'pem')

const keySizeOptions = [
  { label: '1024', value: 1024 },
  { label: '2048', value: 2048 },
  { label: '3072', value: 3072 },
  { label: '4096', value: 4096 }
]

const keyTypeOptions = [
  { label: 'Pkcs1', value: RSAKeyType.Pkcs1 },
  { label: 'Pkcs8', value: RSAKeyType.Pkcs8 },
  { label: 'XML', value: RSAKeyType.Xml }
]

const formatOptions = [
  { label: 'PEM', value: 'pem' },
  { label: 'TXT', value: 'txt' }
]

async function handleGenerate() {
  generating.value = true
  try {
    const result = await generateKeyPair(keyType.value, keySize.value, usePemFormat.value)
    keyPair.publicKey = result.publicKey
    keyPair.privateKey = result.privateKey
    message.success('密钥生成成功')
  } catch {
    message.error('密钥生成失败')
  } finally {
    generating.value = false
  }
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => message.success('已复制')).catch(() => message.error('复制失败'))
}

function sendToCrypt() {
  keyStore.setKeyPair(keyPair, { public: keyType.value, private: keyType.value })
  router.push({ name: 'crypt' })
}

function sendToSign() {
  keyStore.setKeyPair(keyPair, { public: keyType.value, private: keyType.value })
  router.push({ name: 'sign' })
}
</script>
