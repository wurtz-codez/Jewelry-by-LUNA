import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { splitVendorChunkPlugin } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin()
  ],
  build: {
    // Generate sourcemaps for production builds
    sourcemap: false,
    
    // Configure chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', '@headlessui/react', '@heroicons/react', 'lucide-react'],
          'chart-vendor': ['chart.js', 'react-chartjs-2', 'recharts'],
        }
      }
    },
    
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
    
    // Minify output
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})