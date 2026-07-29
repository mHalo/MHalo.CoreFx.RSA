import { create } from 'zustand'
import { checkForUpdate, type CheckResult } from '@/services/versionCheckService'

// ── Debug: 开发环境模拟更新数据 ──
const DEBUG_UPDATE = import.meta.env.DEV
const DEBUG_INFO: CheckResult = {
  currentVersion: '1.2.0',
  latestVersion: '1.3.0',
  latestUrl: 'https://github.com/mHalo/MHalo.CoreFx.RSA/releases/tag/v1.3.0',
  downloadUrl: 'https://example.com/update.dmg',
  releaseBody: `### 🚀 新功能
- 全新的更新弹窗，支持变更日志展示
- 下载进度条实时反馈
- 下载完成后自动打开安装包

### 🐛 修复
- 修复 Windows MSI 打包中文文件名错误
- 修复 macOS DMG ad-hoc 签名不完整导致 Gatekeeper 拒绝

### 🔧 改进
- 侧边栏显示当前版本号
- 设置页手动检查更新 + toast 反馈`,
  isUpdateAvailable: true,
  publishedAt: new Date().toISOString()
}

interface UpdateState {
  updateInfo: CheckResult | null
  isChecking: boolean
  hasUpdate: boolean

  checkForUpdate: (forceRefresh?: boolean) => Promise<CheckResult | null>
  simulateDownload: (onProgress: (pct: number) => void) => Promise<boolean>
}

/** 模拟下载进度——逐步增加直到 100% */
function simulateProgress(onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve) => {
    let pct = 0
    const step = () => {
      pct += Math.random() * 12 + 4 // 每次增加 4%~16%
      if (pct >= 100) {
        pct = 100
        onProgress(pct)
        setTimeout(resolve, 300) // 短暂的完成延迟
        return
      }
      onProgress(Math.round(pct))
      setTimeout(step, 300 + Math.random() * 400) // 300~700ms 间隔
    }
    step()
  })
}

export const useUpdateStore = create<UpdateState>((set) => ({
  updateInfo: null,
  isChecking: false,
  hasUpdate: false,

  checkForUpdate: async (forceRefresh = false) => {
    set({ isChecking: true })

    try {
      // Debug 模式：直接返回模拟数据
      if (DEBUG_UPDATE && forceRefresh) {
        await new Promise((r) => setTimeout(r, 600)) // 最低延迟
        set({
          updateInfo: DEBUG_INFO,
          hasUpdate: true,
          isChecking: false
        })
        return DEBUG_INFO
      }

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
  },

  /** 模拟下载（仅 debug 模式有效，真实环境走 Tauri download_update） */
  simulateDownload: async (onProgress: (pct: number) => void): Promise<boolean> => {
    if (!DEBUG_UPDATE) return false
    await simulateProgress(onProgress)
    return true
  }
}))

/** 获取 debug 模拟数据（仅开发环境有效） */
export function getDebugUpdateInfo(): CheckResult | null {
  return DEBUG_UPDATE ? DEBUG_INFO : null
}
