import { useState } from 'react'
import { ArrowLeftRight, KeyRound, Loader2, Lock, Megaphone } from 'lucide-react'
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
import { transformPrivateKeyFormat, detectKeyType } from '@/services/wasmRsaService'

const keyTypeOptions = [
  { label: 'Pkcs1', value: RSAKeyType.Pkcs1 },
  { label: 'Pkcs8', value: RSAKeyType.Pkcs8 },
  { label: 'XML', value: RSAKeyType.Xml }
]
const formatOptions = [
  { label: 'PEM', value: 'pem' },
  { label: 'TXT', value: 'txt' }
] as const

export default function TransformPage() {
  const [targetPrivateType, setTargetPrivateType] = useState<RSAKeyType>(RSAKeyType.Pkcs8)
  const [outputFormat, setOutputFormat] = useState<'pem' | 'txt'>('pem')
  const [processing, setProcessing] = useState(false)

  const [inputPrivateKey, setInputPrivateKey] = useState('')
  const [inputPrivateKeyType, setInputPrivateKeyType] = useState<RSAKeyType | null>(null)
  const [outputPublicKey, setOutputPublicKey] = useState('')
  const [outputPrivateKey, setOutputPrivateKey] = useState('')

  const outputFormatLabel = outputFormat === 'pem' ? 'PEM' : 'TXT'

  async function handleTransform() {
    if (!inputPrivateKey) return toast.warning('请输入私钥')
    try {
      setInputPrivateKeyType(await detectKeyType(inputPrivateKey, true))
    } catch {
      setInputPrivateKeyType(null)
    }
    setProcessing(true)
    try {
      const result = await transformPrivateKeyFormat(inputPrivateKey, targetPrivateType, outputFormat === 'pem')
      if (!result.success) {
        toast.error('私钥格式转换失败')
        return
      }
      setOutputPublicKey(result.publicKey)
      setOutputPrivateKey(result.privateKey)
      toast.success('转换成功')
    } catch (err) {
      toast.error('转换失败：' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setProcessing(false)
    }
  }

  const footer = (
    <>
      <span>密钥格式：{outputFormatLabel}</span>
      <KeyTypeTag type={targetPrivateType} />
    </>
  )

  return (
    <div>
      <PageHeader title="密钥格式转换" description="在 PKCS#1、PKCS#8、XML 等密钥格式之间相互转换" />

      <KeyPanel
        title="输入私钥"
        icon={<KeyRound className="h-3.5 w-3.5" />}
        value={inputPrivateKey}
        onChange={setInputPrivateKey}
        rows={6}
        placeholder="请输入私钥（支持自动识别格式）"
        keyType={inputPrivateKeyType}
        className="mb-4"
      />

      <Toolbar className="justify-center">
        <ToolbarField label="目标密钥类型">
          <Select
            value={String(targetPrivateType)}
            onValueChange={(v) => setTargetPrivateType(Number(v) as RSAKeyType)}
          >
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
          <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as 'pem' | 'txt')}>
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
        <Button size="sm" disabled={processing} onClick={handleTransform}>
          {processing ? <Loader2 className="animate-spin" /> : <ArrowLeftRight />}
          转换密钥
        </Button>
      </Toolbar>

      <div className="grid gap-4 md:grid-cols-2">
        <KeyPanel
          title="对应公钥"
          icon={<Megaphone className="h-3.5 w-3.5" />}
          value={outputPublicKey}
          readOnly
          rows={8}
          placeholder="转换后的公钥将显示在这里"
          footerLeft={outputPublicKey ? footer : undefined}
        />
        <KeyPanel
          title="转换后私钥"
          icon={<Lock className="h-3.5 w-3.5" />}
          value={outputPrivateKey}
          readOnly
          rows={8}
          placeholder="转换后的私钥将显示在这里"
          footerLeft={outputPrivateKey ? footer : undefined}
        />
      </div>
    </div>
  )
}
