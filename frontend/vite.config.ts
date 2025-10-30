import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Listen on all interfaces (needed for Tailscale, Docker, etc)
    port: parseInt(process.env.PORT || '3000'),
    proxy: {
      '/api': {
        target: 'http://localhost:4001',  // Correct backend port
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
