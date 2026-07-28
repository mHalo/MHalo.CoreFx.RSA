import { Badge } from '@/components/ui/badge'
import { RSAKeyType } from '@/types/rsa'

const config: Record<RSAKeyType, { label: string; className: string }> = {
  [RSAKeyType.Pkcs1]: {
    label: 'PKCS#1',
    className: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-400'
  },
  [RSAKeyType.Pkcs8]: {
    label: 'PKCS#8',
    className:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400'
  },
  [RSAKeyType.Xml]: {
    label: 'XML',
    className:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400'
  }
}

export function KeyTypeTag({ type }: { type: RSAKeyType | null }) {
  if (type === null) return null
  const { label, className } = config[type]
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}
