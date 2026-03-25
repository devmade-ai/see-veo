import { readFileSync } from 'fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import type { Plugin } from 'vite'

// Requirement: Theme colors in index.html and PWA manifest must stay in sync with CSS
// Approach: Parse src/index.css @theme tokens at build time. CSS is the single source of
//   truth — no separate constants file, no manual sync. The themeColorInjector plugin
//   replaces %THEME_*% placeholders in index.html with the parsed values.
// Alternatives considered:
//   - Separate constants file imported by both CSS and config: Rejected — CSS @theme
//     can't import from TypeScript; would still need manual sync
//   - Hardcode colors in each file: Rejected — values drifted multiple times already
const css = readFileSync('src/index.css', 'utf-8')
const THEME_BACKGROUND = css.match(/--color-background:\s*(#[0-9a-fA-F]+)/)?.[1] ?? '#0a0a0a'
const THEME_PRIMARY = css.match(/--color-primary:\s*(#[0-9a-fA-F]+)/)?.[1] ?? '#d4d4d4'

function themeColorInjector(): Plugin {
  return {
    name: 'theme-color-injector',
    transformIndexHtml(html) {
      return html
        .replace(/%THEME_BACKGROUND%/g, THEME_BACKGROUND)
        .replace(/%THEME_PRIMARY%/g, THEME_PRIMARY)
    },
  }
}

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
    themeColorInjector(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Jaco Theron - Solutions Engineer',
        short_name: 'JT Resume',
        description: 'Personal CV and resume of Jaco Theron, Solutions / Software / Sales Engineer & Analyst',
        // Requirement: Stable PWA identity and reliable install prompt on Chromium browsers
        // Approach: Explicit id prevents Chrome from deriving it from start_url (which breaks
        //   on config changes); prefer_related_applications: false ensures Chrome doesn't skip
        //   beforeinstallprompt thinking a native app exists
        // Alternatives considered:
        //   - Omit id (let Chrome derive from start_url): Rejected — identity breaks on
        //     config changes or redeployments, causing duplicate installs
        //   - Omit prefer_related_applications: Rejected — Chrome may suppress install prompt
        id: '/',
        theme_color: THEME_BACKGROUND,
        background_color: THEME_BACKGROUND,
        display: 'standalone',
        scope: '/',
        start_url: '/',
        prefer_related_applications: false,
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-1024x1024.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'maskable',
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
