<template>
  <div class="page">
    <header class="page-header">
      <div class="page-header__icon">
        <n-icon size="20"><lock-closed-outline /></n-icon>
      </div>
      <div class="page-header__text">
        <div class="page-title">加密 / 解密</div>
        <div class="page-subtitle">使用公钥或私钥对数据进行 RSA 加密与解密</div>
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

    <!-- 中间：原文 + 操作按钮 + 结果 -->
    <div class="rs-grid rs-grid-3">
      <!-- 原文 -->
      <div class="rs-source-panel">
        <div class="rs-source-panel__header">
          <span class="rs-key-panel__label">
            <n-icon size="15"><document-text-outline /></n-icon>原文
          </span>
        </div>
        <div class="rs-source-panel__body">
          <n-input
            v-model:value="plainText"
            type="textarea"
            :rows="10"
            placeholder="请输入待加密的原文"
          />
        </div>
      </div>

      <!-- 操作按钮列 -->
      <div class="rs-ops-column">
        <n-button type="primary" :loading="processing === 'pub-enc'" @click="handleEncrypt">
          <template #icon><n-icon><lock-closed-outline /></n-icon></template>
          公钥加密
        </n-button>
        <n-button type="primary" :loading="processing === 'pri-dec'" @click="handleDecrypt">
          <template #icon><n-icon><lock-open-outline /></n-icon></template>
          私钥解密
        </n-button>

        <n-button quaternary circle @click="swapText">
          <template #icon><n-icon><swap-horizontal-outline /></n-icon></template>
        </n-button>

        <n-button secondary :loading="processing === 'pri-enc'" @click="handleEncryptByPrivateKey">
          <template #icon><n-icon><lock-closed-outline /></n-icon></template>
          私钥加密
        </n-button>
        <n-button secondary :loading="processing === 'pub-dec'" @click="handleDecryptByPublicKey">
          <template #icon><n-icon><lock-open-outline /></n-icon></template>
          公钥解密
        </n-button>
      </div>

      <!-- 结果 -->
      <div class="rs-result-panel">
        <div class="rs-result-panel__header">
          <span class="rs-key-panel__label">
            <n-icon size="15"><checkmark-done-outline /></n-icon>结果
          </span>
          <n-space align="center" size="small">
            <n-text v-if="copySuccess" type="success" style="font-size: 12px">已复制</n-text>
            <n-button v-if="resultText" size="tiny" quaternary @click="copyResult">
              <template #icon><n-icon><copy-outline /></n-icon></template>
              复制
            </n-button>
          </n-space>
        </div>
        <div class="rs-result-panel__body">
          <n-input
            v-model:value="resultText"
            type="textarea"
            :rows="10"
            placeholder="操作结果将显示在这里"
            readonly
            class="rs-input-readonly"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { NButton, NIcon, NSpace, NInput, NText } from 'naive-ui'
import { LockClosedOutline, LockOpenOutline, SwapHorizontalOutline, CopyOutline, KeyOutline, MegaphoneOutline, DocumentTextOutline, CheckmarkDoneOutline } from '@vicons/ionicons5'
import { CipherAlgorithm } from '@/types/rsa'
import { encrypt, decrypt, encryptByPrivateKey, decryptByPublicKey } from '@/services/wasmRsaService'
import { useKeyStore } from '@/stores/keyStore'
import KeyTypeTag from '@/components/KeyTypeTag.vue'
import { useMessage } from 'naive-ui'

const keyStore = useKeyStore()
const message = useMessage()
const { publicKey, privateKey, publicKeyType, privateKeyType } = storeToRefs(keyStore)

const plainText = ref('')
const resultText = ref('')
const processing = ref<string | null>(null)
const copySuccess = ref(false)
const cipherAlgorithm = ref<CipherAlgorithm>(CipherAlgorithm.RSA_ECB_PKCS1Padding)

async function handleEncrypt() {
  if (!publicKeyType.value) { message.warning('请检查公钥格式'); return }
  if (!plainText.value) { message.warning('请输入原文'); return }
  processing.value = 'pub-enc'
  try {
    resultText.value = await encrypt(publicKeyType.value, plainText.value, publicKey.value, cipherAlgorithm.value)
  } catch (err) {
    message.error('加密失败：' + (err instanceof Error ? err.message : String(err)))
  } finally { processing.value = null }
}

async function handleDecrypt() {
  if (!privateKeyType.value) { message.warning('请检查私钥格式'); return }
  if (!plainText.value) { message.warning('请输入密文'); return }
  processing.value = 'pri-dec'
  try {
    resultText.value = await decrypt(privateKeyType.value, plainText.value, privateKey.value, cipherAlgorithm.value)
  } catch (err) {
    message.error('解密失败：' + (err instanceof Error ? err.message : String(err)))
  } finally { processing.value = null }
}

async function handleEncryptByPrivateKey() {
  if (!privateKeyType.value) { message.warning('请检查私钥格式'); return }
  if (!plainText.value) { message.warning('请输入原文'); return }
  processing.value = 'pri-enc'
  try {
    resultText.value = await encryptByPrivateKey(privateKeyType.value, plainText.value, privateKey.value, cipherAlgorithm.value)
  } catch (err) {
    message.error('加密失败：' + (err instanceof Error ? err.message : String(err)))
  } finally { processing.value = null }
}

async function handleDecryptByPublicKey() {
  if (!publicKeyType.value) { message.warning('请检查公钥格式'); return }
  if (!plainText.value) { message.warning('请输入密文'); return }
  processing.value = 'pub-dec'
  try {
    resultText.value = await decryptByPublicKey(publicKeyType.value, plainText.value, publicKey.value, cipherAlgorithm.value)
  } catch (err) {
    message.error('解密失败：' + (err instanceof Error ? err.message : String(err)))
  } finally { processing.value = null }
}

function swapText() {
  const tmp = plainText.value
  plainText.value = resultText.value
  resultText.value = tmp
}

function copyResult() {
  navigator.clipboard.writeText(resultText.value).then(() => {
    copySuccess.value = true
    setTimeout(() => copySuccess.value = false, 2000)
  }).catch(() => message.error('复制失败'))
}
</script>
