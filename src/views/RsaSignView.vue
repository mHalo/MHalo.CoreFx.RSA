<template>
  <div class="page">
    <h2>签名 / 验签</h2>
    <n-tabs type="line">
      <n-tab-pane name="sign" tab="签名">
        <n-form label-placement="left" label-width="120px">
          <n-form-item label="签名算法">
            <n-select v-model:value="signerAlgorithm" :options="signerOptions" style="width: 280px" />
          </n-form-item>
          <n-form-item label="私钥">
            <key-input v-model="privateKey" label="私钥" placeholder="请输入私钥" is-private />
          </n-form-item>
          <n-form-item label="原文">
            <n-input v-model:value="plainText" type="textarea" :rows="4" placeholder="请输入待签名内容" />
          </n-form-item>
          <n-form-item>
            <n-button type="primary" @click="handleSign">
              签名
            </n-button>
          </n-form-item>
        </n-form>
        <result-card v-if="signatureResult" v-model="signatureResult" title="签名结果" />
      </n-tab-pane>

      <n-tab-pane name="verify" tab="验签">
        <n-form label-placement="left" label-width="120px">
          <n-form-item label="签名算法">
            <n-select v-model:value="signerAlgorithm" :options="signerOptions" style="width: 280px" />
          </n-form-item>
          <n-form-item label="公钥">
            <key-input v-model="publicKey" label="公钥" placeholder="请输入公钥" />
          </n-form-item>
          <n-form-item label="原文">
            <n-input v-model:value="plainText" type="textarea" :rows="4" placeholder="请输入待验签内容" />
          </n-form-item>
          <n-form-item label="签名">
            <n-input v-model:value="signature" type="textarea" :rows="4" placeholder="请输入签名" />
          </n-form-item>
          <n-form-item>
            <n-button type="primary" @click="handleVerify">
              验签
            </n-button>
          </n-form-item>
        </n-form>
        <n-alert v-if="verifyResult !== null" :type="verifyResult ? 'success' : 'error'" title="验签结果">
          {{ verifyResult ? '验证通过' : '验证失败' }}
        </n-alert>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { SignerAlgorithm } from '@/types/rsa'
import { sign, verify } from '@/services/wasmRsaService'
import { useKeyStore } from '@/stores/keyStore'
import KeyInput from '@/components/KeyInput.vue'
import ResultCard from '@/components/ResultCard.vue'
import { useMessage } from 'naive-ui'

const keyStore = useKeyStore()
const message = useMessage()
const { publicKey, privateKey, publicKeyType, privateKeyType } = storeToRefs(keyStore)

const plainText = ref('')
const signature = ref('')
const signatureResult = ref('')
const verifyResult = ref<boolean | null>(null)
const signerAlgorithm = ref<SignerAlgorithm>(SignerAlgorithm.SHA256withRSA)

const signerOptions = [
  { label: 'SHA1withRSA', value: SignerAlgorithm.SHA1withRSA },
  { label: 'SHA256withRSA', value: SignerAlgorithm.SHA256withRSA },
  { label: 'SHA384withRSA', value: SignerAlgorithm.SHA384withRSA },
  { label: 'SHA512withRSA', value: SignerAlgorithm.SHA512withRSA },
  { label: 'MD5withRSA', value: SignerAlgorithm.MD5withRSA }
]

async function handleSign() {
  if (privateKeyType.value === null) {
    message.warning('无法识别私钥格式')
    return
  }
  signatureResult.value = await sign(privateKeyType.value, plainText.value, privateKey.value, signerAlgorithm.value)
}

async function handleVerify() {
  if (publicKeyType.value === null) {
    message.warning('无法识别公钥格式')
    return
  }
  verifyResult.value = await verify(publicKeyType.value, plainText.value, signature.value, publicKey.value, signerAlgorithm.value)
}
</script>

<style scoped>
.page {
  max-width: 960px;
}
</style>
