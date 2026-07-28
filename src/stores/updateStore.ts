import { create } from 'zustand'
import { checkForUpdate, type CheckResult } from '@/services/versionCheckService'

interface UpdateState {
  updateInfo: CheckResult | null
  isChecking: boolean
  hasUpdate: boolean

  checkForUpdate: (forceRefresh?: boolean) => Promise<CheckResult | null>
}

export const useUpdateStore = create<UpdateState>((set) => ({
  updateInfo: null,
  isChecking: false,
  hasUpdate: false,

  checkForUpdate: async (forceRefresh = false) => {
    set({ isChecking: true })
    try {
      // 最低延迟确保用户能看到"检查中..."反馈
      const minDelay = new Promise((resolve) => setTimeout(resolve, 600))
      const resultPromise = checkForUpdate(forceRefresh)
      const [result] = await Promise.all([resultPromise, minDelay])
      if (result) {
        set({
          updateInfo: result,
          hasUpdate: result.isUpdateAvailable,
          isChecking: false
        })
      } else {
        set({ isChecking: false })
      }
      return result
    } catch {
      set({ isChecking: false })
      return null
    }
  }
}))
