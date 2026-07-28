/**
 * 版本更新检查服务——获取 GitHub Latest Release 并与当前版本比较。
 * 缓存 1 小时，避免触发 GitHub API 限流。
 */
import { compareVersions } from '@/lib/utils'
import pkg from '../../package.json'

export interface CheckResult {
  currentVersion: string
  latestVersion: string
  latestUrl: string
  downloadUrl: string | null
  releaseBody: string | null
  isUpdateAvailable: boolean
  publishedAt: string
}

const CACHE_KEY = 'rsatoolbox-update-check'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 小时
const API_URL = 'https://api.github.com/repos/mHalo/MHalo.CoreFx.RSA/releases/latest'

interface CacheEntry {
  timestamp: number
  result: CheckResult
}

function getCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    return entry
  } catch {
    return null
  }
}

function setCache(result: CheckResult): void {
  try {
    const entry: CacheEntry = { timestamp: Date.now(), result }
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry))
  } catch { /* 静默失败 */ }
}

export async function checkForUpdate(forceRefresh = false): Promise<CheckResult | null> {
  const currentVersion = pkg.version
  const cached = getCache()

  // 如果有缓存且在 TTL 内，直接返回（forceRefresh 跳过缓存）
  if (!forceRefresh) {
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      // 如果之前已检出更新，无论 TTL 都继续展示
      if (cached.result.isUpdateAvailable) return cached.result
      // 否则复用缓存
      return cached.result
    }
  }

  try {
    const res = await fetch(API_URL, {
      headers: { Accept: 'application/vnd.github+json' }
    })
    if (!res.ok) {
      // 403（限流）或 404 等，返回 null 静默失败；有缓存则返回缓存
      return cached?.result ?? null
    }

    const data = await res.json() as {
      tag_name?: string
      html_url?: string
      published_at?: string
      body?: string
      assets?: { browser_download_url: string; name: string }[]
    }
    const latestVersion = (data.tag_name ?? '').replace(/^v/, '')
    if (!/^\d+\.\d+\.\d+/.test(latestVersion)) return null

    // 根据当前平台筛选对应的安装包
    const downloadUrl = pickPlatformAsset(data.assets ?? [])

    const result: CheckResult = {
      currentVersion,
      latestVersion,
      latestUrl: data.html_url ?? `https://github.com/mHalo/MHalo.CoreFx.RSA/releases/tag/v${latestVersion}`,
      downloadUrl,
      releaseBody: data.body ?? null,
      isUpdateAvailable: compareVersions(latestVersion, currentVersion) > 0,
      publishedAt: data.published_at ?? ''
    }

    setCache(result)
    return result
  } catch {
    return cached?.result ?? null
  }
}

/**
 * 获取最新版本号，用于惰性展示（不触发完整比较逻辑）。
 * 从缓存或 API 获取。
 */
export async function fetchLatestVersion(): Promise<string | null> {
  const result = await checkForUpdate()
  return result?.latestVersion ?? null
}

/** 根据当前平台匹配 GitHub Release Assets 中的安装包下载地址 */
function pickPlatformAsset(assets: { browser_download_url: string; name: string }[]): string | null {
  // 通过 Tauri API 的 navigator 特征判断平台
  const ua = navigator.userAgent

  // macOS → .dmg
  if (ua.includes('Mac')) {
    const dmg = assets.find((a) => a.name.endsWith('.dmg'))
    return dmg?.browser_download_url ?? null
  }

  // Windows → .msi
  if (ua.includes('Win')) {
    const msi = assets.find((a) => a.name.endsWith('.msi'))
    return msi?.browser_download_url ?? null
  }

  // Linux → .AppImage
  const appImage = assets.find((a) => a.name.endsWith('.AppImage'))
  return appImage?.browser_download_url ?? null
}
