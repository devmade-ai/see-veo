import { useState, useEffect, useCallback, useRef } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallInstructions {
  browser: string
  steps: string[]
  note?: string
}

function detectBrowser() {
  const ua = navigator.userAgent
  if (ua.includes('Brave')) return 'brave'
  if (ua.includes('Edg/')) return 'edge'
  if (ua.includes('Chrome')) return 'chrome'
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'safari'
  if (ua.includes('Firefox')) return 'firefox'
  return 'unknown'
}

function isStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  )
}

export function usePWAInstall() {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(isStandalone)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)
  const browser = detectBrowser()
  const supportsAutoInstall = ['chrome', 'edge', 'brave'].includes(browser)

  // Compute initial manual instructions state from browser detection rather than
  // calling setState inside useEffect (which triggers cascading renders)
  const [showManualInstructions, setShowManualInstructions] = useState(
    () => !supportsAutoInstall && !isStandalone()
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
  }, [supportsAutoInstall])

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
  }, [browser])

  return {
    canInstall,
    install,
    browser,
    isInstalled,
    showManualInstructions,
    setShowManualInstructions,
    supportsAutoInstall,
    getInstallInstructions,
  }
}
