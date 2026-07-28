import { useState } from 'react'
import { CheckCircle2, FileText, KeyRound, Loader2, Megaphone, PenLine, ShieldCheck, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/PageHeader'
import { Toolbar, ToolbarField } from '@/components/Toolbar'
import { KeyPanel } from '@/components/KeyPanel'
import { CopyButton } from '@/components/CopyButton'
import { SignerAlgorithm } from '@/types/rsa'
import { sign, verify } from '@/services/wasmRsaService'
import { useKeyStore } from '@/stores/keyStore'

const signerOptions = [
  { label: 'SHA1withRSA', value: SignerAlgorithm.SHA1withRSA },
  { label: 'SHA256withRSA', value: SignerAlgorithm.SHA256withRSA },
  { label: 'SHA384withRSA', value: SignerAlgorithm.SHA384withRSA },
  { label: 'SHA512withRSA', value: SignerAlgorithm.SHA512withRSA },
  { label: 'MD5withRSA', value: SignerAlgorithm.MD5withRSA }
]

export default function SignPage() {
  const publicKey = useKeyStore((s) => s.publicKey)
  const privateKey = useKeyStore((s) => s.privateKey)
  const publicKeyType = useKeyStore((s) => s.publicKeyType)
  const privateKeyType = useKeyStore((s) => s.privateKeyType)
  const setPublicKey = useKeyStore((s) => s.setPublicKey)
  const setPrivateKey = useKeyStore((s) => s.setPrivateKey)

  const [plainText, setPlainText] = useState('')
  const [signatureResult, setSignatureResult] = useState('')
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null)
  const [signerAlgorithm, setSignerAlgorithm] = useState<SignerAlgorithm>(SignerAlgorithm.SHA256withRSA)
  const [processing, setProcessing] = useState<'sign' | 'verify' | null>(null)

  async function handleSign() {
    if (!privateKeyType) return toast.warning('请检查私钥格式')
    if (!plainText) return toast.warning('请输入待签名数据')
    setProcessing('sign')
    setVerifyResult(null)
    try {
      setSignatureResult(await sign(privateKeyType, plainText, privateKey, signerAlgorithm))
      toast.success('签名成功')
    } catch (err) {
      toast.error('签名失败：' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setProcessing(null)
    }
  }

  async function handleVerify() {
    if (!publicKeyType) return toast.warning('请检查公钥格式')
    if (!plainText) return toast.warning('请输入原始数据')
    if (!signatureResult) return toast.warning('请先进行签名或输入签名')
    setProcessing('verify')
    try {
      const ok = await verify(publicKeyType, plainText, signatureResult, publicKey, signerAlgorithm)
      setVerifyResult(ok)
      if (ok) toast.success('验证通过')
      else toast.error('验证失败')
    } catch (err) {
      setVerifyResult(false)
      toast.error('验签失败：' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setProcessing(null)
    }
  }

  const copyText = signatureResult || (verifyResult !== null ? (verifyResult ? '验证通过' : '验证失败') : '')

  return (
    <div>
      <PageHeader title="签名 / 验签" description="使用私钥签名数据、使用公钥验证签名完整性" />

      <div className="mb-4 grid gap-4 md:grid-cols-2">
        <KeyPanel
          title="公钥"
          icon={<Megaphone className="h-3.5 w-3.5" />}
          value={publicKey}
          onChange={(v) => setPublicKey(v, publicKeyType)}
          rows={5}
          placeholder="请输入或粘贴公钥"
          keyType={publicKeyType}
        />
        <KeyPanel
          title="私钥"
          icon={<KeyRound className="h-3.5 w-3.5" />}
          value={privateKey}
          onChange={(v) => setPrivateKey(v, privateKeyType)}
          rows={5}
          placeholder="请输入或粘贴私钥"
          keyType={privateKeyType}
        />
      </div>

      <Toolbar className="justify-center">
        <ToolbarField label="签名算法">
          <Select
            value={String(signerAlgorithm)}
            onValueChange={(v) => setSignerAlgorithm(Number(v) as SignerAlgorithm)}
          >
            <SelectTrigger className="w-48">
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
        </ToolbarField>
        <Separator orientation="vertical" className="h-6" />
        <Button size="sm" disabled={processing !== null} onClick={handleSign}>
          {processing === 'sign' ? <Loader2 className="animate-spin" /> : <PenLine />}
          私钥签名
        </Button>
        <Button size="sm" variant="secondary" disabled={processing !== null} onClick={handleVerify}>
          {processing === 'verify' ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
          公钥验签
        </Button>
      </Toolbar>

      <div className="grid gap-4 md:grid-cols-2">
        {/* 原文 */}
        <div className="flex flex-col overflow-hidden rounded-2xl bg-amber-500/5 dark:border dark:border-border">
          <div className="flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            原文 / 数据
          </div>
          <div className="flex-1 px-4 py-3">
            <textarea
              value={plainText}
              onChange={(e) => setPlainText(e.target.value)}
              rows={8}
              placeholder="请输入待签名或待验签的原始数据"
              className="h-full w-full resize-none rounded-2xl bg-transparent px-2 py-1 font-mono text-xs leading-relaxed outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* 结果 */}
        <div className="flex flex-col overflow-hidden rounded-2xl bg-emerald-500/5 dark:border dark:border-border">
          <div className="flex items-center justify-between  px-4 py-2.5">
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              结果 / 签名
            </span>
            {copyText && <CopyButton text={copyText} />}
          </div>
          <div className="flex-1 px-4 py-3">
            {signatureResult && verifyResult === null ? (
              <textarea
                value={signatureResult}
                readOnly
                rows={8}
                className="h-full w-full resize-none rounded-2xl bg-transparent px-2 py-1 font-mono text-xs leading-relaxed outline-none"
              />
            ) : verifyResult !== null ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                {verifyResult ? (
                  <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                ) : (
                  <XCircle className="h-12 w-12 text-destructive" />
                )}
                <div
                  className={`mt-3.5 text-[17px] font-semibold ${verifyResult ? 'text-emerald-600 dark:text-emerald-500' : 'text-destructive'}`}
                >
                  {verifyResult ? '验证通过' : '验证失败'}
                </div>
                <div className="mt-1.5 text-[13px] text-muted-foreground">
                  {verifyResult ? '签名与数据匹配' : '签名与数据不匹配，请检查输入'}
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center py-8 text-[13px] text-muted-foreground">
                签名或验签结果将显示在这里
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
