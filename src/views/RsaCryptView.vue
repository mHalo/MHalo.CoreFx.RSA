<template>
  <div class="page">
    <h2>加密 / 解密</h2>
    <n-tabs type="line">
      <n-tab-pane name="encrypt" tab="加密">
        <n-form label-placement="left" label-width="120px">
          <n-form-item label="加密算法">
            <n-select v-model:value="cipherAlgorithm" :options="cipherOptions" style="width: 280px" />
          </n-form-item>
          <n-form-item label="公钥">
            <key-input v-model="publicKey" label="公钥" placeholder="请输入公钥" />
          </n-form-item>
          <n-form-item label="原文">
            <n-input v-model:value="plainText" type="textarea" :rows="4" placeholder="请输入待加密内容" />
          </n-form-item>
          <n-form-item>
            <n-button type="primary" @click="handleEncrypt">
              加密
            </n-button>
          </n-form-item>
        </n-form>
        <result-card v-if="cipherResult" v-model="cipherResult" title="密文" />
      </n-tab-pane>

      <n-tab-pane name="decrypt" tab="解密">
        <n-form label-placement="left" label-width="120px">
          <n-form-item label="加密算法">
            <n-select v-model:value="cipherAlgorithm" :options="cipherOptions" style="width: 280px" />
          </n-form-item>
          <n-form-item label="私钥">
            <key-input v-model="privateKey" label="私钥" placeholder="请输入私钥" is-private />
          </n-form-item>
          <n-form-item label="密文">
            <n-input v-model:value="cipherText" type="textarea" :rows="4" placeholder="请输入待解密内容" />
          </n-form-item>
          <n-form-item>
            <n-button type="primary" @click="handleDecrypt">
              解密
            </n-button>
          </n-form-item>
        </n-form>
        <result-card v-if="plainResult" v-model="plainResult" title="原文" />
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { CipherAlgorithm } from '@/types/rsa'
import { encrypt, decrypt } from '@/services/wasmRsaService'
import { useKeyStore } from '@/stores/keyStore'
import KeyInput from '@/components/KeyInput.vue'
import ResultCard from '@/components/ResultCard.vue'
import { useMessage } from 'naive-ui'

const keyStore = useKeyStore()
const message = useMessage()
const { publicKey, privateKey, publicKeyType, privateKeyType } = storeToRefs(keyStore)

const plainText = ref('')
const cipherText = ref('')
const cipherResult = ref('')
const plainResult = ref('')
const cipherAlgorithm = ref<CipherAlgorithm>(CipherAlgorithm.RSA_ECB_PKCS1Padding)

const cipherOptions = [
  { label: 'RSA/ECB/PKCS1Padding', value: CipherAlgorithm.RSA_ECB_PKCS1Padding },
  { label: 'RSA/ECB/OAEPWithSHA-1AndMGF1Padding', value: CipherAlgorithm.RSA_ECB_OAEPWithSHA_1AndMGF1Padding },
  { label: 'RSA/ECB/OAEPWithSHA-256AndMGF1Padding', value: CipherAlgorithm.RSA_ECB_OAEPWithSHA_256AndMGF1Padding }
]

async function handleEncrypt() {
  if (publicKeyType.value === null) {
    message.warning('无法识别公钥格式')
    return
  }
  cipherResult.value = await encrypt(publicKeyType.value, plainText.value, publicKey.value, cipherAlgorithm.value)
}

async function handleDecrypt() {
  if (privateKeyType.value === null) {
    message.warning('无法识别私钥格式')
    return
  }
  plainResult.value = await decrypt(privateKeyType.value, cipherText.value, privateKey.value, cipherAlgorithm.value)
}
</script>

<style scoped>
.page {
  max-width: 960px;
}
</style>
