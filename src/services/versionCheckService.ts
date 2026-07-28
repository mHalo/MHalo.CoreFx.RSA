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

export async function checkForUpdate(): Promise<CheckResult | null> {
  const currentVersion = pkg.version

  // 如果有缓存且在 TTL 内，直接返回
  const cached = getCache()
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    // 如果之前已检出更新，无论 TTL 都继续展示
    if (cached.result.isUpdateAvailable) return cached.result
    // 否则复用缓存
    return cached.result
  }

  try {
    const res = await fetch(API_URL, {
      headers: { Accept: 'application/vnd.github+json' }
    })
    if (!res.ok) {
      // 403（限流）或 404 等，返回 null 静默失败；有缓存则返回缓存
      return cached?.result ?? null
    }

    const data = await res.json() as { tag_name?: string; html_url?: string; published_at?: string }
    const latestVersion = (data.tag_name ?? '').replace(/^v/, '')
    if (!/^\d+\.\d+\.\d+/.test(latestVersion)) return null

    const result: CheckResult = {
      currentVersion,
      latestVersion,
      latestUrl: data.html_url ?? `https://github.com/mHalo/MHalo.CoreFx.RSA/releases/tag/v${latestVersion}`,
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
