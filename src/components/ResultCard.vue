<template>
  <div class="rs-result-panel">
    <div class="rs-result-header">
      <span class="rs-result-title">
        <n-icon size="16" style="margin-right: 6px; vertical-align: -2px;">
          <document-text-outline />
        </n-icon>
        {{ title }}
        <key-type-tag v-if="keyType != null" :type="keyType" style="margin-left: 8px;" />
      </span>
      <n-space align="center" size="small">
        <n-text v-if="copySuccess" type="success" style="font-size: 12px">
          <n-icon size="14" style="vertical-align: -2px;"><checkmark-outline /></n-icon>
          已复制
        </n-text>
        <n-text v-if="copyError" type="warning" style="font-size: 12px">复制失败</n-text>
        <n-button size="small" quaternary @click="copy">
          <template #icon>
            <n-icon><copy-outline /></n-icon>
          </template>
          复制
        </n-button>
      </n-space>
    </div>
    <div class="rs-result-body">
      <n-input
        v-model:value="localValue"
        type="textarea"
        :rows="rows"
        readonly
        class="rs-input-readonly"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NIcon, NText, NSpace, NButton, NInput } from 'naive-ui'
import { CopyOutline, CheckmarkOutline, DocumentTextOutline } from '@vicons/ionicons5'
import KeyTypeTag from './KeyTypeTag.vue'
import { RSAKeyType } from '@/types/rsa'

const props = defineProps<{
  modelValue: string
  title: string
  rows?: number
  keyType?: RSAKeyType | null
}>()

const localValue = ref(props.modelValue)
const copySuccess = ref(false)
const copyError = ref(false)
let successTimer: ReturnType<typeof setTimeout> | null = null

watch(() => props.modelValue, (val) => {
  localValue.value = val
})

async function copy() {
  copyError.value = false
  if (successTimer) clearTimeout(successTimer)
  try {
    await navigator.clipboard.writeText(localValue.value)
    copySuccess.value = true
    successTimer = setTimeout(() => { copySuccess.value = false }, 2000)
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = localValue.value
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      copySuccess.value = true
      successTimer = setTimeout(() => { copySuccess.value = false }, 2000)
    } catch {
      copyError.value = true
    }
  }
}
</script>

<style scoped>
.rs-result-title {
  display: inline-flex;
  align-items: center;
}
</style>
