import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split heavy vendor libs for better caching on Cloudflare edge
          'react-vendor': ['react', 'react-dom'],
          'motion-vendor': ['framer-motion'],
          'icons-vendor': ['lucide-react'],
          // Data will be its own chunk (loaded on demand)
          'broker-data': ['./src/data/brokers.js'],
        },
      },
    },
    // Cloudflare Pages works great with these defaults
    chunkSizeWarningLimit: 600,
  },
  server: {
    port: 5173,
  },
})
