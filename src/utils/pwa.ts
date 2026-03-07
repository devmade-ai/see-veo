// Requirement: Shared PWA utility functions used by usePWAInstall and DebugBanner
// Approach: Extract duplicated detectBrowser and isStandalone into a single module
// Alternatives considered:
//   - Keep in usePWAInstall hook: Rejected — DebugBanner duplicated isStandalone,
//     and tests duplicated detectBrowser, causing drift risk

// Requirement: Detect Brave on mobile where UA string lacks "Brave" identifier
// Approach: Check navigator.brave API first (Brave exposes this on all platforms),
//   then fall back to UA string matching for older versions or test environments
// Alternatives considered:
//   - UA string only: Rejected — Brave Mobile strips "Brave" from the UA,
//     causing misdetection as Chrome (see debug report 2026-03-07)
//   - Async isBrave() call: Rejected — detectBrowser is used synchronously at
//     module level; the mere existence of navigator.brave is sufficient
// Requirement: Identify browsers that spoof as Chrome but have distinct PWA behavior
// Approach: Check browser-specific UA tokens before the generic "Chrome" check.
//   Order matters — all Chromium-based browsers include "Chrome" in their UA, so
//   specific tokens (OPR/, SamsungBrowser/, Vivaldi/, Arc/) must be matched first.
// Alternatives considered:
//   - Only detect Chrome/Edge/Brave: Rejected — Opera, Samsung Internet, Vivaldi,
//     and Arc all fall through to "chrome", losing diagnostic accuracy and
//     potentially giving wrong install instructions (Samsung has a different flow)
/** Detect the current browser from the user agent string and navigator APIs */
export function detectBrowser(ua = navigator.userAgent) {
  if ((typeof navigator !== 'undefined' && 'brave' in navigator) || ua.includes('Brave')) return 'brave'
  if (ua.includes('Edg/')) return 'edge'
  if (ua.includes('OPR/') || ua.includes('Opera')) return 'opera'
  if (ua.includes('SamsungBrowser/')) return 'samsung'
  if (ua.includes('Vivaldi/')) return 'vivaldi'
  if (ua.includes('Arc/')) return 'arc'
  if (ua.includes('Chrome')) return 'chrome'
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'safari'
  if (ua.includes('Firefox')) return 'firefox'
  return 'unknown'
}

/** Check if the app is running in standalone (installed PWA) mode */
export function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}
