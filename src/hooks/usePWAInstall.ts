import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { detectBrowser, isStandalone, CHROMIUM_BROWSERS, BROWSER_DISPLAY_NAMES } from '../utils/pwa'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallInstructions {
  browser: string
  steps: string[]
  note?: string
}

// Browser detection is derived from navigator.userAgent which never changes
// within a page session. Computed once at module level to avoid re-running
// on every render and to keep the useEffect dependency array honest (empty).
const browser = detectBrowser()
// All Chromium-based browsers support the beforeinstallprompt event.
// Browsers not in this list (Safari, Firefox) require manual install instructions.
const supportsAutoInstall = CHROMIUM_BROWSERS.includes(browser)

// Requirement: Show manual install instructions on Chromium browsers (e.g. Brave)
//   that block the beforeinstallprompt event due to privacy shields
// Approach: After a short timeout, if beforeinstallprompt hasn't fired on a Chromium
//   browser, flip a flag so manual instructions become available as a fallback
// Alternatives considered:
//   - Detect Brave specifically and always show manual: Rejected — other Chromium
//     browsers with strict privacy settings could have the same issue
//   - Longer timeout (10s+): Rejected — user may scroll past the hero section
//   - No timeout, just always show manual for Chromium: Rejected — native prompt
//     is a better UX when available; manual should only be the fallback
const PROMPT_TIMEOUT_MS = 3000

export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(isStandalone)
  const [promptTimedOut, setPromptTimedOut] = useState(false)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  // Show manual instructions when:
  //   1. Browser doesn't support beforeinstallprompt at all (Safari, Firefox), OR
  //   2. Browser supports it but the prompt hasn't fired after a timeout (e.g. Brave
  //      shields blocking the event) AND the native prompt isn't already available
  // In both cases, only show when not already installed as a standalone PWA.
  const showManualInstructions = useMemo(
    () => (!supportsAutoInstall || (promptTimedOut && !canInstall)) && !isStandalone(),
    [isInstalled, promptTimedOut, canInstall], // eslint-disable-line react-hooks/exhaustive-deps -- recalculate when install/prompt state changes
  )

  useEffect(() => {
    const handlePrompt = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      setCanInstall(true)
    }

    const handleInstalled = () => {
      setIsInstalled(true)
      setCanInstall(false)
      deferredPrompt.current = null
    }

    // Requirement: Recover beforeinstallprompt events that fired before React mounted
    // Approach: index.html captures the event on window.__pwaInstallPrompt via an inline
    //   script that runs synchronously before the deferred module bundle. The hook checks
    //   for this early-captured event on mount and consumes it.
    // Alternatives considered:
    //   - Move listener into main.tsx before createRoot: Rejected — module scripts are
    //     deferred, so the event can still fire before the module executes
    //   - Poll for the event with setInterval: Rejected — fragile and wasteful
    const win = window as unknown as { __pwaInstallPrompt?: BeforeInstallPromptEvent }
    if (win.__pwaInstallPrompt) {
      deferredPrompt.current = win.__pwaInstallPrompt
      setCanInstall(true)
      delete win.__pwaInstallPrompt
    }

    window.addEventListener('beforeinstallprompt', handlePrompt)
    window.addEventListener('appinstalled', handleInstalled)

    // Requirement: Fallback for Chromium browsers that block beforeinstallprompt
    // (e.g. Brave with shields enabled — see debug report 2026-03-08)
    // Approach: Start a timeout on mount. If beforeinstallprompt hasn't fired by
    //   then and the browser is Chromium, flag it so manual instructions appear.
    //   The timeout is cleared if the prompt fires or the app is already installed.
    let promptTimer: ReturnType<typeof setTimeout> | undefined
    if (supportsAutoInstall && !isStandalone()) {
      promptTimer = setTimeout(() => {
        if (!deferredPrompt.current) {
          setPromptTimedOut(true)
        }
      }, PROMPT_TIMEOUT_MS)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt)
      window.removeEventListener('appinstalled', handleInstalled)
      if (promptTimer) clearTimeout(promptTimer)
    }
  }, [])

  const install = useCallback(async () => {
    if (!deferredPrompt.current) return false
    void deferredPrompt.current.prompt()
    const { outcome } = await deferredPrompt.current.userChoice
    deferredPrompt.current = null
    setCanInstall(false)
    return outcome === 'accepted'
  }, [])

  const getInstallInstructions = useCallback((): InstallInstructions => {
    const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)
    const isMac = /Mac/i.test(navigator.userAgent)

    if (browser === 'safari' && isMobile) {
      return {
        browser: 'Safari (iOS)',
        steps: [
          'Tap the Share button (square with arrow)',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to confirm',
        ],
      }
    }
    if (browser === 'safari' && isMac) {
      return {
        browser: 'Safari (macOS)',
        steps: ['Go to File menu \u2192 "Add to Dock..."', 'Click "Add" to confirm'],
      }
    }
    if (browser === 'firefox' && isMobile) {
      return {
        browser: 'Firefox Mobile',
        steps: ['Tap the menu (three dots)', 'Tap "Add to Home screen"', 'Confirm'],
      }
    }
    if (browser === 'firefox') {
      return {
        browser: 'Firefox Desktop',
        steps: [],
        note: 'Firefox removed PWA support in 2021. Use Chrome, Edge, or Brave instead.',
      }
    }
    // Requirement: Samsung Internet uses a download icon instead of a generic install icon
    // Approach: Dedicated instructions referencing Samsung's specific UI elements
    // Alternatives considered:
    //   - Use generic Chromium instructions: Rejected — Samsung Internet's install UI
    //     differs (download icon, not install icon) and users may not find it
    if (browser === 'samsung') {
      return {
        browser: 'Samsung Internet',
        steps: [
          'Tap the download icon in the address bar',
          'Or tap the menu (three lines) → "Add page to" → "Home screen"',
        ],
      }
    }
    return {
      browser: BROWSER_DISPLAY_NAMES[browser] ?? browser.charAt(0).toUpperCase() + browser.slice(1),
      steps: [
        'Click the install icon in the address bar',
        'Or use the browser menu → "Install app..."',
      ],
    }
  }, [])

  return {
    canInstall,
    install,
    isInstalled,
    showManualInstructions,
    getInstallInstructions,
  }
}
