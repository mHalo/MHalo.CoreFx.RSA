import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import KeyGeneratePage from '@/pages/KeyGeneratePage'
import { initializeRuntime } from '@/services/wasmRsaService'
import { useKeyStore } from '@/stores/keyStore'

function Placeholder({ name }: { name: string }) {
  return <div className="text-muted-foreground">{name}（待实现）</div>
}

export default function App() {
  const setWasmReady = useKeyStore((s) => s.setWasmReady)
  const setWasmError = useKeyStore((s) => s.setWasmError)

  useEffect(() => {
    initializeRuntime()
      .then(() => setWasmReady(true))
      .catch((err) => {
        setWasmError(err instanceof Error ? err.message : String(err))
        console.error('Failed to initialize RSA ToolBox:', err)
      })
  }, [setWasmReady, setWasmError])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/generate" replace />} />
          <Route path="/generate" element={<KeyGeneratePage />} />
          <Route path="/crypt" element={<Placeholder name="加密 / 解密" />} />
          <Route path="/sign" element={<Placeholder name="签名 / 验签" />} />
          <Route path="/transform" element={<Placeholder name="格式转换" />} />
          <Route path="/settings" element={<Placeholder name="设置" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
