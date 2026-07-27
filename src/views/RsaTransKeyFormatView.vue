<template>
  <div class="page">
    <h2>密钥格式转换</h2>
    <n-tabs type="line">
      <n-tab-pane name="public" tab="公钥转换">
        <n-form label-placement="left" label-width="120px">
          <n-form-item label="目标格式">
            <n-select v-model:value="targetPublicType" :options="keyTypeOptions" style="width: 200px" />
          </n-form-item>
          <n-form-item label="PEM 格式">
            <n-switch v-model:value="usePemPublic" />
          </n-form-item>
          <n-form-item label="输入公钥">
            <key-input v-model="inputPublicKey" label="公钥" placeholder="请输入公钥" />
          </n-form-item>
          <n-form-item>
            <n-button type="primary" @click="handleTransformPublic">
              转换
            </n-button>
          </n-form-item>
        </n-form>
        <result-card v-if="outputPublicKey" v-model="outputPublicKey" title="转换后公钥" />
      </n-tab-pane>

      <n-tab-pane name="private" tab="私钥转换">
        <n-form label-placement="left" label-width="120px">
          <n-form-item label="目标格式">
            <n-select v-model:value="targetPrivateType" :options="keyTypeOptions" style="width: 200px" />
          </n-form-item>
          <n-form-item label="PEM 格式">
            <n-switch v-model:value="usePemPrivate" />
          </n-form-item>
          <n-form-item label="输入私钥">
            <key-input v-model="inputPrivateKey" label="私钥" placeholder="请输入私钥" is-private />
          </n-form-item>
          <n-form-item>
            <n-button type="primary" @click="handleTransformPrivate">
              转换
            </n-button>
          </n-form-item>
        </n-form>
        <n-space v-if="outputPrivateKey" vertical>
          <result-card v-model="outputPublicKeyFromPrivate" title="对应公钥" />
          <result-card v-model="outputPrivateKey" title="转换后私钥" />
        </n-space>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RSAKeyType } from '@/types/rsa'
import { transformPublicKeyFormat, transformPrivateKeyFormat } from '@/services/wasmRsaService'
import KeyInput from '@/components/KeyInput.vue'
import ResultCard from '@/components/ResultCard.vue'

const targetPublicType = ref<RSAKeyType>(RSAKeyType.Pkcs8)
const targetPrivateType = ref<RSAKeyType>(RSAKeyType.Pkcs8)
const usePemPublic = ref(false)
const usePemPrivate = ref(false)

const inputPublicKey = ref('')
const outputPublicKey = ref('')
const inputPrivateKey = ref('')
const outputPrivateKey = ref('')
const outputPublicKeyFromPrivate = ref('')

const keyTypeOptions = [
  { label: 'PKCS#1', value: RSAKeyType.Pkcs1 },
  { label: 'PKCS#8', value: RSAKeyType.Pkcs8 },
  { label: 'XML', value: RSAKeyType.Xml }
]

async function handleTransformPublic() {
  outputPublicKey.value = await transformPublicKeyFormat(inputPublicKey.value, targetPublicType.value, usePemPublic.value)
}

async function handleTransformPrivate() {
  const result = await transformPrivateKeyFormat(inputPrivateKey.value, targetPrivateType.value, usePemPrivate.value)
  if (!result.success) {
    throw new Error('私钥格式转换失败')
  }
  outputPublicKeyFromPrivate.value = result.publicKey
  outputPrivateKey.value = result.privateKey
}
</script>

<style scoped>
.page {
  max-width: 960px;
}
</style>
