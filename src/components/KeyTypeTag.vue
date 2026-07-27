<template>
  <n-tag v-if="type !== null" :type="tagType" size="small">
    {{ label }}
  </n-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RSAKeyType } from '@/types/rsa'

const props = defineProps<{
  type: RSAKeyType | null
}>()

const label = computed(() => {
  switch (props.type) {
    case RSAKeyType.Pkcs1: return 'PKCS#1'
    case RSAKeyType.Pkcs8: return 'PKCS#8'
    case RSAKeyType.Xml: return 'XML'
    default: return ''
  }
})

const tagType = computed(() => {
  switch (props.type) {
    case RSAKeyType.Pkcs1: return 'info'
    case RSAKeyType.Pkcs8: return 'success'
    case RSAKeyType.Xml: return 'warning'
    default: return 'default'
  }
})
</script>
