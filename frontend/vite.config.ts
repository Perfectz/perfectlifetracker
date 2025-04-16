// frontend/vite.config.ts - Fixed config
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-dom/client',
      'date-fns',
      '@mui/x-date-pickers',
      '@date-io/date-fns'
    ],
    force: true,
  },
}) 