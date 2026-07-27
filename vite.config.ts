import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { existsSync, cpSync } from 'fs'

export default defineConfig(async () => ({
  plugins: [
    vue(),

    // Custom plugin: copy wasm-core/ into dist/ after Vite production build.
    // The .NET WASM build output lives at <root>/wasm-core/ (outside Vite's
    // publicDir) so we can import dotnet.js directly from source code.
    {
      name: 'wasm-core',
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
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**']
    }
  }
}))
