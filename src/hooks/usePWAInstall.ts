import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { detectBrowser, isStandalone } from '../utils/pwa'

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
const supportsAutoInstall = ['chrome', 'edge', 'brave'].includes(browser)

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
    return {
      browser: browser.charAt(0).toUpperCase() + browser.slice(1),
      steps: [
        'Click the install icon in the address bar',
        'Or use the browser menu \u2192 "Install app..."',
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
