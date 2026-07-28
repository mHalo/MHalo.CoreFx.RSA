import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from '@/components/Layout'
import KeyGeneratePage from '@/pages/KeyGeneratePage'
import CryptPage from '@/pages/CryptPage'
import SignPage from '@/pages/SignPage'
import TransformPage from '@/pages/TransformPage'
import SettingsPage from '@/pages/SettingsPage'
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
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/generate" replace />} />
          <Route path="/generate" element={<KeyGeneratePage />} />
          <Route path="/crypt" element={<CryptPage />} />
          <Route path="/sign" element={<SignPage />} />
          <Route path="/transform" element={<TransformPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
