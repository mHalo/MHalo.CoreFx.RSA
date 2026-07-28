import { create } from 'zustand'
import { checkForUpdate, type CheckResult } from '@/services/versionCheckService'

interface UpdateState {
  updateInfo: CheckResult | null
  isChecking: boolean
  hasUpdate: boolean

  checkForUpdate: () => Promise<void>
}

export const useUpdateStore = create<UpdateState>((set) => ({
  updateInfo: null,
  isChecking: false,
  hasUpdate: false,

  checkForUpdate: async () => {
    set({ isChecking: true })
    try {
      const result = await checkForUpdate()
      if (result) {
        set({
          updateInfo: result,
          hasUpdate: result.isUpdateAvailable,
          isChecking: false
        })
      } else {
        set({ isChecking: false })
      }
    } catch {
      set({ isChecking: false })
    }
  }
}))
