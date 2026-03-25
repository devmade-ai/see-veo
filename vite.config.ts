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
        theme_color: THEME_BACKGROUND,
        background_color: THEME_BACKGROUND,
        display: 'standalone',
        scope: '/',
        start_url: '/',
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
            // Requirement: Separate icon purposes — never combine 'any maskable'
            // Approach: Dedicated entry with purpose 'maskable' using 512x512 until
            //   a 1024x1024 maskable icon is generated (see TODO.md)
            // Alternatives considered:
            //   - Combined 'any maskable': Rejected — browsers pick the wrong variant
            //     (CLAUDE.md PWA guidance explicitly warns against this)
            src: 'pwa-512x512.png',
            sizes: '512x512',
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
