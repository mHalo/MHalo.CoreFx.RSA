<template>
  <div class="key-input">
    <div class="key-input__header">
      <span>{{ label }}</span>
      <key-type-tag :type="detectedType" />
    </div>
    <n-input
      v-model:value="localValue"
      type="textarea"
      :placeholder="placeholder"
      :rows="8"
      @update:value="onUpdate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { RSAKeyType } from '@/types/rsa'
import { detectKeyType } from '@/services/wasmRsaService'
import KeyTypeTag from './KeyTypeTag.vue'

const props = defineProps<{
  modelValue: string
  label: string
  placeholder?: string
  isPrivate?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'type-detected', type: RSAKeyType | null): void
}>()

const localValue = ref(props.modelValue)
const detectedType = ref<RSAKeyType | null>(null)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

watch(() => props.modelValue, (val) => {
  localValue.value = val
})

async function onUpdate(value: string) {
  emit('update:modelValue', value)
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(async () => {
    try {
      detectedType.value = await detectKeyType(value, props.isPrivate ?? false)
      emit('type-detected', detectedType.value)
    } catch {
      detectedType.value = null
      emit('type-detected', null)
    }
  }, 300)
}
</script>

<style scoped>
.key-input__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
</style>
