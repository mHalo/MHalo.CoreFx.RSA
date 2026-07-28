import { useState } from 'react'
import { Palette, Zap, SlidersHorizontal } from 'lucide-react'
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
import { useKeyStore } from '@/stores/keyStore'

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
  const isDark = useKeyStore((s) => s.isDark)
  const setIsDark = useKeyStore((s) => s.setIsDark)

  const [defaultCipher, setDefaultCipher] = useState<CipherAlgorithm>(CipherAlgorithm.RSA_ECB_PKCS1Padding)
  const [defaultSigner, setDefaultSigner] = useState<SignerAlgorithm>(SignerAlgorithm.SHA256withRSA)
  const [autoCopyPublicKey, setAutoCopyPublicKey] = useState(false)

  return (
    <div className="animate-fade-in-up stagger-children">
      <PageHeader title="设置" description="外观与默认算法偏好" />

      <div className="max-w space-y-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Palette className="h-4 w-4" />
              外观
            </CardTitle>
            <CardDescription>界面主题相关设置</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingRow label="深色主题" desc="切换应用整体为深色模式" last>
              <Switch checked={isDark} onCheckedChange={setIsDark} />
            </SettingRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <SlidersHorizontal className="h-4 w-4" />
              默认选项
            </CardTitle>
            <CardDescription>各页面的默认选中算法</CardDescription>
          </CardHeader>
          <CardContent>
            <SettingRow label="默认加密算法" desc="加密页面的默认选中算法">
              <Select
                value={String(defaultCipher)}
                onValueChange={(v) => setDefaultCipher(Number(v) as CipherAlgorithm)}
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
                value={String(defaultSigner)}
                onValueChange={(v) => setDefaultSigner(Number(v) as SignerAlgorithm)}
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
              <Switch checked={autoCopyPublicKey} onCheckedChange={setAutoCopyPublicKey} />
            </SettingRow>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
