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

  // Requirement: Poll for SW updates every hour regardless of current update state
  // Approach: Empty dependency array — start polling once on mount, clean up on unmount.
  //   registrationRef.current may be null on first render (set in onRegisteredSW callback),
  //   so the interval reads the ref dynamically instead of capturing a stale value.
  // Alternatives considered:
  //   - Depend on [needRefresh]: Rejected — recreates interval on every state change,
  //     and polling should continue even after an update is applied
  useEffect(() => {
    const interval = setInterval(() => {
      if (registrationRef.current) void registrationRef.current.update()
    }, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const update = useCallback(() => {
    debugLog('PWA', 'info', 'update-applied', { detail: 'User triggered service worker update' })
    updateServiceWorker(true)
  }, [updateServiceWorker])

  return {
    hasUpdate: needRefresh,
    update,
  }
}
