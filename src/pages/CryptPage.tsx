import { useState } from 'react'
import { ArrowLeftRight, CheckCircle2, FileText, KeyRound, Loader2, Lock, LockOpen, Megaphone } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/PageHeader'
import { KeyPanel } from '@/components/KeyPanel'
import { CopyButton } from '@/components/CopyButton'
import { CipherAlgorithm } from '@/types/rsa'
import {
  encrypt,
  decrypt,
  encryptByPrivateKey,
  decryptByPublicKey
} from '@/services/wasmRsaService'
import { useKeyStore } from '@/stores/keyStore'

type Op = 'pub-enc' | 'pri-dec' | 'pri-enc' | 'pub-dec'

export default function CryptPage() {
  const publicKey = useKeyStore((s) => s.publicKey)
  const privateKey = useKeyStore((s) => s.privateKey)
  const publicKeyType = useKeyStore((s) => s.publicKeyType)
  const privateKeyType = useKeyStore((s) => s.privateKeyType)
  const setPublicKey = useKeyStore((s) => s.setPublicKey)
  const setPrivateKey = useKeyStore((s) => s.setPrivateKey)

  const [plainText, setPlainText] = useState('')
  const [resultText, setResultText] = useState('')
  const [processing, setProcessing] = useState<Op | null>(null)
  const cipherAlgorithm = CipherAlgorithm.RSA_ECB_PKCS1Padding

  async function run(op: Op, fn: () => Promise<string>) {
    setProcessing(op)
    try {
      setResultText(await fn())
    } catch (err) {
      toast.error('操作失败：' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setProcessing(null)
    }
  }

  const handleEncrypt = () => {
    if (!publicKeyType) return toast.warning('请检查公钥格式')
    if (!plainText) return toast.warning('请输入原文')
    run('pub-enc', () => encrypt(publicKeyType, plainText, publicKey, cipherAlgorithm))
  }

  const handleDecrypt = () => {
    if (!privateKeyType) return toast.warning('请检查私钥格式')
    if (!plainText) return toast.warning('请输入密文')
    run('pri-dec', () => decrypt(privateKeyType, plainText, privateKey, cipherAlgorithm))
  }

  const handleEncryptByPrivateKey = () => {
    if (!privateKeyType) return toast.warning('请检查私钥格式')
    if (!plainText) return toast.warning('请输入原文')
    run('pri-enc', () => encryptByPrivateKey(privateKeyType, plainText, privateKey, cipherAlgorithm))
  }

  const handleDecryptByPublicKey = () => {
    if (!publicKeyType) return toast.warning('请检查公钥格式')
    if (!plainText) return toast.warning('请输入密文')
    run('pub-dec', () => decryptByPublicKey(publicKeyType, plainText, publicKey, cipherAlgorithm))
  }

  function swapText() {
    const tmp = plainText
    setPlainText(resultText)
    setResultText(tmp)
  }

  function opButton(op: Op, label: string, icon: React.ReactNode, primary: boolean, onClick: () => void) {
    return (
      <Button
        variant={primary ? 'default' : 'secondary'}
        size="sm"
        className="w-full"
        disabled={processing !== null}
        onClick={onClick}
      >
        {processing === op ? <Loader2 className="animate-spin" /> : icon}
        {label}
      </Button>
    )
  }

  return (
    <div>
      <PageHeader title="加密 / 解密" description="使用公钥或私钥对数据进行 RSA 加密与解密" />

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

      <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr]">
        {/* 原文 */}
        <div className="flex flex-col overflow-hidden rounded-xl bg-amber-500/5 shadow-sm">
          <div className="flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            原文
          </div>
          <div className="flex-1 px-4 py-3">
            <textarea
              value={plainText}
              onChange={(e) => setPlainText(e.target.value)}
              rows={10}
              placeholder="请输入待加密的原文"
              className="h-full w-full resize-none bg-transparent font-mono text-xs leading-relaxed outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* 操作列 */}
        <div className="flex flex-row flex-wrap items-center justify-center gap-2.5 px-1 md:w-36 md:flex-col">
          {opButton('pub-enc', '公钥加密', <Lock />, true, handleEncrypt)}
          {opButton('pri-dec', '私钥解密', <LockOpen />, true, handleDecrypt)}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={swapText} aria-label="交换原文与结果">
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
          {opButton('pri-enc', '私钥加密', <Lock />, false, handleEncryptByPrivateKey)}
          {opButton('pub-dec', '公钥解密', <LockOpen />, false, handleDecryptByPublicKey)}
        </div>

        {/* 结果 */}
        <div className="flex flex-col overflow-hidden rounded-xl  bg-emerald-500/5 shadow-sm">
          <div className="flex items-center justify-between px-4 py-2.5">
            <span className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
              <CheckCircle2 className="h-3.5 w-3.5" />
              结果
            </span>
            {resultText && <CopyButton text={resultText} />}
          </div>
          <div className="flex-1 px-4 py-3">
            <textarea
              value={resultText}
              readOnly
              rows={10}
              placeholder="操作结果将显示在这里"
              className="h-full w-full resize-none bg-transparent font-mono text-xs leading-relaxed outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
