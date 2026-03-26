// Requirement: Tests for PWA hooks (usePWAInstall, usePWAUpdate)
// Approach: Test usePWAInstall by mocking window events and navigator; test usePWAUpdate
//   by mocking the virtual:pwa-register/react module via vitest alias + vi.mock override
// Alternatives considered:
//   - Render components that consume hooks: Rejected — adds coupling to UI;
//     renderHook isolates hook logic
//   - Skip usePWAUpdate tests: Rejected — the periodic update check and state
//     exposure are critical PWA functionality worth verifying

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
let mockNeedRefresh = false

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: (opts?: { onRegisteredSW?: (url: string, r: unknown) => void }) => {
    if (opts?.onRegisteredSW) {
      opts.onRegisteredSW('sw.js', { update: vi.fn() })
    }
    return {
      needRefresh: [mockNeedRefresh],
      updateServiceWorker: mockUpdateServiceWorker,
    }
  },
}))

import { usePWAUpdate } from '../hooks/usePWAUpdate'

describe('usePWAUpdate', () => {
  beforeEach(() => {
    mockNeedRefresh = false
    mockUpdateServiceWorker.mockReset()
  })

  it('returns hasUpdate false when no update is available', () => {
    mockNeedRefresh = false
    const { result } = renderHook(() => usePWAUpdate())
    expect(result.current.hasUpdate).toBe(false)
  })

  it('returns hasUpdate true when an update is available', () => {
    mockNeedRefresh = true
    const { result } = renderHook(() => usePWAUpdate())
    expect(result.current.hasUpdate).toBe(true)
  })

  it('calls updateServiceWorker(true) when update is invoked', () => {
    const { result } = renderHook(() => usePWAUpdate())
    result.current.update()
    expect(mockUpdateServiceWorker).toHaveBeenCalledWith(true)
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
