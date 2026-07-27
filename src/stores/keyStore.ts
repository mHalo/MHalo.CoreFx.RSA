import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { RSAKeyPair, RSAKeyType } from '@/types/rsa'

export const useKeyStore = defineStore('key', () => {
  const publicKey = ref('')
  const privateKey = ref('')
  const publicKeyType = ref<RSAKeyType | null>(null)
  const privateKeyType = ref<RSAKeyType | null>(null)

  function setKeyPair(pair: RSAKeyPair, types: { public: RSAKeyType; private: RSAKeyType }) {
    publicKey.value = pair.publicKey
    privateKey.value = pair.privateKey
    publicKeyType.value = types.public
    privateKeyType.value = types.private
  }

  function setPublicKey(key: string, type: RSAKeyType | null) {
    publicKey.value = key
    publicKeyType.value = type
  }

  function setPrivateKey(key: string, type: RSAKeyType | null) {
    privateKey.value = key
    privateKeyType.value = type
  }

  function clear() {
    publicKey.value = ''
    privateKey.value = ''
    publicKeyType.value = null
    privateKeyType.value = null
  }

  return {
    publicKey,
    privateKey,
    publicKeyType,
    privateKeyType,
    setKeyPair,
    setPublicKey,
    setPrivateKey,
    clear
  }
})
