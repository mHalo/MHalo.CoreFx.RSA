<template>
  <n-card class="result-card" :title="title" size="small">
    <n-input
      v-model:value="localValue"
      type="textarea"
      :rows="6"
      readonly
    />
    <template #header-extra>
      <n-button size="small" @click="copy">
        复制
      </n-button>
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

watch(() => props.modelValue, (val) => {
  localValue.value = val
})

async function copy() {
  await navigator.clipboard.writeText(localValue.value)
}
</script>
