// vite.config.skip-native.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Prevent rollup from attempting to use native modules which fail in Docker
process.env.ROLLUP_NATIVE_MODULES = 'false';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    watch: {
      usePolling: true,
    },
  },
  build: {
    rollupOptions: {
      external: [
        '@rollup/rollup-linux-x64-gnu',
        '@rollup/rollup-linux-x64-musl',
        '@rollup/rollup-darwin-x64',
        '@rollup/rollup-windows-x64-msvc',
        '@esbuild/linux-x64',
        '@esbuild/darwin-x64',
        '@esbuild/win32-x64',
      ]
    },
  },
  optimizeDeps: {
    disabled: false,
    exclude: [
      '@rollup/rollup-linux-x64-gnu',
      '@rollup/rollup-linux-x64-musl',
      '@rollup/rollup-darwin-x64',
      '@rollup/rollup-windows-x64-msvc',
      '@esbuild/linux-x64',
      '@esbuild/darwin-x64',
      '@esbuild/win32-x64',
    ],
  },
}); 