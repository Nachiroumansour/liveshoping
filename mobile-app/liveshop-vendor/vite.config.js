import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      registerType: 'prompt',
      includeAssets: ['favicon.jpg', 'apple-touch-icon.png'],
      manifest: {
        name: 'LiveShop Link - Espace Vendeur',
        short_name: 'LiveShop Vendor',
        description: 'L\'app qui vend pour vous pendant que vous animez vos lives',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#8B5CF6',
        scope: '/',
        lang: 'fr',
        categories: ['business', 'shopping', 'productivity'],
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        screenshots: [
          {
            src: '/screenshot-mobile.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow'
          }
        ]
      },
      injectManifest: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        globIgnores: ['**/images/onboarding/**'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(new URL('.', import.meta.url).pathname, "./src"),
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_URL || 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  build: {
    rollupOptions: {
      external: ['crypto'],
    },
  }
})
