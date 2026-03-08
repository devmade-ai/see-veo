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

export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(isStandalone)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  // No external consumer mutates this value, so a plain computed value suffices.
  // Previously this was useState with an exported setter, but nothing called it.
  const showManualInstructions = useMemo(
    () => !supportsAutoInstall && !isStandalone(),
    [isInstalled], // eslint-disable-line react-hooks/exhaustive-deps -- recalculate when install state changes
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

    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt)
      window.removeEventListener('appinstalled', handleInstalled)
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
