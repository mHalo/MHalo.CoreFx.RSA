import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CipherAlgorithm, SignerAlgorithm } from '@/types/rsa'

export type KeyFormat = 'pem' | 'txt'
export type ThemeColor = 'lime' | 'indigo' | 'sky' | 'rose'

interface SettingsState {
  isDark: boolean
  radius: number
  themeColor: ThemeColor
  defaultKeyFormat: KeyFormat
  defaultCipher: CipherAlgorithm
  defaultSigner: SignerAlgorithm
  autoCopyPublicKey: boolean
  strictKeySize: boolean
  saveToLocal: boolean
  setIsDark: (value: boolean) => void
  setRadius: (value: number) => void
  setThemeColor: (value: ThemeColor) => void
  setDefaultKeyFormat: (value: KeyFormat) => void
  setDefaultCipher: (value: CipherAlgorithm) => void
  setDefaultSigner: (value: SignerAlgorithm) => void
  setAutoCopyPublicKey: (value: boolean) => void
  setStrictKeySize: (value: boolean) => void
  setSaveToLocal: (value: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isDark: false,
      radius: 0.45,
      themeColor: 'lime',
      defaultKeyFormat: 'txt',
      defaultCipher: CipherAlgorithm.RSA_ECB_PKCS1Padding,
      defaultSigner: SignerAlgorithm.SHA256withRSA,
      autoCopyPublicKey: false,
      strictKeySize: false,
      saveToLocal: true,
      setIsDark: (value) => set({ isDark: value }),
      setRadius: (value) => set({ radius: value }),
      setThemeColor: (value) => set({ themeColor: value }),
      setDefaultKeyFormat: (value) => set({ defaultKeyFormat: value }),
      setDefaultCipher: (value) => set({ defaultCipher: value }),
      setDefaultSigner: (value) => set({ defaultSigner: value }),
      setAutoCopyPublicKey: (value) => set({ autoCopyPublicKey: value }),
      setStrictKeySize: (value) => set({ strictKeySize: value }),
      setSaveToLocal: (value) => set({ saveToLocal: value })
    }),
    { name: 'rsatoolbox-settings' }
  )
)

/** 各主题色的 OKLCH 变量（浅色 / 深色） */
export const themeColorVars: Record<
  ThemeColor,
  { primary: [string, string]; primaryForeground: [string, string]; ring: [string, string]; sidebarPrimary: [string, string]; sidebarPrimaryForeground: [string, string]; sidebarRing: [string, string] }
> = {
  lime: {
    primary: ['oklch(0.841 0.238 128.85)', 'oklch(0.78 0.24 130.85)'],
    primaryForeground: ['oklch(0.405 0.101 131.063)', 'oklch(0.165 0.05 131.063)'],
    ring: ['oklch(0.714 0.014 41.2)', 'oklch(0.65 0.014 41.2)'],
    sidebarPrimary: ['oklch(0.648 0.2 131.684)', 'oklch(0.78 0.24 130.85)'],
    sidebarPrimaryForeground: ['oklch(0.986 0.031 120.757)', 'oklch(0.165 0.05 131.063)'],
    sidebarRing: ['oklch(0.714 0.014 41.2)', 'oklch(0.65 0.014 41.2)']
  },
  indigo: {
    primary: ['oklch(0.51 0.19 263)', 'oklch(0.62 0.17 263)'],
    primaryForeground: ['oklch(0.985 0 0)', 'oklch(0.985 0 0)'],
    ring: ['oklch(0.51 0.19 263)', 'oklch(0.62 0.17 263)'],
    sidebarPrimary: ['oklch(0.51 0.19 263)', 'oklch(0.62 0.17 263)'],
    sidebarPrimaryForeground: ['oklch(0.985 0 0)', 'oklch(0.985 0 0)'],
    sidebarRing: ['oklch(0.51 0.19 263)', 'oklch(0.62 0.17 263)']
  },
  sky: {
    primary: ['oklch(0.62 0.16 230)', 'oklch(0.7 0.14 230)'],
    primaryForeground: ['oklch(0.985 0 0)', 'oklch(0.16 0.04 230)'],
    ring: ['oklch(0.62 0.16 230)', 'oklch(0.7 0.14 230)'],
    sidebarPrimary: ['oklch(0.62 0.16 230)', 'oklch(0.7 0.14 230)'],
    sidebarPrimaryForeground: ['oklch(0.985 0 0)', 'oklch(0.16 0.04 230)'],
    sidebarRing: ['oklch(0.62 0.16 230)', 'oklch(0.7 0.14 230)']
  },
  rose: {
    primary: ['oklch(0.6 0.2 15)', 'oklch(0.68 0.18 15)'],
    primaryForeground: ['oklch(0.985 0 0)', 'oklch(0.17 0.04 15)'],
    ring: ['oklch(0.6 0.2 15)', 'oklch(0.68 0.18 15)'],
    sidebarPrimary: ['oklch(0.6 0.2 15)', 'oklch(0.68 0.18 15)'],
    sidebarPrimaryForeground: ['oklch(0.985 0 0)', 'oklch(0.17 0.04 15)'],
    sidebarRing: ['oklch(0.6 0.2 15)', 'oklch(0.68 0.18 15)']
  }
}
