import '@testing-library/jest-dom/vitest'
import { beforeEach } from 'vitest'

// The contact form keeps an in-progress draft in sessionStorage (utils/formDraft.ts).
// Clear it between tests so one test's typing can't pre-fill the next test's form.
beforeEach(() => {
  sessionStorage.clear()
})

// jsdom has no 2D canvas backend. The pixel-runner engine treats a null context as
// "no-op" (it never starts its render loop), so returning null keeps the game shell
// renderable in tests without the noisy "not implemented: getContext" jsdom warning.
HTMLCanvasElement.prototype.getContext = (() => null) as unknown as typeof HTMLCanvasElement.prototype.getContext

// jsdom doesn't implement matchMedia; the app reads prefers-reduced-motion through it.
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia
}
