import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'
import { brand } from './src/config/brand.js'

// https://vite.dev/config/
export default defineConfig({
  // The preview tool hands out a free port through PORT; otherwise Vite's usual default applies.
  server: process.env.PORT ? { port: Number(process.env.PORT) } : undefined,
  resolve: {
    // Edge Functions import with Deno-style npm: specifiers; let the tests resolve them from node_modules.
    alias: [
      { find: /^npm:zod@[\d.]+$/, replacement: 'zod' },
      { find: /^npm:@supabase\/supabase-js@\d+$/, replacement: '@supabase/supabase-js' },
    ],
  },
  plugins: [
    {
      name: 'brand-html',
      transformIndexHtml(html) {
        return html
          .replaceAll('%APP_NAME%', brand.name)
          .replaceAll('%APP_SHORT_NAME%', brand.shortName)
          .replaceAll('%APP_DESCRIPTION%', brand.description)
      },
    },
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: brand.name,
        short_name: brand.shortName,
        description: brand.description,
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#070b14',
        theme_color: '#070b14',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell is precached; Supabase API calls are never cached by the service worker.
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts', 'supabase/functions/**/*.test.ts'],
  },
})
