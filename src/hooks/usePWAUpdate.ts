import { useRegisterSW } from 'virtual:pwa-register/react'
import { useEffect, useState, useCallback } from 'react'
import { debugLog } from '../utils/debugLog'

// Requirement: Fleet-standard "auto-on-launch" PWA update policy (glow-props
//   docs/implementations/PWA_SYSTEM.md → "Update Application Policy"): a worker already
//   waiting when the app STARTS is applied immediately (skip-waiting → one reload, silent)
//   unless the user turned "Automatic updates" off or an update was applied < 30s ago; an
//   update found MID-session only arms the UpdatePrompt banner and otherwise applies on
//   the next launch. registerType stays 'prompt' — it is the mechanism that exposes the
//   waiting worker; this hook is the policy layered on top.
// Approach: Module-level singleton state (registration, armed flag, reload latch) with a
//   pub/sub listener set — the SW callbacks fire on their own schedule outside React, and
//   module scope survives StrictMode double-mounting so launch-apply can never run twice.
//   Launch-apply posts { type: 'SKIP_WAITING' } directly to registration.waiting (the same
//   message workbox-window's messageSkipWaiting sends; the generated Workbox SW handles
//   it). The reload arrives via vite-plugin-pwa's own 'controlling' listener, with a
//   latch-gated controllerchange listener here as the belt-and-braces backstop.
// Alternatives considered:
//   - updateServiceWorker(true) inside onRegisteredSW: Rejected — the callback can run
//     before the hook's return value is assigned (it does in the test mock, which invokes
//     it synchronously); postMessage needs only the callback argument, so it is
//     order-independent. Both send the identical SKIP_WAITING message.
//   - registerType 'autoUpdate': Rejected by the policy — silently reloads mid-read.
//   - Tap-only prompt (previous behavior): Rejected by the policy — users who never tap
//     run stale precached code indefinitely.

export type UpdateCheckResult = 'no-sw' | 'up-to-date' | 'update-available' | 'error'

// Storage keys follow the repo's `jt-cv-` prefix (matches the game's `jt-cv-hi` key).
const AUTO_UPDATE_KEY = 'jt-cv-auto-update'
const UPDATE_APPLIED_KEY = 'jt-cv-pwa-updated'
// Suppression window after applying an update — the SW lifecycle hasn't fully settled
// right after the reload and would falsely re-arm the banner (or re-trigger launch-apply).
const JUST_UPDATED_WINDOW_MS = 30_000
// Settle delay after registration.update() so the async install → waiting lifecycle can
// fire before checkForUpdate reads the armed flag (fleet-standard ~1500ms).
const CHECK_SETTLE_MS = 1500
const POLL_INTERVAL_MS = 60 * 60 * 1000

// Module-level singleton state — survives remounts; synced to React via _listeners.
let _registration: ServiceWorkerRegistration | null = null
let _hasUpdate = false
let _reloadPending = false
let _launchHandled = false
const _listeners = new Set<() => void>()

function notifyListeners(): void {
  for (const fn of _listeners) fn()
}

/** Persisted "Automatic updates" preference — default ON when absent or unreadable. */
export function isAutoUpdateEnabled(): boolean {
  try {
    return localStorage.getItem(AUTO_UPDATE_KEY) !== 'false'
  } catch {
    return true
  }
}

function persistAutoUpdate(on: boolean): void {
  try {
    localStorage.setItem(AUTO_UPDATE_KEY, String(on))
  } catch {
    /* private mode / storage disabled — the preference just won't persist */
  }
}

function wasJustUpdated(): boolean {
  try {
    const ts = sessionStorage.getItem(UPDATE_APPLIED_KEY)
    return ts !== null && Date.now() - Number(ts) < JUST_UPDATED_WINDOW_MS
  } catch {
    return false
  }
}

function markUpdateApplied(): void {
  try {
    sessionStorage.setItem(UPDATE_APPLIED_KEY, String(Date.now()))
  } catch {
    /* private mode / storage disabled — worst case is one redundant banner after reload */
  }
}

/** Test-only: clear the module singleton between vitest cases. */
export function _resetPwaUpdateStateForTesting(): void {
  _registration = null
  _hasUpdate = false
  _reloadPending = false
  _launchHandled = false
  _listeners.clear()
}

// Background checks share one rejection handler — update() rejects while offline, which
// is routine for an installed PWA and must not surface as an unhandled rejection.
function pollForUpdate(): void {
  _registration?.update().catch((e: unknown) => {
    debugLog('PWA', 'warn', 'update-poll-failed', { error: String(e) })
  })
}

export function usePWAUpdate() {
  const [, forceRender] = useState(0)
  const [autoUpdateEnabled, setAutoUpdateEnabled] = useState(isAutoUpdateEnabled)

  const { updateServiceWorker } = useRegisterSW({
    onRegisteredSW(_swUrl, r) {
      if (!r) return
      _registration = r
      debugLog('PWA', 'info', 'sw-registered', {
        state: r.active ? 'active' : r.waiting ? 'waiting' : 'installing',
      })

      // Launch-apply: only when the registration FIRST resolves (the launch moment — the
      // user hasn't started reading yet). A worker that reaches waiting later in the
      // session is mid-session and defers to onNeedRefresh below.
      if (_launchHandled) return
      _launchHandled = true
      if (r.waiting && isAutoUpdateEnabled() && !wasJustUpdated()) {
        _reloadPending = true // reload latch — the controllerchange effect reloads once
        _hasUpdate = false // disarm in case the 'waiting' callback fired a microtask earlier
        markUpdateApplied()
        debugLog('PWA', 'info', 'launch-apply', {
          detail: 'Waiting worker found at startup — applying silently (auto-on-launch)',
        })
        r.waiting.postMessage({ type: 'SKIP_WAITING' })
        notifyListeners()
      }
    },
    onNeedRefresh() {
      // Mid-session detection: arm the banner only — never reload over the user's read.
      // The waiting worker persists and auto-applies on the next launch.
      if (_reloadPending || wasJustUpdated()) return
      _hasUpdate = true
      debugLog('PWA', 'info', 'update-available', {
        detail: 'New service worker version waiting — user will see update banner',
      })
      notifyListeners()
    },
  })

  // Sync module singleton state into React so hasUpdate changes re-render consumers.
  useEffect(() => {
    const listener = () => forceRender((n) => n + 1)
    _listeners.add(listener)
    return () => {
      _listeners.delete(listener)
    }
  }, [])

  // Launch-apply reload backstop: reload once when the new worker takes control, gated on
  // the latch so background SW churn (e.g. another tab updating) can never yank the page.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    let refreshing = false
    const handleControllerChange = () => {
      if (refreshing || !_reloadPending) return
      refreshing = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)
    return () =>
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
  }, [])

  // Requirement: Poll for SW updates every hour regardless of current update state
  // Approach: Empty dependency array — start polling once on mount, clean up on unmount.
  //   The interval reads the module-level registration dynamically (it is null until
  //   onRegisteredSW fires), so no stale capture is possible.
  useEffect(() => {
    const interval = setInterval(pollForUpdate, POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  // Visibility check — catches a fresh deploy faster than the hourly poll when the user
  // returns to the tab (or foregrounds the installed PWA).
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') pollForUpdate()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // Explicit user tap on the banner. updateServiceWorker sends SKIP_WAITING; the reload
  // comes from vite-plugin-pwa's 'controlling' listener (installed when 'waiting' fired).
  const update = useCallback(() => {
    debugLog('PWA', 'info', 'update-applied', { detail: 'User triggered service worker update' })
    markUpdateApplied() // same 30s false-re-detection suppression as launch-apply
    return updateServiceWorker(true)
  }, [updateServiceWorker])

  const setAutoUpdate = useCallback((on: boolean) => {
    persistAutoUpdate(on)
    setAutoUpdateEnabled(on)
    debugLog('PWA', 'info', 'auto-update-toggled', { enabled: on })
  }, [])

  // Manual "Check for updates" — typed result so the caller can show plain-language
  // feedback. The awaited settle timeout is a self-resolving one-shot (nothing to clean
  // up); the CALLER guards its own setState against unmount during the wait.
  const checkForUpdate = useCallback(async (): Promise<UpdateCheckResult> => {
    if (!_registration) return 'no-sw'
    debugLog('PWA', 'info', 'update-check', { detail: 'User triggered manual update check' })
    try {
      await _registration.update()
      await new Promise((resolve) => setTimeout(resolve, CHECK_SETTLE_MS))
      return _hasUpdate ? 'update-available' : 'up-to-date'
    } catch (e) {
      debugLog('PWA', 'error', 'update-check-failed', { error: String(e) })
      return 'error'
    }
  }, [])

  return {
    // _hasUpdate (not the wrapper's needRefresh state) is the source of truth: the
    // wrapper sets its own flag on EVERY waiting event, which would bypass the
    // launch-apply and just-updated suppression above.
    hasUpdate: _hasUpdate,
    update,
    checkForUpdate,
    autoUpdateEnabled,
    setAutoUpdate,
  }
}
