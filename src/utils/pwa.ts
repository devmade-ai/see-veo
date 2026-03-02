// Requirement: Shared PWA utility functions used by usePWAInstall and DebugBanner
// Approach: Extract duplicated detectBrowser and isStandalone into a single module
// Alternatives considered:
//   - Keep in usePWAInstall hook: Rejected — DebugBanner duplicated isStandalone,
//     and tests duplicated detectBrowser, causing drift risk

/** Detect the current browser from the user agent string */
export function detectBrowser(ua = navigator.userAgent) {
  if (ua.includes('Brave')) return 'brave'
  if (ua.includes('Edg/')) return 'edge'
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
