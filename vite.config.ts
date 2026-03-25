import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Requirement: Migrate deployment from GitHub Pages to Vercel
// Approach: Remove base path prefix — Vercel serves at root '/' unlike GitHub Pages
//   which required '/see-veo/' prefix. Also updated PWA scope/start_url and removed
//   domain-specific navigateFallbackDenylist (Workbox defaults to same-origin only)
// Alternatives considered:
//   - Keep base as '/' explicitly: Rejected — Vite defaults to '/', omitting is cleaner
//   - Keep navigateFallbackDenylist with Vercel domain: Rejected — fragile if domain
//     changes; Workbox already limits navigateFallback to same-origin by default
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Jaco Theron - Solutions Engineer',
        short_name: 'JT Resume',
        description: 'Personal CV and resume of Jaco Theron, Solutions / Software / Sales Engineer & Analyst',
        theme_color: '#0a0a0a',
        background_color: '#0a0a0a',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Requirement: Prevent service worker from intercepting cross-origin API requests
        // Approach: navigateFallbackDenylist excludes API-domain URLs from navigation
        //   fallback; runtimeCaching NetworkOnly ensures API fetches bypass SW entirely
        // Alternatives considered:
        //   - navigateFallbackDenylist alone: Rejected — only controls navigation fallback,
        //     not fetch interception. On some mobile Chrome versions the SW fetch handler
        //     still intercepts cross-origin requests and can break CORS preflight
        //   - Custom SW with explicit passthrough: Rejected — adds complexity, generateSW
        //     mode doesn't support custom fetch handlers
        navigateFallbackDenylist: [/^https?:\/\/.*\.vercel\.app\/api\//],
        runtimeCaching: [
          {
            // Requirement: API requests must never be handled by the service worker
            // Approach: NetworkOnly ensures Workbox immediately delegates to the network,
            //   preventing interference with CORS preflight on mobile Chrome
            // Alternatives considered:
            //   - NetworkFirst: Rejected — API requests should never be cached or served stale
            //   - Omitting (let requests fall through): Rejected — on mobile Chrome the SW
            //     fetch event listener can still interfere with CORS preflight even when no
            //     route matches, causing "Failed to fetch" TypeErrors
            urlPattern: /^https:\/\/.*\.vercel\.app\/api\/.*/i,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
