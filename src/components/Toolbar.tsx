import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ToolbarProps {
  children: ReactNode
  className?: string
}

export function Toolbar({ children, className }: ToolbarProps) {
  return (
    <div
      className={cn(
        'mb-5 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-xl border bg-card px-5 py-3 shadow-sm',
        className
      )}
    >
      {children}
    </div>
  )
}

interface ToolbarFieldProps {
  label: string
  children: ReactNode
}

export function ToolbarField({ label, children }: ToolbarFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="whitespace-nowrap text-[13px] text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}
