import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  root: 'src/renderer',
  plugins: [react()],
  base: './',
  build: {
    // Must output to project root dist/ so electron-builder "files": ["dist/**/*"] includes it
    outDir: '../../dist',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/renderer/src'),
      '@main': resolve(__dirname, './src/main'),
      '@shared': resolve(__dirname, './src/shared'),
    },
  },
  server: {
    port: 5173,
  },
})
