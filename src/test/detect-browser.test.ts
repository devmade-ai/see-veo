import { describe, it, expect, vi, afterEach } from 'vitest'

// Requirement: Test browser detection logic used for PWA install instructions
// Approach: Mock navigator.userAgent and test each detection path
// Alternatives considered:
//   - Test via component rendering: Rejected — slower, couples test to UI

function detectBrowser(ua: string) {
  if (ua.includes('Brave')) return 'brave'
  if (ua.includes('Edg/')) return 'edge'
  if (ua.includes('Chrome')) return 'chrome'
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'safari'
  if (ua.includes('Firefox')) return 'firefox'
  return 'unknown'
}

describe('detectBrowser', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('detects Chrome', () => {
    expect(detectBrowser('Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36')).toBe('chrome')
  })

  it('detects Edge', () => {
    expect(detectBrowser('Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0')).toBe('edge')
  })

  it('detects Brave', () => {
    expect(detectBrowser('Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36 Brave')).toBe('brave')
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
