// Requirement: Test browser detection logic used for PWA install instructions
// Approach: Import and test the real detectBrowser function from utils/pwa
// Alternatives considered:
//   - Local copy of function: Rejected — tests a copy, not the real code, so
//     regressions in the actual function go undetected
//   - Test via component rendering: Rejected — slower, couples test to UI

import { describe, it, expect, afterEach } from 'vitest'
import { detectBrowser } from '../utils/pwa'

describe('detectBrowser', () => {
  // Clean up navigator.brave after tests that set it
  afterEach(() => {
    if ('brave' in navigator) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (navigator as any).brave
    }
  })

  it('detects Chrome', () => {
    expect(detectBrowser('Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36')).toBe('chrome')
  })

  it('detects Edge', () => {
    expect(detectBrowser('Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0')).toBe('edge')
  })

  it('detects Brave via UA string', () => {
    expect(detectBrowser('Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36 Brave')).toBe('brave')
  })

  // Requirement: Brave Mobile strips "Brave" from the UA string but exposes
  // navigator.brave API. Verify detection works via the API fallback.
  it('detects Brave via navigator.brave API when UA lacks Brave substring', () => {
    Object.defineProperty(navigator, 'brave', {
      value: { isBrave: () => Promise.resolve(true) },
      configurable: true,
    })
    // UA looks like plain Chrome — should still detect as Brave
    expect(detectBrowser('Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/145.0.0.0 Mobile Safari/537.36')).toBe('brave')
  })

  it('detects Safari (not Chrome)', () => {
    expect(detectBrowser('Mozilla/5.0 (Macintosh) AppleWebKit/605 Safari/605')).toBe('safari')
  })

  it('detects Firefox', () => {
    expect(detectBrowser('Mozilla/5.0 Firefox/120.0')).toBe('firefox')
  })

  it('returns unknown for unrecognized UA', () => {
    expect(detectBrowser('SomeRandomBrowser/1.0')).toBe('unknown')
  })
})
