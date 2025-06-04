// frontend/vite.config.ts - Fixed config
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Bundle analyzer
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    // Bundle analyzer - only in analyze mode
    mode === 'analyze' && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
    hmr: {
      overlay: true,
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    rollupOptions: {
      input: {
        main: './index.html',
      },
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          'router-vendor': ['react-router-dom'],
          
          // App chunks
          'auth': [
            './src/services/authService.ts',
            './src/services/AuthContext.tsx',
            './src/components/LoginModal.tsx',
            './src/components/RegisterModal.tsx'
          ],
          'dashboard': [
            './src/pages/DashboardPage.tsx',
            './src/components/Dashboard'
          ],
          'fitness': [
            './src/screens/FitnessScreen.tsx',
            './src/pages/WeightTrackerPage.tsx',
            './src/pages/MealTrackerPage.tsx'
          ]
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '') 
            : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        }
      }
    },
    // Optimize for production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
      'react-router-dom'
    ],
    exclude: [
      // Exclude React Native dependencies from web build
      'react-native',
      'react-native-paper',
      'react-native-safe-area-context',
      '@react-navigation/native',
      '@react-navigation/bottom-tabs',
      '@react-navigation/stack',
      'expo-status-bar'
    ]
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
})) 