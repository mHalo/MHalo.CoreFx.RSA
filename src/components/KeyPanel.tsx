import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/CopyButton'
import { KeyTypeTag } from '@/components/KeyTypeTag'
import { RSAKeyType } from '@/types/rsa'

interface KeyPanelProps {
  title: string
  icon?: ReactNode
  value: string
  onChange?: (value: string) => void
  placeholder?: string
  readOnly?: boolean
  rows?: number
  keyType?: RSAKeyType | null
  footerLeft?: ReactNode
  className?: string
}

export function KeyPanel({
  title,
  icon,
  value,
  onChange,
  placeholder,
  readOnly = false,
  rows = 6,
  keyType,
  footerLeft,
  className
}: KeyPanelProps) {
  return (
    <div className={cn('flex flex-col overflow-hidden rounded-xl bg-card transition-all duration-200  hover:shadow-lg dark:hover:shadow-none dark:hover:brightness-105', className)}>
      <div className="flex items-center justify-between gap-2 px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
          {icon}
          {title}
        </span>
        <span className="flex items-center gap-1">
          {keyType !== undefined && <KeyTypeTag type={keyType} />}
          {readOnly && value && <CopyButton text={value} />}
        </span>
      </div>
      <div className="flex-1 px-4 py-3">
        <Textarea
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          placeholder={placeholder}
          readOnly={readOnly}
          rows={rows}
          className="resize-none border-0 bg-transparent p-0 font-mono text-xs leading-relaxed shadow-none focus-visible:ring-0"
        />
      </div>
      {footerLeft && (
        <div className="flex items-center justify-between gap-2 px-4 pb-3 pt-1 text-xs text-muted-foreground">
          {footerLeft}
        </div>
      )}
    </div>
  )
}
