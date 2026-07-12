import { readFileSync } from 'fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import type { Plugin } from 'vite'

// Requirement: Browser theme-color + PWA manifest colors must stay in sync with the CSS
// Approach: Parse src/index.css @theme tokens at build time. CSS is the single source of
//   truth. The "The Applicant" design is ink-on-paper, so the browser UI/theme-color is
//   the INK token (--color-primary) while the manifest splash background is the PAPER
//   page (--color-background). The injector replaces %THEME_COLOR% in index.html.
// Alternatives considered:
//   - Separate constants file imported by both CSS and config: Rejected — CSS @theme
//     can't import from TypeScript; would still need manual sync
//   - Hardcode colors in each file: Rejected — values drifted multiple times before
const css = readFileSync('src/index.css', 'utf-8')
const THEME_INK = css.match(/--color-primary:\s*(#[0-9a-fA-F]+)/)?.[1] ?? '#2b2118'
const THEME_PAPER = css.match(/--color-background:\s*(#[0-9a-fA-F]+)/)?.[1] ?? '#f4ecd8'

function themeColorInjector(): Plugin {
  return {
    name: 'theme-color-injector',
    transformIndexHtml(html) {
      return html.replace(/%THEME_COLOR%/g, THEME_INK)
    },
  }
}

// Requirement: Deploy on Vercel at root '/'
// Approach: No base-path prefix (Vercel serves at root); PWA scope/start_url = '/'.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    themeColorInjector(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: [
        'icons/favicon.svg',
        'icons/favicon-16.png',
        'icons/favicon-32.png',
        'icons/apple-touch-icon.png',
      ],
      manifest: {
        name: 'Jaco Theron — Living CV',
        short_name: 'JT · CV',
        description:
          "Jaco Theron's CV as a playable, ink-on-paper pixel-runner document.",
        // Requirement: Stable PWA identity and reliable install prompt on Chromium browsers
        // Approach: Explicit id prevents Chrome from deriving it from start_url (which breaks
        //   on config changes); prefer_related_applications: false ensures Chrome doesn't skip
        //   beforeinstallprompt thinking a native app exists
        id: '/',
        theme_color: THEME_INK,
        background_color: THEME_PAPER,
        display: 'standalone',
        // The design is a phone-first, vertical document — advisory on mobile, ignored on desktop.
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        prefer_related_applications: false,
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'icons/icon-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Requirement: Prevent the service worker from intercepting cross-origin API requests
        // Approach: navigateFallbackDenylist excludes the interest-form API domain from
        //   navigation fallback; runtimeCaching NetworkOnly ensures those fetches bypass the SW
        //   (avoids CORS-preflight interference seen on mobile Chrome)
        navigateFallbackDenylist: [/^https?:\/\/.*\.vercel\.app\/api\//],
        runtimeCaching: [
          {
            // Interest-form API requests must never be handled/cached by the service worker.
            urlPattern: /^https:\/\/.*\.vercel\.app\/api\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
})
