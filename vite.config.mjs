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
  },
})

