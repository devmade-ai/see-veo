// Requirement: Deduplicate AbortController + setTimeout timeout pattern across components
// Approach: Single utility wrapping fetch with automatic abort-on-timeout and cleanup.
//   Used by InterestForm (form submission, failure diagnosis) and DebugBanner (API probes).
// Alternatives considered:
//   - Inline pattern in each caller: Rejected — 6 occurrences of identical boilerplate
//   - Third-party library (ky, got): Rejected — overkill for a single pattern

/**
 * Fetch wrapper that automatically aborts after a timeout.
 * Throws AbortError on timeout, just like a manually-aborted fetch.
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number,
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}
