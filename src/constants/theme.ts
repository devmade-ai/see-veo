// Requirement: Single source of truth for theme colors used outside CSS
// Approach: Shared constants imported by vite.config.ts (PWA manifest) and injected
//   into index.html meta tags at build time via transformIndexHtml. Eliminates color
//   drift between index.css @theme tokens, PWA manifest, and HTML meta tags.
// Alternatives considered:
//   - Keep hardcoded hex values in each file: Rejected — colors drifted 3 times already
//     (navy/sky-blue theme remnants in index.html and vite.config.ts)
//   - Read/parse index.css at build time: Rejected — fragile regex parsing of CSS;
//     a constants file is simpler and type-safe
//   - PostCSS plugin to extract @theme values: Rejected — over-engineered for 3 values

/**
 * Background color for the site (matches @theme --color-background in index.css).
 * Used in: PWA manifest background_color/theme_color, HTML theme-color meta tag.
 */
export const THEME_BACKGROUND = '#0a0a0a'

/**
 * Primary text/UI color (matches @theme --color-primary in index.css).
 * Used in: HTML mask-icon color.
 */
export const THEME_PRIMARY = '#d4d4d4'
