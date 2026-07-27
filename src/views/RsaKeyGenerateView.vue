<template>
  <div class="page">
    <h2>密钥生成</h2>
    <n-form label-placement="left" label-width="120px">
      <n-form-item label="密钥长度">
        <n-select v-model:value="keySize" :options="keySizeOptions" style="width: 200px" />
      </n-form-item>
      <n-form-item label="密钥类型">
        <n-select v-model:value="keyType" :options="keyTypeOptions" style="width: 200px" />
      </n-form-item>
      <n-form-item label="PEM 格式">
        <n-switch v-model:value="usePemFormat" />
      </n-form-item>
      <n-form-item label="保存到本地">
        <n-switch v-model:value="saveToLocal" />
      </n-form-item>
      <n-form-item>
        <n-button type="primary" @click="handleGenerate">
          生成密钥
        </n-button>
      </n-form-item>
    </n-form>

    <n-space v-if="keyPair.publicKey" vertical style="margin-top: 16px">
      <result-card v-model="keyPair.publicKey" title="公钥" />
      <result-card v-model="keyPair.privateKey" title="私钥" />
      <n-space>
        <n-button @click="sendToCrypt">
          发送到加密/解密页
        </n-button>
        <n-button @click="sendToSign">
          发送到签名/验签页
        </n-button>
      </n-space>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { RSAKeyType } from '@/types/rsa'
import { generateKeyPair } from '@/services/wasmRsaService'
import { useKeyStore } from '@/stores/keyStore'
import ResultCard from '@/components/ResultCard.vue'

const router = useRouter()
const keyStore = useKeyStore()

const keySize = ref(2048)
const keyType = ref<RSAKeyType>(RSAKeyType.Pkcs8)
const usePemFormat = ref(false)
const saveToLocal = ref(false)

const keyPair = reactive({ publicKey: '', privateKey: '' })

const keySizeOptions = [
  { label: '1024', value: 1024 },
  { label: '2048', value: 2048 },
  { label: '3072', value: 3072 },
  { label: '4096', value: 4096 }
]

const keyTypeOptions = [
  { label: 'PKCS#1', value: RSAKeyType.Pkcs1 },
  { label: 'PKCS#8', value: RSAKeyType.Pkcs8 },
  { label: 'XML', value: RSAKeyType.Xml }
]

async function handleGenerate() {
  const result = await generateKeyPair(keyType.value, keySize.value, usePemFormat.value)
  keyPair.publicKey = result.publicKey
  keyPair.privateKey = result.privateKey
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

<style scoped>
.page {
  max-width: 960px;
}
</style>
