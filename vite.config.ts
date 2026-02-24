import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom', 'motion'],
  },
  build: {
    // Ensure proper module resolution
    modulePreload: {
      polyfill: true,
    },
    rollupOptions: {
      output: {
        // Manual chunking for better code splitting
        manualChunks: undefined,
      },
    },
  },
  optimizeDeps: {
    // Force re-optimization on changes
    force: true,
    include: [
      'motion/react',
      'embla-carousel-react',
      'react',
      'react-dom',
      'lucide-react',
      'sonner',
    ],
  },
})