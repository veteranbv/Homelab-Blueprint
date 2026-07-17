import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  root: 'site',
  base: command === 'build' && process.env.GITHUB_ACTIONS ? '/Homelab-Blueprint/' : '/',
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
  },
}))
