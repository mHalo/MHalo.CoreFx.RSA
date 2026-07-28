import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 比较两个 semver 版本号。
 * - 自动去除前导 v/V 前缀
 * - 短版本缺位补零（如 1.2 = 1.2.0）
 * @returns >0 → a 更新, <0 → b 更新, 0 → 相同
 */
export function compareVersions(a: string, b: string): number {
  const clean = (v: string) => v.replace(/^[vV]/, '')
  const pa = clean(a).split('.').map(Number)
  const pb = clean(b).split('.').map(Number)
  const max = Math.max(pa.length, pb.length)
  for (let i = 0; i < max; i++) {
    const na = pa[i] ?? 0
    const nb = pb[i] ?? 0
    if (na > nb) return 1
    if (na < nb) return -1
  }
  return 0
}
