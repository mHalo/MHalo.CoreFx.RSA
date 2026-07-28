/**
 * Tauri 文件系统服务——封装 Rust 端 save/ open-folder 命令。
 * 仅在 Tauri 环境下可用，浏览器 dev 模式下降级为 no-op。
 */

import { invoke as tauriInvoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'

async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
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

/**
 * 下载更新安装包到本地并打开。
 * 返回 Rust 端的成功消息，失败返回 null。
 * 进度通过 Tauri 事件 `update-download-progress` 发送。
 */
export async function downloadUpdate(url: string): Promise<string | null> {
  return safeInvoke<string>('download_update', { url })
}

/**
 * 监听下载进度事件。
 * 返回取消监听的函数。
 */
export function onDownloadProgress(
  callback: (payload: { downloaded: number; total: number }) => void
): Promise<() => void> {
  return listen<{ downloaded: number; total: number }>(
    'update-download-progress',
    (event) => callback(event.payload)
  )
}
