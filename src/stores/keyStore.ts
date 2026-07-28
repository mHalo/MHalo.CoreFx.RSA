import { create } from 'zustand'
import type { RSAKeyPair, RSAKeyType } from '@/types/rsa'

interface KeyState {
  publicKey: string
  privateKey: string
  publicKeyType: RSAKeyType | null
  privateKeyType: RSAKeyType | null
  isDark: boolean
  wasmReady: boolean
  wasmError: string | null
  setKeyPair: (pair: RSAKeyPair, types: { public: RSAKeyType; private: RSAKeyType }) => void
  setPublicKey: (key: string, type: RSAKeyType | null) => void
  setPrivateKey: (key: string, type: RSAKeyType | null) => void
  setIsDark: (value: boolean) => void
  setWasmReady: (value: boolean) => void
  setWasmError: (value: string | null) => void
  clear: () => void
}

export const useKeyStore = create<KeyState>((set) => ({
  publicKey: '',
  privateKey: '',
  publicKeyType: null,
  privateKeyType: null,
  isDark: false,
  wasmReady: false,
  wasmError: null,
  setKeyPair: (pair, types) =>
    set({
      publicKey: pair.publicKey,
      privateKey: pair.privateKey,
      publicKeyType: types.public,
      privateKeyType: types.private
    }),
  setPublicKey: (key, type) => set({ publicKey: key, publicKeyType: type }),
  setPrivateKey: (key, type) => set({ privateKey: key, privateKeyType: type }),
  setIsDark: (value) => set({ isDark: value }),
  setWasmReady: (value) => set({ wasmReady: value }),
  setWasmError: (value) => set({ wasmError: value }),
  clear: () =>
    set({ publicKey: '', privateKey: '', publicKeyType: null, privateKeyType: null })
}))
