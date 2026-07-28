import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { existsSync, cpSync, readFileSync } from 'fs'

export default defineConfig(async () => ({
  plugins: [
    react(),
    tailwindcss(),

    // Custom plugin: serve wasm-core/ as static files in dev mode and copy
    // to dist/ on production build. The .NET WASM host lives at <root>/wasm-core/
    // so we can import dotnet.js without Vite's publicDir restrictions.
    {
      name: 'wasm-core',
      configureServer(server) {
        // Intercept /wasm-core/* requests BEFORE Vite's module transform so
        // .wasm files and the dotnet.js bundle are served as raw static assets.
        server.middlewares.use('/wasm-core', (req, res, next) => {
          const relativePath = req.url ?? ''
          const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath
          const base = resolve(__dirname, 'wasm-core')
          const fsPath = resolve(base, cleanPath)
          // Prevent path traversal outside wasm-core/
          if (!fsPath.startsWith(base + '/') && fsPath !== base) {
            res.writeHead(403)
            res.end('Forbidden')
            return
          }
          if (existsSync(fsPath)) {
            const content = readFileSync(fsPath)
            const ext = fsPath.split('.').pop() ?? ''
            const mime: Record<string, string> = {
              js: 'application/javascript',
              wasm: 'application/wasm',
              css: 'text/css',
              png: 'image/png',
              ico: 'image/x-icon',
              json: 'application/json',
              br: 'application/octet-stream',
              gz: 'application/gzip',
              map: 'application/json',
            }
            res.writeHead(200, { 'Content-Type': mime[ext] ?? 'application/octet-stream' })
            res.end(content)
          } else {
            next()
          }
        })
      },
      closeBundle() {
        const src = resolve(__dirname, 'wasm-core')
        const dest = resolve(__dirname, 'dist', 'wasm-core')
        if (existsSync(src)) {
          cpSync(src, dest, { recursive: true, force: true })
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    // index.html uses a top-level await to preload the .NET WASM host;
    // Tauri's WKWebView/Chromium runtimes support it, so target modern envs.
    target: 'es2022'
  },
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**']
    }
  }
}))
