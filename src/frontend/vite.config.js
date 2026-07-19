import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_BACKEND_PROXY_TARGET?.trim() || 'http://localhost:8010'

  return {
    plugins: [react()],
    server: {
      host: true, // Permite acceso desde la red (útil para móviles)
      port: 5173, // Puerto por defecto
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
