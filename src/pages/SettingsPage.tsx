import { Palette, Zap, SlidersHorizontal, Info } from 'lucide-react'
import { useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/PageHeader'
import { CipherAlgorithm, SignerAlgorithm } from '@/types/rsa'
import { useSettingsStore, type ThemeColor } from '@/stores/settingsStore'
import { useUpdateStore } from '@/stores/updateStore'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const cipherOptions = [
  { label: 'RSA/ECB/PKCS1Padding', value: CipherAlgorithm.RSA_ECB_PKCS1Padding },
  { label: 'RSA/ECB/OAEPWithSHA-1AndMGF1Padding', value: CipherAlgorithm.RSA_ECB_OAEPWithSHA_1AndMGF1Padding },
  { label: 'RSA/ECB/OAEPWithSHA-256AndMGF1Padding', value: CipherAlgorithm.RSA_ECB_OAEPWithSHA_256AndMGF1Padding }
]
const signerOptions = [
  { label: 'SHA1withRSA', value: SignerAlgorithm.SHA1withRSA },
  { label: 'SHA256withRSA', value: SignerAlgorithm.SHA256withRSA },
  { label: 'SHA384withRSA', value: SignerAlgorithm.SHA384withRSA },
  { label: 'SHA512withRSA', value: SignerAlgorithm.SHA512withRSA },
  { label: 'MD5withRSA', value: SignerAlgorithm.MD5withRSA }
]
const keyFormatOptions = [
  { label: 'TXT', value: 'txt' },
  { label: 'PEM', value: 'pem' }
]
const radiusOptions = [
  { label: '直角', value: 0 },
  { label: '小', value: 0.25 },
  { label: '默认', value: 0.45 },
  { label: '大', value: 0.75 }
]
const themeColorOptions: { label: string; value: ThemeColor; swatch: string }[] = [
  { label: '青柠绿', value: 'lime', swatch: 'oklch(0.78 0.24 130.85)' },
  { label: '靛蓝', value: 'indigo', swatch: 'oklch(0.51 0.19 263)' },
  { label: '天蓝', value: 'sky', swatch: 'oklch(0.62 0.16 230)' },
  { label: '玫红', value: 'rose', swatch: 'oklch(0.6 0.2 15)' }
]

function SettingRow({
  label,
  desc,
  children,
  last = false
}: {
  label: string
  desc: string
  children: React.ReactNode
  last?: boolean
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium">{label}</div>
          <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
        </div>
        {children}
      </div>
      {!last && <Separator />}
    </>
  )
}

export default function SettingsPage() {
  const s = useSettingsStore()
  const updateInfo = useUpdateStore((st) => st.updateInfo)
  const isChecking = useUpdateStore((st) => st.isChecking)
  const check = useUpdateStore((st) => st.checkForUpdate)

  useEffect(() => {
    check()
  }, [check])

  return (
    <div className="animate-fade-in-up stagger-children">
      <PageHeader title="设置" description="外观与默认算法偏好（自动保存到本地）" />

      <div className="max-w space-y-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Palette className="h-4 w-4" />
              外观
            </CardTitle>
            <CardDescription>界面主题与风格相关设置</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingRow label="深色主题" desc="切换应用整体为深色模式">
              <Switch checked={s.isDark} onCheckedChange={s.setIsDark} />
            </SettingRow>
            <SettingRow label="主题配色" desc="主按钮、强调色与侧边栏图标的颜色">
              <div className="flex gap-2">
                {themeColorOptions.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => s.setThemeColor(o.value)}
                    aria-label={o.label}
                    title={o.label}
                    className={`h-7 w-7 rounded-full transition-all ${
                      s.themeColor === o.value
                        ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110'
                        : 'hover:scale-110 opacity-80 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: o.swatch }}
                  />
                ))}
              </div>
            </SettingRow>
            <SettingRow label="界面圆角" desc="卡片、按钮、输入框的圆角大小" last>
              <Select value={String(s.radius)} onValueChange={(v) => s.setRadius(Number(v))}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {radiusOptions.map((o) => (
                    <SelectItem key={o.value} value={String(o.value)}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <SlidersHorizontal className="h-4 w-4" />
              默认选项
            </CardTitle>
            <CardDescription>各页面的默认选中项</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingRow label="默认密钥格式" desc="密钥生成与格式转换页面的默认输出格式">
              <Select
                value={s.defaultKeyFormat}
                onValueChange={(v) => s.setDefaultKeyFormat(v as 'pem' | 'txt')}
              >
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {keyFormatOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow
              label="密钥长度严格对齐"
              desc="生成的模数位数严格等于选定长度（关闭时允许±1 bit偏差，几乎无安全影响，但生成更快）"
            >
              <Switch checked={s.strictKeySize} onCheckedChange={s.setStrictKeySize} />
            </SettingRow>
            <SettingRow label="默认加密算法" desc="加密页面的默认选中算法">
              <Select
                value={String(s.defaultCipher)}
                onValueChange={(v) => s.setDefaultCipher(Number(v) as CipherAlgorithm)}
              >
                <SelectTrigger className="w-96">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {cipherOptions.map((o) => (
                    <SelectItem key={o.value} value={String(o.value)}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>
            <SettingRow label="默认签名算法" desc="签名页面的默认选中算法" last>
              <Select
                value={String(s.defaultSigner)}
                onValueChange={(v) => s.setDefaultSigner(Number(v) as SignerAlgorithm)}
              >
                <SelectTrigger className="w-96">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {signerOptions.map((o) => (
                    <SelectItem key={o.value} value={String(o.value)}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4" />
              快捷操作
            </CardTitle>
            <CardDescription>提升效率的自动化行为</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingRow label="生成后自动复制公钥" desc="密钥生成成功后自动将公钥复制到剪贴板" last>
              <Switch checked={s.autoCopyPublicKey} onCheckedChange={s.setAutoCopyPublicKey} />
            </SettingRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Info className="h-4 w-4" />
                关于与更新
              </span>
            </CardTitle>
            <CardDescription>应用版本与更新检查</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingRow
              label="当前版本"
              last={true}
              desc={updateInfo?.currentVersion ?? '已是最新版本'}
            >
              <div className="flex items-center gap-2">
                
                {updateInfo?.isUpdateAvailable ? (
                  <>
                    <span className='mr-2 text-blue-600 dark:text-blue-400'>发现新版本 v{updateInfo?.latestVersion}</span>
                    <Button
                      size="sm"
                      className="h-7 text-xs" 
                      onClick={() => window.open(updateInfo.latestUrl, '_blank')}
                    >
                      前往更新
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs"
                    disabled={isChecking}
                    onClick={async () => {
                      const result = await check(true)
                      if (result?.isUpdateAvailable) {
                        toast.success(`发现新版本 v${result.latestVersion}`)
                      } else if (result) {
                        toast.success('已是最新版本')
                      } else {
                        toast.error('检查失败，请稍后重试')
                      }
                    }}
                  >
                    {isChecking ? '检查中...' : '检查更新'}
                  </Button>
                )}
              </div>
            </SettingRow>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
