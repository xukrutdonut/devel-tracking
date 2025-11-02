import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0', // Permitir acceso desde la red
    allowedHosts: [
      'devel-tracking.neuropedialab.org',
      'localhost',
      '.neuropedialab.org', // Permite todos los subdominios
    ],
    proxy: {
      '/api': {
        // Usar el servicio backend de Docker Compose
        target: 'http://neurodesarrollo-backend:8001',
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('→ Proxy:', req.method, req.url);
          });
        }
      }
    }
  },
})

