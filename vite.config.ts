import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Automatically detect GitHub Actions environment
  base: process.env.CI && process.env.GITHUB_ACTIONS ? '/bitmap-to-c-array/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
