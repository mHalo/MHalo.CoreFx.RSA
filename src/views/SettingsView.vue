<template>
  <div class="page">
    <h2>设置</h2>
    <n-form label-placement="left" label-width="120px">
      <n-form-item label="深色主题">
        <n-switch v-model:value="keyStore.isDark" />
      </n-form-item>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { useKeyStore } from '@/stores/keyStore'

const keyStore = useKeyStore()
</script>

<style scoped>
.page {
  max-width: 960px;
}
</style>
