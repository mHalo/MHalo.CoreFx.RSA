import { useState, useRef, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { type CheckResult } from '@/services/versionCheckService'
import { downloadUpdate, onDownloadProgress } from '@/services/tauriFsService'
import { Download, ExternalLink } from 'lucide-react'

type Phase = 'confirm' | 'downloading' | 'done' | 'error'

interface Props {
  open: boolean
  onClose: () => void
  updateInfo: CheckResult
}

/**
 * 简单的 Markdown 渲染——仅处理标题、列表、链接，适合 GitHub Release body。
 */
function renderChangelog(body: string | null): string {
  if (!body) return ''
  return body
    .replace(/### /g, '## ')
    .replace(/^- /gm, '• ')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="underline text-primary">$1</a>')
    .replace(/\n/g, '<br/>')
}

export default function UpdateDialog({ open, onClose, updateInfo }: Props) {
  const [phase, setPhase] = useState<Phase>('confirm')
  const [progress, setProgress] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const unlistenRef = useRef<(() => void) | null>(null)

  const handleStart = useCallback(async () => {
    if (!updateInfo.downloadUrl) {
      window.open(updateInfo.latestUrl, '_blank')
      onClose()
      return
    }

    setPhase('downloading')
    setProgress(0)

    // 注册进度监听
    const unlisten = await onDownloadProgress(({ downloaded, total }) => {
      if (total > 0) {
        setProgress(Math.round((downloaded / total) * 100))
      }
    })
    unlistenRef.current = unlisten

    try {
      const result = await downloadUpdate(updateInfo.downloadUrl)
      unlistenRef.current?.()
      unlistenRef.current = null
      if (result) {
        setPhase('done')
        setProgress(100)
      } else {
        setPhase('error')
        setErrorMsg('下载失败')
      }
    } catch (e) {
      unlistenRef.current?.()
      unlistenRef.current = null
      setPhase('error')
      setErrorMsg(e instanceof Error ? e.message : '下载失败')
    }
  }, [updateInfo, onClose])

  const handleClose = () => {
    unlistenRef.current?.()
    unlistenRef.current = null
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <DialogContent className="max-w-lg gap-4">
        <DialogHeader>
          <DialogTitle className="text-base">
            {phase === 'done' ? '更新完成' : `发现新版本 v${updateInfo.latestVersion}`}
          </DialogTitle>
          <DialogDescription>
            {phase === 'done'
              ? '安装包已打开，退出应用后安装即可'
              : phase === 'error'
                ? errorMsg
                : `当前版本 v${updateInfo.currentVersion}`}
          </DialogDescription>
        </DialogHeader>

        {/* 变更日志 */}
        {phase === 'confirm' && updateInfo.releaseBody && (
          <div
            className="max-h-48 overflow-y-auto rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground"
            dangerouslySetInnerHTML={{
              __html: renderChangelog(updateInfo.releaseBody)
            }}
          />
        )}

        {/* 进度条 */}
        {phase === 'downloading' && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-center text-xs text-muted-foreground">
              正在下载… {progress}%
            </p>
          </div>
        )}

        {phase === 'done' && (
          <div className="space-y-2">
            <Progress value={100} />
            <p className="text-center text-xs text-muted-foreground">
              下载完成 ✓
            </p>
          </div>
        )}

        {/* 底部按钮 */}
        <div className="flex items-center justify-end gap-2">
          {phase === 'confirm' && (
            <>
              <Button size="sm" variant="ghost" onClick={handleClose}>
                暂不更新
              </Button>
              <Button
                size="sm"
                onClick={() => window.open(updateInfo.latestUrl, '_blank')}
                variant="outline"
              >
                <ExternalLink className="mr-1 h-3.5 w-3.5" />
                Release 页面
              </Button>
              <Button size="sm" onClick={handleStart}>
                <Download className="mr-1 h-3.5 w-3.5" />
                立即更新
              </Button>
            </>
          )}

          {phase === 'downloading' && (
            <p className="text-xs text-muted-foreground">请稍候，正在下载安装包…</p>
          )}

          {phase === 'done' && (
            <Button size="sm" onClick={handleClose}>
              完成
            </Button>
          )}

          {phase === 'error' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(updateInfo.latestUrl, '_blank')}
              >
                <ExternalLink className="mr-1 h-3.5 w-3.5" />
                手动下载
              </Button>
              <Button size="sm" onClick={handleClose}>
                关闭
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
