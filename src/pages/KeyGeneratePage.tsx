import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, KeyRound, Loader2, Megaphone, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { PageHeader } from '@/components/PageHeader'
import { Toolbar, ToolbarField } from '@/components/Toolbar'
import { KeyPanel } from '@/components/KeyPanel'
import { KeyTypeTag } from '@/components/KeyTypeTag'
import { RSAKeyType } from '@/types/rsa'
import { generateKeyPair } from '@/services/wasmRsaService'
import { useKeyStore } from '@/stores/keyStore'

const keySizeOptions = [1024, 2048, 3072, 4096]
const keyTypeOptions = [
  { label: 'Pkcs1', value: RSAKeyType.Pkcs1 },
  { label: 'Pkcs8', value: RSAKeyType.Pkcs8 },
  { label: 'XML', value: RSAKeyType.Xml }
]
const formatOptions = [
  { label: 'PEM', value: 'pem' },
  { label: 'TXT', value: 'txt' }
] as const

export default function KeyGeneratePage() {
  const navigate = useNavigate()
  const setKeyPair = useKeyStore((s) => s.setKeyPair)

  const [keySize, setKeySize] = useState(2048)
  const [keyType, setKeyType] = useState<RSAKeyType>(RSAKeyType.Pkcs8)
  const [formatType, setFormatType] = useState<'pem' | 'txt'>('pem')
  const [generating, setGenerating] = useState(false)
  const [publicKey, setPublicKey] = useState('')
  const [privateKey, setPrivateKey] = useState('')

  const formatLabel = formatType === 'pem' ? 'PEM' : 'TXT'

  async function handleGenerate() {
    setGenerating(true)
    try {
      const result = await generateKeyPair(keyType, keySize, formatType === 'pem')
      setPublicKey(result.publicKey)
      setPrivateKey(result.privateKey)
      toast.success('密钥生成成功')
    } catch {
      toast.error('密钥生成失败')
    } finally {
      setGenerating(false)
    }
  }

  function sendTo(path: string) {
    setKeyPair({ publicKey, privateKey }, { public: keyType, private: keyType })
    navigate(path)
  }

  const footer = (
    <>
      <span>密钥格式：{formatLabel}</span>
      <KeyTypeTag type={keyType} />
    </>
  )

  return (
    <div className="animate-fade-in-up stagger-children">
      <PageHeader title="密钥生成" description="生成 RSA 公钥 / 私钥对，支持多种格式与密钥长度" />

      <div className="relative">
        {generating && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl bg-background/80 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="text-sm font-medium text-foreground">正在生成 RSA 密钥对...</div>
            <div className="text-xs text-muted-foreground">密钥长度 {keySize}，请稍候</div>
          </div>
        )}

        <Toolbar>
          <ToolbarField label="密钥类型">
            <Select value={String(keyType)} onValueChange={(v) => setKeyType(Number(v) as RSAKeyType)} disabled={generating}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {keyTypeOptions.map((o) => (
                  <SelectItem key={o.value} value={String(o.value)}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ToolbarField>
          <ToolbarField label="密钥格式">
            <Select value={formatType} onValueChange={(v) => setFormatType(v as 'pem' | 'txt')} disabled={generating}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formatOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ToolbarField>
          <ToolbarField label="密钥长度">
            <Select value={String(keySize)} onValueChange={(v) => setKeySize(Number(v))} disabled={generating}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {keySizeOptions.map((s) => (
                  <SelectItem key={s} value={String(s)}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ToolbarField>
          <div className="flex-1" />
          <Button onClick={handleGenerate} disabled={generating}>
            {generating ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            生成密钥
          </Button>
        </Toolbar>

        <div className="grid gap-4 md:grid-cols-2">
          <KeyPanel
            title="公钥"
            icon={<Megaphone className="h-3.5 w-3.5" />}
            value={publicKey}
            readOnly
            rows={10}
            placeholder="公钥将显示在这里"
            footerLeft={publicKey ? footer : undefined}
          />
          <KeyPanel
            title="私钥"
            icon={<KeyRound className="h-3.5 w-3.5" />}
            value={privateKey}
            readOnly
            rows={10}
            placeholder="私钥将显示在这里"
            footerLeft={privateKey ? footer : undefined}
          />
        </div>
      </div>

      {publicKey && (
        <div className="mt-5 flex gap-3">
          <Button variant="secondary" onClick={() => sendTo('/crypt')}>
            发送到加密/解密
            <ArrowRight />
          </Button>
          <Button variant="secondary" onClick={() => sendTo('/sign')}>
            发送到签名/验签
            <ArrowRight />
          </Button>
        </div>
      )}
    </div>
  )
}
