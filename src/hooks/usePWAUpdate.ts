import { useRegisterSW } from 'virtual:pwa-register/react'

export function usePWAUpdate() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, r) {
      if (r) {
        setInterval(() => { void r.update() }, 60 * 60 * 1000)
      }
    },
  })

  return {
    hasUpdate: needRefresh,
    update: () => updateServiceWorker(true),
  }
}
