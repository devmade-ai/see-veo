// Requirement: Mock for virtual:pwa-register/react Vite virtual module
// Approach: Provide a stub useRegisterSW that vitest resolves via alias in vitest.config.ts.
//   The virtual module doesn't exist outside Vite's PWA plugin, so tests need a concrete file.
// Alternatives considered:
//   - vi.mock inline factory only: Rejected — Vite's import analysis plugin rejects the
//     unresolvable virtual module before vi.mock can intercept it
//   - Mock the entire hook module: Rejected — tests the mock, not the real hook logic

import { vi } from 'vitest'

export const useRegisterSW = vi.fn((opts?: { onRegisteredSW?: (url: string, r: unknown) => void }) => {
  if (opts?.onRegisteredSW) {
    opts.onRegisteredSW('sw.js', { update: vi.fn() })
  }
  return {
    needRefresh: [false],
    updateServiceWorker: vi.fn(),
  }
})
