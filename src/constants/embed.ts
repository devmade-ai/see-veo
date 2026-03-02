// Requirement: Centralize repo-tor embed configuration used by multiple components
// Approach: Single source of truth for base URL, chart colors, and script URL.
//   Previously duplicated across ActivityCharts, ActivityTimeline, and useRepoTorEmbed.
// Alternatives considered:
//   - Keep constants in each component: Rejected — duplication causes drift (e.g. URL
//     was not updated in embed components when repo-tor moved from GitHub Pages to Vercel)
//   - Put in cv-data.ts: Rejected — embed config is infrastructure, not CV content

/** Base URL for the repo-tor embed dashboard (Vercel deployment) */
export const EMBED_BASE = 'https://repo-tor.vercel.app/'

/** URL of the repo-tor embed helper script for iframe auto-resize */
export const EMBED_SCRIPT_URL = `${EMBED_BASE}embed.js`

/** Primary theme color (--color-primary: #38bdf8) for work-hours / weekday bars */
export const CHART_ACCENT = '38bdf8'

/** Secondary theme color (--color-secondary: #818cf8) for after-hours / weekend bars */
export const CHART_MUTED = '818cf8'

/** 15-color series for multi-dataset charts (activity-timeline stacked bars).
 *  Starts with @theme tokens (primary, secondary, accent), then visually distinct
 *  hues chosen for readability on dark backgrounds. */
export const CHART_COLORS = [
  '38bdf8', // primary — sky blue
  '818cf8', // secondary — indigo
  '34d399', // accent — emerald
  'f472b6', // pink
  'fbbf24', // amber
  '22d3ee', // cyan
  'fb923c', // orange
  'a78bfa', // violet
  '4ade80', // green
  'f87171', // red
  '2dd4bf', // teal
  'e879f9', // fuchsia
  '60a5fa', // blue
  'facc15', // yellow
  'c084fc', // purple
].join(',')
