import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  KeyRound,
  Lock,
  PenLine,
  ArrowLeftRight,
  Settings,
  Moon,
  Sun
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useKeyStore } from '@/stores/keyStore'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/sonner'

const toolNav = [
  { to: '/generate', label: '密钥生成', icon: KeyRound },
  { to: '/crypt', label: '加密 / 解密', icon: Lock },
  { to: '/sign', label: '签名 / 验签', icon: PenLine },
  { to: '/transform', label: '格式转换', icon: ArrowLeftRight }
]

const systemNav = [{ to: '/settings', label: '设置', icon: Settings }]

function NavGroup({ title, items }: { title: string; items: typeof toolNav }) {
  return (
    <div>
      <div className="px-3 pb-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </div>
      <nav className="flex flex-col gap-0.5">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] transition-colors',
                isActive
                  ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function WasmStatus() {
  const wasmReady = useKeyStore((s) => s.wasmReady)
  const wasmError = useKeyStore((s) => s.wasmError)

  if (wasmError) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-destructive">
        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
        核心加载失败
      </span>
    )
  }
  if (wasmReady) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-500">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        核心已就绪
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
      核心加载中…
    </span>
  )
}

export default function Layout() {
  const isDark = useKeyStore((s) => s.isDark)
  const setIsDark = useKeyStore((s) => s.setIsDark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary">
              <KeyRound className="h-4 w-4 text-sidebar-primary-foreground" />
            </div>
            <div>
              <div className="text-[13px] font-semibold leading-tight">RSA ToolBox</div>
              <div className="text-[11px] text-muted-foreground">跨平台版</div>
            </div>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="切换深色模式"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
        <Separator className="bg-sidebar-border" />
        <div className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          <NavGroup title="工具" items={toolNav} />
          <NavGroup title="系统" items={systemNav} />
        </div>
        <Separator className="bg-sidebar-border" />
        <div className="px-4 py-3">
          <WasmStatus />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-9 py-7">
          <Outlet />
        </div>
      </main>

      <Toaster />
    </div>
  )
}
