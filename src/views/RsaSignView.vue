<template>
  <div class="page">
    <header class="page-header">
      <div class="page-header__icon">
        <n-icon size="20"><create-outline /></n-icon>
      </div>
      <div class="page-header__text">
        <div class="page-title">签名 / 验签</div>
        <div class="page-subtitle">使用私钥签名数据、使用公钥验证签名完整性</div>
      </div>
    </header>

    <!-- 上方：公钥 + 私钥 -->
    <div class="rs-grid rs-grid-2" style="margin-bottom: 16px;">
      <div class="rs-key-panel">
        <div class="rs-key-panel__header">
          <span class="rs-key-panel__label">
            <n-icon size="15"><megaphone-outline /></n-icon>公钥
          </span>
          <key-type-tag :type="publicKeyType" />
        </div>
        <div class="rs-key-panel__body">
          <n-input
            v-model:value="publicKey"
            type="textarea"
            :rows="5"
            placeholder="请输入或粘贴公钥"
          />
        </div>
      </div>
      <div class="rs-key-panel">
        <div class="rs-key-panel__header">
          <span class="rs-key-panel__label">
            <n-icon size="15"><key-outline /></n-icon>私钥
          </span>
          <key-type-tag :type="privateKeyType" />
        </div>
        <div class="rs-key-panel__body">
          <n-input
            v-model:value="privateKey"
            type="textarea"
            :rows="5"
            placeholder="请输入或粘贴私钥"
          />
        </div>
      </div>
    </div>

    <!-- 中间：签名算法 + 操作按钮 -->
    <div class="rs-toolbar" style="justify-content: center;">
      <div class="rs-toolbar__field">
        <span class="rs-toolbar__label">签名算法</span>
        <n-select v-model:value="signerAlgorithm" :options="signerOptions" style="width: 200px;" />
      </div>
      <n-divider vertical />
      <n-button type="primary" :loading="processing === 'sign'" @click="handleSign">
        <template #icon><n-icon><create-outline /></n-icon></template>
        私钥签名
      </n-button>
      <n-button secondary :loading="processing === 'verify'" @click="handleVerify">
        <template #icon><n-icon><shield-checkmark-outline /></n-icon></template>
        公钥验签
      </n-button>
    </div>

    <!-- 下方：原文 + 结果 -->
    <div class="rs-grid rs-grid-2">
      <div class="rs-source-panel">
        <div class="rs-source-panel__header">
          <span class="rs-key-panel__label">
            <n-icon size="15"><document-text-outline /></n-icon>原文 / 数据
          </span>
        </div>
        <div class="rs-source-panel__body">
          <n-input
            v-model:value="plainText"
            type="textarea"
            :rows="8"
            placeholder="请输入待签名或待验签的原始数据"
          />
        </div>
      </div>
      <div class="rs-result-panel">
        <div class="rs-result-panel__header">
          <span class="rs-key-panel__label">
            <n-icon size="15"><checkmark-done-outline /></n-icon>结果 / 签名
          </span>
          <n-space align="center" size="small">
            <n-text v-if="copySuccess" type="success" style="font-size: 12px">已复制</n-text>
            <n-button v-if="signatureResult || verifyResult !== null" size="tiny" quaternary @click="copyResult">
              <template #icon><n-icon><copy-outline /></n-icon></template>
              复制
            </n-button>
          </n-space>
        </div>
        <div class="rs-result-panel__body">
          <!-- 签名结果 -->
          <n-input
            v-if="signatureResult && verifyResult === null"
            v-model:value="signatureResult"
            type="textarea"
            :rows="8"
            readonly
            class="rs-input-readonly"
          />
          <!-- 验签结果 -->
          <div v-else-if="verifyResult !== null" class="rs-verify-result">
            <n-icon
              :size="52"
              :color="verifyResult ? '#059669' : '#d03050'"
            >
              <checkmark-circle-outline v-if="verifyResult" />
              <close-circle-outline v-else />
            </n-icon>
            <div class="rs-verify-result__title" :style="{ color: verifyResult ? '#059669' : '#d03050' }">
              {{ verifyResult ? '验证通过' : '验证失败' }}
            </div>
            <div class="rs-verify-result__desc">
              {{ verifyResult ? '签名与数据匹配' : '签名与数据不匹配，请检查输入' }}
            </div>
          </div>
          <n-empty v-else description="签名或验签结果将显示在这里" style="padding: 24px 0;" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { NButton, NIcon, NSpace, NInput, NSelect, NDivider, NText, NEmpty } from 'naive-ui'
import {
  CreateOutline,
  ShieldCheckmarkOutline,
  CopyOutline,
  CheckmarkCircleOutline,
  CloseCircleOutline,
  KeyOutline,
  MegaphoneOutline,
  DocumentTextOutline,
  CheckmarkDoneOutline
} from '@vicons/ionicons5'
import { SignerAlgorithm } from '@/types/rsa'
import { sign, verify } from '@/services/wasmRsaService'
import { useKeyStore } from '@/stores/keyStore'
import KeyTypeTag from '@/components/KeyTypeTag.vue'
import { useMessage } from 'naive-ui'

const keyStore = useKeyStore()
const message = useMessage()
const { publicKey, privateKey, publicKeyType, privateKeyType } = storeToRefs(keyStore)

const plainText = ref('')
const signatureResult = ref('')
const verifyResult = ref<boolean | null>(null)
const signerAlgorithm = ref<SignerAlgorithm>(SignerAlgorithm.SHA256withRSA)
const processing = ref<string | null>(null)
const copySuccess = ref(false)

const signerOptions = [
  { label: 'SHA1withRSA', value: SignerAlgorithm.SHA1withRSA },
  { label: 'SHA256withRSA', value: SignerAlgorithm.SHA256withRSA },
  { label: 'SHA384withRSA', value: SignerAlgorithm.SHA384withRSA },
  { label: 'SHA512withRSA', value: SignerAlgorithm.SHA512withRSA },
  { label: 'MD5withRSA', value: SignerAlgorithm.MD5withRSA }
]

async function handleSign() {
  if (!privateKeyType.value) { message.warning('请检查私钥格式'); return }
  if (!plainText.value) { message.warning('请输入待签名数据'); return }
  processing.value = 'sign'
  verifyResult.value = null
  try {
    signatureResult.value = await sign(privateKeyType.value, plainText.value, privateKey.value, signerAlgorithm.value)
    message.success('签名成功')
  } catch (err) {
    message.error('签名失败：' + (err instanceof Error ? err.message : String(err)))
  } finally { processing.value = null }
}

async function handleVerify() {
  if (!publicKeyType.value) { message.warning('请检查公钥格式'); return }
  if (!plainText.value) { message.warning('请输入原始数据'); return }
  if (!signatureResult.value) { message.warning('请先进行签名或输入签名'); return }
  processing.value = 'verify'
  try {
    verifyResult.value = await verify(publicKeyType.value, plainText.value, signatureResult.value, publicKey.value, signerAlgorithm.value)
    if (verifyResult.value) message.success('验证通过')
    else message.error('验证失败')
  } catch (err) {
    verifyResult.value = false
    message.error('验签失败：' + (err instanceof Error ? err.message : String(err)))
  } finally { processing.value = null }
}

function copyResult() {
  const text = signatureResult.value || (verifyResult.value !== null ? (verifyResult.value ? '验证通过' : '验证失败') : '')
  if (!text) return
  navigator.clipboard.writeText(text).then(() => {
    copySuccess.value = true
    setTimeout(() => copySuccess.value = false, 2000)
  }).catch(() => message.error('复制失败'))
}
</script>
