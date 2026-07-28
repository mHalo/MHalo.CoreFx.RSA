<template>
  <div class="page">
    <header class="page-header">
      <div class="page-header__icon">
        <n-icon size="20"><swap-horizontal-outline /></n-icon>
      </div>
      <div class="page-header__text">
        <div class="page-title">密钥格式转换</div>
        <div class="page-subtitle">在 PKCS#1、PKCS#8、XML 等密钥格式之间相互转换</div>
      </div>
    </header>

    <!-- 上方：输入私钥 -->
    <div class="rs-key-panel" style="margin-bottom: 16px;">
      <div class="rs-key-panel__header">
        <span class="rs-key-panel__label">
          <n-icon size="15"><key-outline /></n-icon>输入私钥
        </span>
        <key-type-tag :type="inputPrivateKeyType" />
      </div>
      <div class="rs-key-panel__body">
        <n-input
          v-model:value="inputPrivateKey"
          type="textarea"
          :rows="6"
          placeholder="请输入私钥（支持自动识别格式）"
        />
      </div>
    </div>

    <!-- 中间：转换配置 + 按钮 -->
    <div class="rs-toolbar" style="justify-content: center;">
      <div class="rs-toolbar__field">
        <span class="rs-toolbar__label">目标密钥类型</span>
        <n-select v-model:value="targetPrivateType" :options="keyTypeOptions" style="width: 130px;" />
      </div>
      <div class="rs-toolbar__field">
        <span class="rs-toolbar__label">密钥格式</span>
        <n-select v-model:value="outputFormat" :options="formatOptions" style="width: 110px;" />
      </div>
      <n-button type="primary" :loading="processing" @click="handleTransform">
        <template #icon>
          <n-icon><swap-horizontal-outline /></n-icon>
        </template>
        转换密钥
      </n-button>
    </div>

    <!-- 下方：公钥 + 私钥 结果 -->
    <div class="rs-grid rs-grid-2">
      <div class="rs-key-panel">
        <div class="rs-key-panel__header">
          <span class="rs-key-panel__label">
            <n-icon size="15"><megaphone-outline /></n-icon>对应公钥
          </span>
          <n-button v-if="outputPublicKey" size="tiny" quaternary @click="copyText(outputPublicKey)">
            <template #icon><n-icon><copy-outline /></n-icon></template>
            复制
          </n-button>
        </div>
        <div class="rs-key-panel__body">
          <n-input
            v-model:value="outputPublicKey"
            type="textarea"
            :rows="8"
            placeholder="转换后的公钥将显示在这里"
            readonly
            class="rs-input-readonly"
          />
        </div>
        <div v-if="outputPublicKey" class="rs-key-panel__footer">
          <span>密钥格式：{{ outputFormatLabel }}</span>
          <key-type-tag :type="targetPrivateType" />
        </div>
      </div>

      <div class="rs-key-panel">
        <div class="rs-key-panel__header">
          <span class="rs-key-panel__label">
            <n-icon size="15"><lock-closed-outline /></n-icon>转换后私钥
          </span>
          <n-button v-if="outputPrivateKey" size="tiny" quaternary @click="copyText(outputPrivateKey)">
            <template #icon><n-icon><copy-outline /></n-icon></template>
            复制
          </n-button>
        </div>
        <div class="rs-key-panel__body">
          <n-input
            v-model:value="outputPrivateKey"
            type="textarea"
            :rows="8"
            placeholder="转换后的私钥将显示在这里"
            readonly
            class="rs-input-readonly"
          />
        </div>
        <div v-if="outputPrivateKey" class="rs-key-panel__footer">
          <span>密钥格式：{{ outputFormatLabel }}</span>
          <key-type-tag :type="targetPrivateType" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { NButton, NSelect, NIcon, NInput } from 'naive-ui'
import { SwapHorizontalOutline, CopyOutline, KeyOutline, MegaphoneOutline, LockClosedOutline } from '@vicons/ionicons5'
import { RSAKeyType } from '@/types/rsa'
import { transformPrivateKeyFormat, detectKeyType } from '@/services/wasmRsaService'
import KeyTypeTag from '@/components/KeyTypeTag.vue'
import { useMessage } from 'naive-ui'

const message = useMessage()

const targetPrivateType = ref<RSAKeyType>(RSAKeyType.Pkcs8)
const outputFormat = ref<'pem' | 'txt'>('pem')
const processing = ref(false)

const inputPrivateKey = ref('')
const outputPublicKey = ref('')
const outputPrivateKey = ref('')
const inputPrivateKeyType = ref<RSAKeyType | null>(null)

const outputFormatLabel = computed(() => outputFormat.value === 'pem' ? 'PEM' : 'TXT')
const usePemFormat = computed(() => outputFormat.value === 'pem')

const keyTypeOptions = [
  { label: 'Pkcs1', value: RSAKeyType.Pkcs1 },
  { label: 'Pkcs8', value: RSAKeyType.Pkcs8 },
  { label: 'XML', value: RSAKeyType.Xml }
]

const formatOptions = [
  { label: 'PEM', value: 'pem' },
  { label: 'TXT', value: 'txt' }
]

async function handleTransform() {
  if (!inputPrivateKey.value) {
    message.warning('请输入私钥')
    return
  }
  // 检测输入格式
  try {
    inputPrivateKeyType.value = await detectKeyType(inputPrivateKey.value, true)
  } catch {
    inputPrivateKeyType.value = null
  }
  processing.value = true
  try {
    const result = await transformPrivateKeyFormat(inputPrivateKey.value, targetPrivateType.value, usePemFormat.value)
    if (!result.success) {
      message.error('私钥格式转换失败')
      return
    }
    outputPublicKey.value = result.publicKey
    outputPrivateKey.value = result.privateKey
    message.success('转换成功')
  } catch (err) {
    message.error('转换失败：' + (err instanceof Error ? err.message : String(err)))
  } finally {
    processing.value = false
  }
}

function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => message.success('已复制')).catch(() => message.error('复制失败'))
}
</script>
