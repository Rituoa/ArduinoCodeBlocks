import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    proxy: {
      '/wokwi-api': {
        target: 'https://hexi.wokwi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/wokwi-api/, '')
      }
    }
  }
})