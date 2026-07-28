import { Badge } from '@/components/ui/badge'
import { RSAKeyType } from '@/types/rsa'

const config: Record<RSAKeyType, { label: string; className: string }> = {
  [RSAKeyType.Pkcs1]: {
    label: 'PKCS#1',
    className: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-400'
  },
  [RSAKeyType.Pkcs8]: {
    label: 'PKCS#8',
    className: 'border-primary/30 bg-primary/10 text-primary'
  },
  [RSAKeyType.Xml]: {
    label: 'XML',
    className:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400'
  }
}

export function KeyTypeTag({ type, detectFailed = false }: { type: RSAKeyType | null; detectFailed?: boolean }) {
  if (type === null && !detectFailed) return null
  if (type === null) {
    return (
      <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">
        无法识别
      </Badge>
    )
  }
  const { label, className } = config[type]
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  )
}
