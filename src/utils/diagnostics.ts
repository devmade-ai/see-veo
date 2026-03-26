// Requirement: Shared diagnostic utilities for DebugBanner and InterestForm
// Approach: Extract pure diagnostic check functions from DebugBanner (was 277-line function)
//   and diagnoseFailure from InterestForm into one testable module. Components call these
//   functions and manage their own state/UI updates.
// Alternatives considered:
//   - Keep everything inline: Rejected — DebugBanner exceeded 500-line file threshold,
//     runDiagnostics exceeded 100-line function threshold, and diagnoseFailure logic
//     was duplicated between InterestForm and DebugBanner
//   - Separate files per check: Rejected — checks are small and cohesive, one file is cleaner

import { fetchWithTimeout } from './fetchWithTimeout'
import { detectBrowser, isStandalone, CHROMIUM_BROWSERS } from './pwa'
import { debugLog } from './debugLog'

export interface DiagnosticCheck {
  label: string
  status: 'pass' | 'fail' | 'warn' | 'running'
  detail: string
}

/** Timeout for diagnostic probes (health, reachability, CORS) */
const PROBE_TIMEOUT_MS = 5_000

// --- Individual diagnostic checks ---

export function checkProtocol(): DiagnosticCheck {
  const isHttps = window.location.protocol === 'https:'
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  return {
    label: 'HTTPS',
    status: isHttps || isLocalhost ? 'pass' : 'fail',
    detail: isHttps ? 'Secure connection' : isLocalhost ? 'Localhost (OK for dev)' : `Insecure: ${window.location.protocol}`,
  }
}

export function checkNetwork(): DiagnosticCheck {
  return {
    label: 'Network',
    status: navigator.onLine ? 'pass' : 'fail',
    detail: navigator.onLine ? 'Online' : 'Offline — requests will fail',
  }
}

export function checkApiUrl(apiUrl: string | undefined): DiagnosticCheck {
  return {
    label: 'API URL',
    status: apiUrl ? 'pass' : 'fail',
    detail: apiUrl ?? 'VITE_INTEREST_API_URL not set',
  }
}

/** Check if the API is deployed by hitting the health endpoint with CORS mode. */
export async function checkApiDeployed(
  apiUrl: string,
): Promise<{ check: DiagnosticCheck; deployed: boolean }> {
  const healthUrl = apiUrl.replace(/\/[^/]+$/, '/health')
  try {
    const res = await fetchWithTimeout(healthUrl, { method: 'GET', mode: 'cors' }, PROBE_TIMEOUT_MS)
    const deployed = res.ok
    return {
      check: {
        label: 'API Deployed',
        status: deployed ? 'pass' : 'warn',
        detail: deployed ? 'Health endpoint OK' : `HTTP ${res.status} ${res.statusText}`,
      },
      deployed,
    }
  } catch (err) {
    debugLog('App', 'warn', 'health-check-failed', {
      url: healthUrl,
      error: err instanceof Error ? err.message : String(err),
    })
    return {
      check: {
        label: 'API Deployed',
        status: 'fail',
        detail: 'API not deployed — the messaging service is offline',
      },
      deployed: false,
    }
  }
}

/**
 * Check if the API server is reachable via no-cors HEAD probe.
 * Opaque response = server responded (reachable), even if CORS blocks the body.
 */
export async function checkApiReachable(
  apiUrl: string,
): Promise<{ check: DiagnosticCheck; reachable: boolean }> {
  try {
    const res = await fetchWithTimeout(apiUrl, { method: 'HEAD', mode: 'no-cors' }, PROBE_TIMEOUT_MS)
    const reachable = res.type === 'opaque'
    return {
      check: {
        label: 'API Reachable',
        status: reachable ? 'pass' : 'warn',
        detail: reachable ? 'Server responded' : `Unexpected response type: ${res.type}`,
      },
      reachable,
    }
  } catch (err) {
    return {
      check: {
        label: 'API Reachable',
        status: 'fail',
        detail: err instanceof Error ? err.message : 'Connection failed',
      },
      reachable: false,
    }
  }
}

/** Refine the "API Deployed" check when the server is reachable but health check was blocked. */
export function refineDeployedCheck(
  checks: DiagnosticCheck[],
  deployed: boolean,
  reachable: boolean,
): DiagnosticCheck[] {
  if (!deployed && reachable) {
    return checks.map((c) =>
      c.label === 'API Deployed'
        ? {
            ...c,
            status: 'warn' as const,
            detail: 'Server is up but health check was blocked — likely browser privacy settings or CORS',
          }
        : c,
    )
  }
  return checks
}

/** Check CORS headers via OPTIONS request. Only meaningful when API is confirmed deployed. */
export async function checkCorsHeaders(
  apiUrl: string,
  serverReachable: boolean,
): Promise<DiagnosticCheck> {
  try {
    const res = await fetchWithTimeout(apiUrl, { method: 'OPTIONS', mode: 'cors' }, PROBE_TIMEOUT_MS)
    return {
      label: 'CORS Headers',
      status: res.ok || res.status === 204 || res.status === 405 ? 'pass' : 'warn',
      detail: `HTTP ${res.status} ${res.statusText}`,
    }
  } catch (err) {
    return {
      label: 'CORS Headers',
      status: 'fail',
      detail: serverReachable
        ? 'Server is reachable but CORS is blocking — check ALLOWED_ORIGINS on the API'
        : err instanceof Error ? err.message : 'Connection failed',
    }
  }
}

export async function checkServiceWorker(): Promise<DiagnosticCheck> {
  if (!('serviceWorker' in navigator)) {
    return { label: 'Service Worker', status: 'warn', detail: 'Not supported in this browser' }
  }
  try {
    const reg = await navigator.serviceWorker.getRegistration()
    if (reg) {
      const swState = reg.active ? 'active' : reg.waiting ? 'waiting' : reg.installing ? 'installing' : 'unknown'
      return { label: 'Service Worker', status: reg.active ? 'pass' : 'warn', detail: `Registered (${swState})` }
    }
    return { label: 'Service Worker', status: 'warn', detail: 'Not registered' }
  } catch {
    return { label: 'Service Worker', status: 'fail', detail: 'Error checking registration' }
  }
}

export function checkInstallState(): DiagnosticCheck {
  const standalone = isStandalone()
  return {
    label: 'Install State',
    status: standalone ? 'pass' : 'warn',
    detail: standalone ? 'Running as installed app' : 'Running in browser',
  }
}

export function checkInstallPrompt(canInstall: boolean): DiagnosticCheck {
  const browser = detectBrowser()
  const expectsPrompt = CHROMIUM_BROWSERS.includes(browser)
  return {
    label: 'Install Prompt',
    status: canInstall ? 'pass' : expectsPrompt ? 'warn' : 'pass',
    detail: canInstall
      ? 'Ready — install button visible'
      : expectsPrompt
        ? 'Not available — visit a few times or check browser privacy settings'
        : 'N/A — this browser uses manual install',
  }
}

export function checkBrowserInfo(): DiagnosticCheck {
  const browser = detectBrowser()
  return {
    label: 'Detected Browser',
    status: 'pass',
    detail: browser.charAt(0).toUpperCase() + browser.slice(1),
  }
}

export function checkUserAgent(): DiagnosticCheck {
  return {
    label: 'User Agent',
    status: 'pass',
    detail: navigator.userAgent,
  }
}

// --- Shared failure diagnosis (used by InterestForm and DebugBanner) ---

// Requirement: Distinguish failure modes when fetch throws TypeError on mobile:
//   (a) API not deployed — Vercel returns 404 without CORS headers → looks like network error
//   (b) API deployed but CORS misconfigured — function runs but browser blocks response
//   (c) Server genuinely unreachable — network/DNS failure
//   (d) Browser privacy features blocking cross-origin requests (Brave Shields, etc.)
// Approach: Check health endpoint (GET /api/health with cors) to detect deployment status,
//   then no-cors probe to distinguish "server down" from "browser blocking".
export type FailureCause = 'not-deployed' | 'cors' | 'network' | 'browser-blocked'

/** Probe timeout for failure diagnosis — shorter than diagnostic panel probes */
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
