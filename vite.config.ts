import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'lattae-icon-192.png', 'lattae-icon-512.png', 'lattae-icon-1024.png'],
      manifest: {
        name: 'Lattae',
        short_name: 'Lattae',
        description: 'Your portfolio, explained.',
        theme_color: '#F7EBDA',
        background_color: '#F7EBDA',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        id: '/',
        lang: 'ko',
        icons: [
          {
            src: '/lattae-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/lattae-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/lattae-icon-1024.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'any',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
        globIgnores: [
          '**/roast-loader-transparent.png',
          '**/roast-loader-transparent-ondark.png',
          '**/roast-loader-transparent-notext.png',
          '**/roast-loader-transparent-ondark-notext.png',
        ],
        navigateFallback: 'index.html',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
