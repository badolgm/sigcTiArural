import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Raíz del repositorio (dos niveles arriba de src/frontend), necesaria para que
// el Knowledge Hub (FASE 8D) pueda leer README.md y docs/*.md localmente vía
// import.meta.glob sin depender de raw.githubusercontent.com.
const repoRoot = path.resolve(__dirname, '../..')

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_BACKEND_PROXY_TARGET?.trim() || 'http://localhost:8010'

  return {
    plugins: [react()],
    server: {
      host: true, // Permite acceso desde la red (útil para móviles)
      port: 5173, // Puerto por defecto
      fs: {
        allow: [__dirname, repoRoot],
      },
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
