// Requirement: When the interest-form fetch throws a TypeError on mobile, tell the
//   visitor what actually went wrong (service offline vs. browser blocking vs. network).
// Approach: A pure, testable failure-diagnosis probe: hit the API's /health endpoint
//   (cors GET) to confirm deployment, then a no-cors GET to distinguish "server down"
//   from "browser/CORS blocking". The caller (InterestForm) owns its own state/UI.
// Alternatives considered:
//   - Inline the branching in InterestForm: Rejected — isolating it keeps the form
//     handler readable and lets the diagnosis be unit-tested independently
//   - A full on-screen diagnostics panel (the old DebugBanner): Removed with the new design

import { fetchWithTimeout } from './fetchWithTimeout'

// Requirement: Distinguish failure modes when fetch throws TypeError on mobile:
//   (a) API not deployed — Vercel returns 404 without CORS headers → looks like network error
//   (b) API deployed but CORS misconfigured — function runs but browser blocks response
//   (c) Server genuinely unreachable — network/DNS failure
//   (d) Browser privacy features blocking cross-origin requests (Brave Shields, etc.)
export type FailureCause = 'not-deployed' | 'cors' | 'network' | 'browser-blocked'

/** Probe timeout for failure diagnosis — kept short so users aren't left waiting. */
const DIAGNOSIS_TIMEOUT_MS = 3_000

export async function diagnoseFailure(apiUrl: string): Promise<FailureCause> {
  const healthUrl = apiUrl.replace(/\/[^/]+$/, '/health')

  // Step 1: Health endpoint — verify API is deployed via cors-mode GET
  try {
    const res = await fetchWithTimeout(healthUrl, { method: 'GET', mode: 'cors' }, DIAGNOSIS_TIMEOUT_MS)
    if (!res.ok) {
      return 'not-deployed'
    }
  } catch {
    // Health fetch failed — could be CORS, browser privacy, or not deployed.
    // Try no-cors probe to check if the server is reachable at all.
    try {
      const res = await fetchWithTimeout(healthUrl, { method: 'GET', mode: 'no-cors' }, DIAGNOSIS_TIMEOUT_MS)
      if (res.type === 'opaque') {
        // Server responded but cors was blocked — browser privacy features
        return 'browser-blocked'
      }
    } catch {
      return 'network'
    }
    return 'not-deployed'
  }

  // Step 2: Health works, so API is deployed. The form fetch failed due to CORS.
  return 'cors'
}
