// Requirement: Tests for PWA hooks (usePWAInstall, usePWAUpdate) including the
//   fleet-standard auto-on-launch update policy (launch-apply, mid-session defer,
//   "Automatic updates" toggle, typed manual check)
// Approach: Test usePWAInstall by mocking window events and navigator; test usePWAUpdate
//   by mocking the virtual:pwa-register/react module via vitest alias + vi.mock override,
//   exposing the captured onNeedRefresh callback and a per-test registration object so
//   tests can simulate a waiting worker at launch and mid-session detections
// Alternatives considered:
//   - Render components that consume hooks: Rejected — adds coupling to UI;
//     renderHook isolates hook logic
//   - Skip usePWAUpdate tests: Rejected — launch-apply and its gates are the riskiest
//     PWA behavior in the app (an unwanted reload) and must be pinned by tests

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

// Mock utils/pwa to control browser detection and standalone state
vi.mock('../utils/pwa', () => ({
  detectBrowser: () => 'chrome',
  isStandalone: () => false,
  CHROMIUM_BROWSERS: ['chrome', 'edge', 'brave', 'opera', 'samsung', 'vivaldi', 'arc'],
  BROWSER_DISPLAY_NAMES: {} as Record<string, string>,
}))

// Override the mock alias with a controllable vi.mock for usePWAUpdate tests.
// The vitest alias resolves the virtual module to a concrete file; this vi.mock
// replaces that resolved module with per-test controllable behavior.
const mockUpdateServiceWorker = vi.fn()
interface MockRegistration {
  update: ReturnType<typeof vi.fn>
  active?: object
  waiting?: { postMessage: ReturnType<typeof vi.fn> }
}
let mockRegistration: MockRegistration | null = null
let capturedOnNeedRefresh: (() => void) | undefined

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: (opts?: {
    onRegisteredSW?: (url: string, r: unknown) => void
    onNeedRefresh?: () => void
  }) => {
    capturedOnNeedRefresh = opts?.onNeedRefresh
    if (opts?.onRegisteredSW && mockRegistration) {
      opts.onRegisteredSW('sw.js', mockRegistration)
    }
    return {
      needRefresh: [false],
      updateServiceWorker: mockUpdateServiceWorker,
    }
  },
}))

import { usePWAUpdate, _resetPwaUpdateStateForTesting } from '../hooks/usePWAUpdate'

const AUTO_UPDATE_KEY = 'jt-cv-auto-update'
const UPDATE_APPLIED_KEY = 'jt-cv-pwa-updated'

describe('usePWAUpdate', () => {
  beforeEach(() => {
    _resetPwaUpdateStateForTesting()
    localStorage.clear()
    sessionStorage.clear()
    mockRegistration = null
    capturedOnNeedRefresh = undefined
    mockUpdateServiceWorker.mockReset()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns hasUpdate false when no update is available', () => {
    const { result } = renderHook(() => usePWAUpdate())
    expect(result.current.hasUpdate).toBe(false)
  })

  it('arms hasUpdate when a mid-session update is detected — and never auto-applies', () => {
    mockRegistration = { update: vi.fn(), active: {} }
    const { result } = renderHook(() => usePWAUpdate())

    act(() => capturedOnNeedRefresh?.())

    expect(result.current.hasUpdate).toBe(true)
    // Mid-session detections must only arm the banner — no skip-waiting, no reload
    expect(mockUpdateServiceWorker).not.toHaveBeenCalled()
  })

  it('calls updateServiceWorker(true) and records the suppression stamp on update()', () => {
    const { result } = renderHook(() => usePWAUpdate())
    act(() => {
      void result.current.update()
    })
    expect(mockUpdateServiceWorker).toHaveBeenCalledWith(true)
    expect(sessionStorage.getItem(UPDATE_APPLIED_KEY)).not.toBeNull()
  })

  it('launch-applies a worker that is already waiting when registration resolves', () => {
    const postMessage = vi.fn()
    mockRegistration = { update: vi.fn(), active: {}, waiting: { postMessage } }
    const { result } = renderHook(() => usePWAUpdate())

    expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' })
    expect(sessionStorage.getItem(UPDATE_APPLIED_KEY)).not.toBeNull()
    // Silent apply — the banner must not arm even if the waiting event also fires
    act(() => capturedOnNeedRefresh?.())
    expect(result.current.hasUpdate).toBe(false)
  })

  it('does not launch-apply when the automatic updates preference is off', () => {
    localStorage.setItem(AUTO_UPDATE_KEY, 'false')
    const postMessage = vi.fn()
    mockRegistration = { update: vi.fn(), active: {}, waiting: { postMessage } }
    const { result } = renderHook(() => usePWAUpdate())

    expect(postMessage).not.toHaveBeenCalled()
    // Tap-only mode: the update still arms the banner for an explicit tap
    act(() => capturedOnNeedRefresh?.())
    expect(result.current.hasUpdate).toBe(true)
  })

  it('does not launch-apply inside the 30s just-updated suppression window', () => {
    sessionStorage.setItem(UPDATE_APPLIED_KEY, String(Date.now()))
    const postMessage = vi.fn()
    mockRegistration = { update: vi.fn(), active: {}, waiting: { postMessage } }
    const { result } = renderHook(() => usePWAUpdate())

    expect(postMessage).not.toHaveBeenCalled()
    // Re-detection right after an applied update is suppressed too
    act(() => capturedOnNeedRefresh?.())
    expect(result.current.hasUpdate).toBe(false)
  })

  it('defaults the automatic updates preference to ON and persists the toggle', () => {
    const { result } = renderHook(() => usePWAUpdate())
    expect(result.current.autoUpdateEnabled).toBe(true)

    act(() => result.current.setAutoUpdate(false))
    expect(result.current.autoUpdateEnabled).toBe(false)
    expect(localStorage.getItem(AUTO_UPDATE_KEY)).toBe('false')

    act(() => result.current.setAutoUpdate(true))
    expect(result.current.autoUpdateEnabled).toBe(true)
    expect(localStorage.getItem(AUTO_UPDATE_KEY)).toBe('true')
  })

  describe('checkForUpdate', () => {
    it("returns 'no-sw' when there is no registration", async () => {
      const { result } = renderHook(() => usePWAUpdate())
      await expect(result.current.checkForUpdate()).resolves.toBe('no-sw')
    })

    it("returns 'up-to-date' when the check finds nothing after the settle", async () => {
      vi.useFakeTimers()
      mockRegistration = { update: vi.fn().mockResolvedValue(undefined), active: {} }
      const { result } = renderHook(() => usePWAUpdate())

      const check = result.current.checkForUpdate()
      await vi.advanceTimersByTimeAsync(1500)
      await expect(check).resolves.toBe('up-to-date')
      expect(mockRegistration.update).toHaveBeenCalled()
    })

    it("returns 'update-available' when a new version arms during the settle", async () => {
      vi.useFakeTimers()
      mockRegistration = { update: vi.fn().mockResolvedValue(undefined), active: {} }
      const { result } = renderHook(() => usePWAUpdate())

      const check = result.current.checkForUpdate()
      act(() => capturedOnNeedRefresh?.())
      await vi.advanceTimersByTimeAsync(1500)
      await expect(check).resolves.toBe('update-available')
    })

    it("returns 'error' when the registration update throws", async () => {
      mockRegistration = { update: vi.fn().mockRejectedValue(new Error('offline')), active: {} }
      const { result } = renderHook(() => usePWAUpdate())
      await expect(result.current.checkForUpdate()).resolves.toBe('error')
    })
  })
})

describe('usePWAInstall', () => {
  let originalPwaPrompt: unknown

  beforeEach(() => {
    originalPwaPrompt = (window as unknown as Record<string, unknown>).__pwaInstallPrompt
    delete (window as unknown as Record<string, unknown>).__pwaInstallPrompt
  })

  afterEach(() => {
    if (originalPwaPrompt !== undefined) {
      (window as unknown as Record<string, unknown>).__pwaInstallPrompt = originalPwaPrompt
    }
  })

  it('returns canInstall false by default (no prompt event)', async () => {
    const { usePWAInstall } = await import('../hooks/usePWAInstall')
    const { result } = renderHook(() => usePWAInstall())
    expect(result.current.canInstall).toBe(false)
  })

  it('returns isInstalled false when not in standalone mode', async () => {
    const { usePWAInstall } = await import('../hooks/usePWAInstall')
    const { result } = renderHook(() => usePWAInstall())
    expect(result.current.isInstalled).toBe(false)
  })

  it('sets canInstall to true when beforeinstallprompt fires', async () => {
    const { usePWAInstall } = await import('../hooks/usePWAInstall')
    const { result } = renderHook(() => usePWAInstall())

    await act(async () => {
      const event = new Event('beforeinstallprompt')
      Object.assign(event, {
        prompt: vi.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'dismissed' }),
      })
      window.dispatchEvent(event)
    })

    expect(result.current.canInstall).toBe(true)
  })

  it('sets isInstalled true and canInstall false when appinstalled fires', async () => {
    const { usePWAInstall } = await import('../hooks/usePWAInstall')
    const { result } = renderHook(() => usePWAInstall())

    await act(async () => {
      window.dispatchEvent(new Event('appinstalled'))
    })

    expect(result.current.isInstalled).toBe(true)
    expect(result.current.canInstall).toBe(false)
  })

  it('install() returns true when user accepts', async () => {
    const { usePWAInstall } = await import('../hooks/usePWAInstall')
    const { result } = renderHook(() => usePWAInstall())

    const mockPrompt = vi.fn().mockResolvedValue(undefined)
    await act(async () => {
      const event = new Event('beforeinstallprompt')
      Object.assign(event, {
        prompt: mockPrompt,
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      })
      window.dispatchEvent(event)
    })

    let accepted: boolean | undefined
    await act(async () => {
      accepted = await result.current.install()
    })

    expect(mockPrompt).toHaveBeenCalled()
    expect(accepted).toBe(true)
    expect(result.current.canInstall).toBe(false)
  })

  it('install() returns false when user dismisses', async () => {
    const { usePWAInstall } = await import('../hooks/usePWAInstall')
    const { result } = renderHook(() => usePWAInstall())

    await act(async () => {
      const event = new Event('beforeinstallprompt')
      Object.assign(event, {
        prompt: vi.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'dismissed' }),
      })
      window.dispatchEvent(event)
    })

    let accepted: boolean | undefined
    await act(async () => {
      accepted = await result.current.install()
    })

    expect(accepted).toBe(false)
  })

  it('install() returns false when no prompt is available', async () => {
    const { usePWAInstall } = await import('../hooks/usePWAInstall')
    const { result } = renderHook(() => usePWAInstall())

    let accepted: boolean | undefined
    await act(async () => {
      accepted = await result.current.install()
    })

    expect(accepted).toBe(false)
  })

  it('provides install instructions', async () => {
    const { usePWAInstall } = await import('../hooks/usePWAInstall')
    const { result } = renderHook(() => usePWAInstall())

    const instructions = result.current.getInstallInstructions()
    expect(instructions.browser).toBeTruthy()
    expect(Array.isArray(instructions.steps)).toBe(true)
  })

  it('showManualInstructions is false for Chromium browsers', async () => {
    const { usePWAInstall } = await import('../hooks/usePWAInstall')
    const { result } = renderHook(() => usePWAInstall())
    expect(result.current.showManualInstructions).toBe(false)
  })
})
