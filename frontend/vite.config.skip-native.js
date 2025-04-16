// vite.config.skip-native.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Force disable all native module dependencies 
process.env.ROLLUP_NATIVE_MODULES = 'false';
process.env.ROLLUP_SKIP_NODEJS_NATIVE = 'true';

// Define patterns for native modules to exclude
const nativeModulePatterns = [
  '@rollup/rollup-linux-x64-gnu',
  '@rollup/rollup-linux-x64-musl',
  '@rollup/rollup-darwin-x64',
  '@rollup/rollup-windows-x64-msvc',
  '@esbuild/linux-x64',
  '@esbuild/darwin-x64',
  '@esbuild/win32-x64',
  // Add any other problematic native modules here
];

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
    // Skip native modules in rollup
    rollupOptions: {
      external: nativeModulePatterns,
      onwarn(warning, warn) {
        // Suppress warnings about missing optional dependencies
        if (warning.code === 'MISSING_OPTIONAL_DEPENDENCY') return;
        // Show other warnings
        warn(warning);
      }
    },
  },
  optimizeDeps: {
    // Skip these modules in the optimization phase
    disabled: false,
    exclude: nativeModulePatterns,
  },
}); 