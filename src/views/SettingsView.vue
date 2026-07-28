<template>
  <div class="page">
    <header class="page-header">
      <div class="page-header__icon">
        <n-icon size="20"><settings-outline /></n-icon>
      </div>
      <div class="page-header__text">
        <div class="page-title">设置</div>
        <div class="page-subtitle">外观与默认算法偏好</div>
      </div>
    </header>

    <div class="rs-card" style="max-width: 640px;">
      <div class="rs-card-header">
        <n-icon size="16"><color-palette-outline /></n-icon>外观
      </div>
      <div class="rs-card-body">
        <div class="rs-setting-item">
          <div class="rs-setting-info">
            <div class="rs-setting-label">深色主题</div>
            <div class="rs-setting-desc">切换应用整体为深色模式</div>
          </div>
          <n-switch v-model:value="keyStore.isDark" />
        </div>
      </div>
    </div>

    <div class="rs-card" style="max-width: 640px; margin-top: 20px;">
      <div class="rs-card-header">
        <n-icon size="16"><options-outline /></n-icon>默认选项
      </div>
      <div class="rs-card-body">
        <div class="rs-setting-item">
          <div class="rs-setting-info">
            <div class="rs-setting-label">默认加密算法</div>
            <div class="rs-setting-desc">加密页面的默认选中算法</div>
          </div>
          <n-select v-model:value="defaultCipher" :options="cipherOptions" style="width: 280px;" />
        </div>
        <div class="rs-setting-item">
          <div class="rs-setting-info">
            <div class="rs-setting-label">默认签名算法</div>
            <div class="rs-setting-desc">签名页面的默认选中算法</div>
          </div>
          <n-select v-model:value="defaultSigner" :options="signerOptions" style="width: 200px;" />
        </div>
      </div>
    </div>

    <div class="rs-card" style="max-width: 640px; margin-top: 20px;">
      <div class="rs-card-header">
        <n-icon size="16"><flash-outline /></n-icon>快捷操作
      </div>
      <div class="rs-card-body">
        <div class="rs-setting-item">
          <div class="rs-setting-info">
            <div class="rs-setting-label">生成后自动复制公钥</div>
            <div class="rs-setting-desc">密钥生成成功后自动将公钥复制到剪贴板</div>
          </div>
          <n-switch v-model:value="autoCopyPublicKey" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NSwitch, NSelect, NIcon } from 'naive-ui'
import { SettingsOutline, ColorPaletteOutline, OptionsOutline, FlashOutline } from '@vicons/ionicons5'
import { useKeyStore } from '@/stores/keyStore'
import { CipherAlgorithm, SignerAlgorithm } from '@/types/rsa'

const keyStore = useKeyStore()

const defaultCipher = ref<CipherAlgorithm>(CipherAlgorithm.RSA_ECB_PKCS1Padding)
const defaultSigner = ref<SignerAlgorithm>(SignerAlgorithm.SHA256withRSA)
const autoCopyPublicKey = ref(false)

const cipherOptions = [
  { label: 'RSA/ECB/PKCS1Padding', value: CipherAlgorithm.RSA_ECB_PKCS1Padding },
  { label: 'RSA/ECB/OAEPWithSHA-1AndMGF1Padding', value: CipherAlgorithm.RSA_ECB_OAEPWithSHA_1AndMGF1Padding },
  { label: 'RSA/ECB/OAEPWithSHA-256AndMGF1Padding', value: CipherAlgorithm.RSA_ECB_OAEPWithSHA_256AndMGF1Padding }
]

const signerOptions = [
  { label: 'SHA1withRSA', value: SignerAlgorithm.SHA1withRSA },
  { label: 'SHA256withRSA', value: SignerAlgorithm.SHA256withRSA },
  { label: 'SHA384withRSA', value: SignerAlgorithm.SHA384withRSA },
  { label: 'SHA512withRSA', value: SignerAlgorithm.SHA512withRSA },
  { label: 'MD5withRSA', value: SignerAlgorithm.MD5withRSA }
]
</script>
