import { useRegisterSW } from 'virtual:pwa-register/react'
import { useEffect, useRef } from 'react'

// Requirement: Periodically check for service worker updates
// Approach: useEffect with cleanup to avoid setInterval memory leak on remount
// Alternatives considered:
//   - Raw setInterval in onRegisteredSW callback: Rejected — no cleanup, leaks on remount

export function usePWAUpdate() {
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, r) {
      if (r) {
        registrationRef.current = r
      }
    },
  })

  useEffect(() => {
    const registration = registrationRef.current
    if (!registration) return

    const interval = setInterval(() => { void registration.update() }, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [needRefresh])

  return {
    hasUpdate: needRefresh,
    update: () => updateServiceWorker(true),
  }
}
