/**
 * Tauri 文件系统服务——封装 Rust 端 save/ open-folder 命令。
 * 仅在 Tauri 环境下可用，浏览器 dev 模式下降级为 no-op。
 */

async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  // Dynamic import so Vite doesn't fail when @tauri-apps/api is unavailable (browser dev)
  const { invoke: tauriInvoke } = await import('@tauri-apps/api/core')
  return tauriInvoke<T>(cmd, args)
}

let tauriAvailable = true

async function safeInvoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T | null> {
  if (!tauriAvailable) return null
  try {
    return await invoke<T>(cmd, args)
  } catch {
    tauriAvailable = false
    return null
  }
}

/** 生成桌面保存路径并创建目录，返回完整路径字符串 */
export async function getSavePath(keyType: string): Promise<string | null> {
  return safeInvoke<string>('get_save_path', { keyType })
}

/** 将 content 写入绝对路径 filePath */
export async function saveKeyFile(filePath: string, content: string): Promise<boolean> {
  const result = await safeInvoke('save_key_file', { filePath, content })
  return result !== null
}

/** 用系统文件管理器打开文件夹 */
export async function openFolder(path: string): Promise<boolean> {
  const result = await safeInvoke('open_folder', { path })
  return result !== null
}
