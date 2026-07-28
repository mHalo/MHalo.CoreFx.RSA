import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import {
  KeyRound,
  Lock,
  PenLine,
  ArrowLeftRight,
  Settings,
  Moon,
  Sun,
  ArrowUpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useKeyStore } from '@/stores/keyStore'
import { useSettingsStore, themeColorVars } from '@/stores/settingsStore'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/sonner'
import { useUpdateStore } from '@/stores/updateStore'
import UpdateDialog from '@/components/UpdateDialog'
import { useState } from 'react'

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

function UpdateIndicator() {
  const isChecking = useUpdateStore((s) => s.isChecking)
  const hasUpdate = useUpdateStore((s) => s.hasUpdate)
  const latestVersion = useUpdateStore((s) => s.updateInfo?.latestVersion)
  const latestUrl = useUpdateStore((s) => s.updateInfo?.latestUrl)
  const check = useUpdateStore((s) => s.checkForUpdate)

  useEffect(() => {
    check()
  }, [check])

  if (isChecking) {
    return (
      <span className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
        检查更新中…
      </span>
    )
  }

  if (hasUpdate && latestVersion) {
    return (
      <button
        onClick={() => window.open(latestUrl, '_blank')}
        className="flex items-center justify-center gap-1 text-xs text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors cursor-pointer"
        title={`发现新版本 v${latestVersion}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        新版本 v{latestVersion}
      </button>
    )
  }

  return null
}

function WasmStatus() {
  const wasmReady = useKeyStore((s) => s.wasmReady)
  const wasmError = useKeyStore((s) => s.wasmError)

  if (wasmError) {
    return (
      <span className="flex items-center justify-center gap-1 text-xs text-destructive">
        <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
        核心加载失败
      </span>
    )
  }
  if (wasmReady) {
    return (
      <span className="flex items-center justify-center gap-1 text-xs text-emerald-600 dark:text-emerald-500">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        核心已就绪
      </span>
    )
  }
  return (
    <span className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
      核心加载中…
    </span>
  )
}

export default function Layout() {
  const isDark = useSettingsStore((s) => s.isDark)
  const setIsDark = useSettingsStore((s) => s.setIsDark)
  const radius = useSettingsStore((s) => s.radius)
  const themeColor = useSettingsStore((s) => s.themeColor)
  const currentVersion = useUpdateStore((s) => s.updateInfo?.currentVersion)
  const hasUpdate = useUpdateStore((s) => s.hasUpdate)
  const updateInfo = useUpdateStore((s) => s.updateInfo)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--radius', `${radius}rem`)
  }, [radius])

  useEffect(() => {
    const root = document.documentElement
    const vars = themeColorVars[themeColor]
    const mode = isDark ? 1 : 0
    root.style.setProperty('--primary', vars.primary[mode])
    root.style.setProperty('--primary-foreground', vars.primaryForeground[mode])
    root.style.setProperty('--ring', vars.ring[mode])
    root.style.setProperty('--sidebar-primary', vars.sidebarPrimary[mode])
    root.style.setProperty('--sidebar-primary-foreground', vars.sidebarPrimaryForeground[mode])
    root.style.setProperty('--sidebar-ring', vars.sidebarRing[mode])
  }, [themeColor, isDark])

  return (
    <div className="flex h-screen flex-col bg-background border-t border-border">
      {/* Body */}
      <div className="flex flex-1 min-h-0 p-3">
        <aside className="flex w-56 shrink-0 flex-col rounded-xl bg-sidebar text-sidebar-foreground shadow-lg">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="RSA工具箱" className="h-7 w-7" />
              <div>
                <div className="text-[13px] font-semibold leading-tight">RSA工具箱</div>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <span>v{currentVersion ?? '-'}</span>
                  {hasUpdate && (
                    <button
                      onClick={() => setUpdateDialogOpen(true)}
                      className="cursor-pointer"
                      title="下载最新版本"
                    >
                      <ArrowUpCircle className="h-3 w-3 text-blue-500" />
                    </button>
                  )}
                </div>
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
          <div className="space-y-1.5 px-4 py-3">
            <WasmStatus />
            <UpdateIndicator />
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-9 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      <Toaster position="top-center" />

      {/* 更新弹窗 */}
      {updateInfo && (
        <UpdateDialog
          open={updateDialogOpen}
          onClose={() => setUpdateDialogOpen(false)}
          updateInfo={updateInfo}
        />
      )}
    </div>
  )
}
