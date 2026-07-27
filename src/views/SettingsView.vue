<template>
  <div class="page">
    <h2>设置</h2>
    <n-form label-placement="left" label-width="120px">
      <n-form-item label="深色主题">
        <n-switch v-model:value="isDark" />
      </n-form-item>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const isDark = ref(false)

watch(isDark, (value) => {
  const html = document.documentElement
  if (value) {
    html.classList.add('dark')
  } else {
    html.classList.remove('dark')
  }
})
</script>

<style scoped>
.page {
  max-width: 960px;
}
</style>
