import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { initializeRuntime } from '@/services/wasmRsaService'
import { useKeyStore } from '@/stores/keyStore'

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
        <Route path="/" element={<Navigate to="/generate" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
