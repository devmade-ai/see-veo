import { useRegisterSW } from 'virtual:pwa-register/react'
import { useEffect, useRef, useCallback } from 'react'

// Requirement: Periodically check for service worker updates
// Approach: useEffect with cleanup to avoid setInterval memory leak on remount
// Alternatives considered:
//   - Raw setInterval in onRegisteredSW callback: Rejected — no cleanup, leaks on remount

import { debugLog } from '../utils/debugLog'

export function usePWAUpdate() {
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, r) {
      if (r) {
        registrationRef.current = r
        debugLog('PWA', 'info', 'sw-registered', {
          state: r.active ? 'active' : r.waiting ? 'waiting' : 'installing',
        })
      }
    },
  })

  // Log when a new update becomes available
  useEffect(() => {
    if (needRefresh) {
      debugLog('PWA', 'info', 'update-available', {
        detail: 'New service worker version waiting — user will see update banner',
      })
    }
  }, [needRefresh])

  useEffect(() => {
    const registration = registrationRef.current
    if (!registration) return

    const interval = setInterval(() => { void registration.update() }, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [needRefresh])

  const update = useCallback(() => {
    debugLog('PWA', 'info', 'update-applied', { detail: 'User triggered service worker update' })
    updateServiceWorker(true)
  }, [updateServiceWorker])

  return {
    hasUpdate: needRefresh,
    update,
  }
}
