import { useState, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { type CheckResult } from "@/services/versionCheckService";
import { downloadUpdate, onDownloadProgress } from "@/services/tauriFsService";
import { useUpdateStore } from "@/stores/updateStore";
import { Download, CheckCircle2, ArrowUpRight, Sparkles } from "lucide-react";

type Phase = "confirm" | "downloading" | "done" | "error";

interface Props {
  open: boolean;
  onClose: () => void;
  updateInfo: CheckResult;
}

/**
 * 简单的 Markdown 渲染——仅处理标题、列表、链接，适合 GitHub Release body。
 */
function renderChangelog(body: string | null): string {
  if (!body) return "";
  // 先按 ## 分割成 section
  const sections = body.split(/^## /gm);
  if (sections.length <= 1) {
    // 没有 ## 标题，按段落渲染
    return body
      .replace(
        /### /g,
        '<h4 class="text-[11px] font-semibold text-foreground mt-3 mb-1.5">',
      )
      .replace(/^- /gm, "• ")
      .replace(/^\* /gm, "• ")
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" class="underline text-primary">$1</a>',
      )
      .replace(/\n/g, "<br/>");
  }

  const title = sections[0].trim();
  const rest = sections.slice(1).join("## ");

  let html = "";
  if (title) {
    html += `<p class="text-xs text-muted-foreground mb-2">${title}</p>`;
  }

  // 处理每个 ## section
  const parts = rest.split(/(?=^## )/gm);
  for (const part of parts) {
    const lines = part.trim().split("\n");
    const heading = lines[0].replace(/^## /, "");
    const bodyLines = lines
      .slice(1)
      .join("\n")
      .replace(
        /### /g,
        '<span class="text-[11px] font-medium text-foreground">',
      )
      .replace(/^- /gm, '<span class="text-muted-foreground">• </span>')
      .replace(/^\* /gm, '<span class="text-muted-foreground">• </span>')
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" class="underline text-primary">$1</a>',
      );

    html += `<div class="mb-3">`;
    html += `<h4 class="text-[11px] font-semibold text-foreground mb-1">${heading}</h4>`;
    html += `<div class="text-[11px] leading-relaxed text-muted-foreground space-y-0.5">${bodyLines.replace(/\n/g, "<br/>")}</div>`;
    html += `</div>`;
  }

  return html;
}

export default function UpdateDialog({ open, onClose, updateInfo }: Props) {
  const [phase, setPhase] = useState<Phase>("confirm");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const unlistenRef = useRef<(() => void) | null>(null);
  const simulateDownload = useUpdateStore((s) => s.simulateDownload);

  const handleStart = useCallback(async () => {
    if (!updateInfo.downloadUrl) {
      window.open(updateInfo.latestUrl, "_blank");
      onClose();
      return;
    }

    setPhase("downloading");
    setProgress(0);

    // Debug 模式：使用模拟下载
    if (import.meta.env.DEV) {
      await simulateDownload(setProgress);
      setPhase("done");
      setProgress(100);
      return;
    }

    // 正式环境：Tauri 下载 + 进度事件
    const unlisten = await onDownloadProgress(({ downloaded, total }) => {
      if (total > 0) {
        setProgress(Math.round((downloaded / total) * 100));
      }
    });
    unlistenRef.current = unlisten;

    try {
      const result = await downloadUpdate(updateInfo.downloadUrl);
      unlistenRef.current?.();
      unlistenRef.current = null;
      if (result) {
        setPhase("done");
        setProgress(100);
      } else {
        setPhase("error");
        setErrorMsg("下载失败");
      }
    } catch (e) {
      unlistenRef.current?.();
      unlistenRef.current = null;
      setPhase("error");
      setErrorMsg(e instanceof Error ? e.message : "下载失败");
    }
  }, [updateInfo, onClose, simulateDownload]);

  const handleClose = () => {
    unlistenRef.current?.();
    unlistenRef.current = null;
    onClose();
  };

  const sizeText =
    phase === "downloading" || phase === "done"
      ? ((updateInfo.downloadUrl ?? "")
          .match(/\.(dmg|msi|AppImage)/i)?.[0]
          ?.toUpperCase() ?? "")
      : "";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && phase !== "downloading") handleClose();
      }}
    >
      <DialogContent className="max-w-md min-w-sm gap-0 p-0">
        {/* ── 顶部彩色条 + 图标 ── */}
        <div
          className={`
          flex items-center gap-3 rounded-t-xl px-5 py-4
          ${
            phase === "done"
              ? "bg-emerald-500/10 dark:bg-emerald-500/15"
              : phase === "error"
                ? "bg-destructive/10"
                : "bg-blue-500/10 dark:bg-blue-500/15"
          }
        `}
        >
          {phase === "done" ? (
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          ) : phase === "error" ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/20 text-destructive text-xs font-bold">
              !
            </div>
          ) : (
            <Sparkles className="h-8 w-8 text-blue-500" />
          )}
          <div className="min-w-0 flex-1">
            <DialogTitle className="text-sm font-semibold">
              {phase === "done"
                ? "更新下载完成"
                : phase === "error"
                  ? "更新失败"
                  : phase === "downloading"
                    ? "正在下载更新"
                    : "发现新版本"}
            </DialogTitle>
            <DialogDescription className="text-xs mt-0.5">
              {phase === "done"
                ? "安装包已保存至下载文件夹并打开"
                : phase === "error"
                  ? errorMsg
                  : phase === "downloading"
                    ? `正在下载 v${updateInfo.latestVersion}${sizeText ? ` (${sizeText})` : ""}`
                    : `v${updateInfo.currentVersion} → v${updateInfo.latestVersion}`}
            </DialogDescription>
          </div>
        </div>

        {/* ── 主体内容 ── */}
        <div className="px-5 py-4">
          {/* 变更日志 */}
          {phase === "confirm" && updateInfo.releaseBody && (
            <div
              className="max-h-56 overflow-y-auto rounded-lg border bg-muted/30 p-3 text-[11px] leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: renderChangelog(updateInfo.releaseBody),
              }}
            />
          )}

          {/* 进度条 + 下载信息 */}
          {(phase === "downloading" || phase === "done") && (
            <div className="space-y-3 py-2">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>下载进度</span>
                <span className="font-mono tabular-nums">{progress}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
              {phase === "downloading" && (
                <p className="text-[11px] text-muted-foreground text-center">
                  {progress < 30
                    ? "正在连接服务器…"
                    : progress < 70
                      ? "正在下载安装包…"
                      : "即将完成…"}
                </p>
              )}
              {phase === "done" && (
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-500">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  下载完成
                  {sizeText && (
                    <span className="text-muted-foreground">({sizeText})</span>
                  )}
                </div>
              )}
            </div>
          )}

          {phase === "confirm" && !updateInfo.releaseBody && (
            <p className="text-xs text-muted-foreground py-2 text-center">
              暂无变更日志
            </p>
          )}
        </div>

        <Separator />

        {/* ── 底部按钮 ── */}
        <div className="flex items-center justify-between px-5 py-3">
          <div className="text-[11px] text-muted-foreground">
            {phase === "downloading" && "请勿关闭此窗口"}
            {phase === "done" && "退出应用后安装新版本"}
            {phase === "confirm" && <>
                <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs"
                      onClick={() =>
                        window.open(updateInfo.latestUrl, "_blank")
                      }
                    >
                      查看详情
                      <ArrowUpRight className="ml-1 h-3 w-3" />
                    </Button>
            </>}
          </div>
          <div className="flex items-center gap-2">
            {phase === "confirm" && (
              <>
                <div className=" w-full flex flex-row item-center justify-between">
                  <div className="flex gap-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs"
                      onClick={handleClose}
                    >
                      暂不更新
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 text-xs"
                      onClick={handleStart}
                    >
                      立即更新
                      <Download className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </>
            )}

            {phase === "downloading" && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-xs"
                disabled
              >
                下载中…
              </Button>
            )}

            {phase === "done" && (
              <Button size="sm" className="h-8 text-xs" onClick={handleClose}>
                知道了
              </Button>
            )}

            {phase === "error" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => window.open(updateInfo.latestUrl, "_blank")}
                >
                  手动下载
                  <ArrowUpRight className="ml-1 h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs"
                  onClick={handleClose}
                >
                  关闭
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
