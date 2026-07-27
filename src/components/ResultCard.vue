<template>
  <n-card class="result-card" :title="title" size="small">
    <n-input
      v-model:value="localValue"
      type="textarea"
      :rows="3"
      readonly
    />
    <template #header-extra>
      <n-space align="center" size="small">
        <n-text v-if="copyError" type="warning" depth="1" style="font-size: 12px">复制失败</n-text>
        <n-button size="small" @click="copy">
          复制
        </n-button>
      </n-space>
    </template>
  </n-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  title: string
}>()

const localValue = ref(props.modelValue)
const copyError = ref(false)

watch(() => props.modelValue, (val) => {
  localValue.value = val
})

async function copy() {
  copyError.value = false
  try {
    await navigator.clipboard.writeText(localValue.value)
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
    } catch {
      copyError.value = true
    }
  }
}
</script>
