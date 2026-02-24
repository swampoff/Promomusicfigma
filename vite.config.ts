import { defineConfig, Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Resolves any figma:asset/... import to a transparent 1×1 PNG placeholder.
// This prevents build failures when Figma-Make asset references are left in source.
function figmaAssetsPlugin(): Plugin {
  const PLACEHOLDER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  return {
    name: 'figma-assets',
    resolveId(id) {
      if (id.startsWith('figma:')) return '\0figma-asset:' + id
    },
    load(id) {
      if (id.startsWith('\0figma-asset:')) return `export default "${PLACEHOLDER}"`
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [
    figmaAssetsPlugin(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom', 'motion'],
  },
  build: {
    modulePreload: {
      polyfill: true,
    },
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  optimizeDeps: {
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
