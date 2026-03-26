// Requirement: Floating debug panel for diagnosing email and PWA issues on mobile
// Approach: Two-tab banner (Email Diagnostics + Event Log) rendered as a floating
//   pill on the bottom-right. Subscribes to the shared debugLog store for real-time
//   event display. Includes one-tap copy of full report for handing to another session.
// Alternatives considered:
//   - Inline debug button per component: Rejected — no unified view of all events
//   - Separate page/route: Rejected — app has no routing, adds complexity
//   - Browser devtools only: Rejected — not accessible on mobile PWA

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  subscribeDebugLog,
  clearDebugLog,
  formatDebugReport,
  debugLog,
  type DebugEntry,
  type DebugSeverity,
  type DebugSource,
} from '../utils/debugLog'
import {
  type DiagnosticCheck,
  checkProtocol,
  checkNetwork,
  checkApiUrl,
  checkApiDeployed,
  checkApiReachable,
  refineDeployedCheck,
  checkCorsHeaders,
  checkServiceWorker,
  checkInstallState,
  checkInstallPrompt,
  checkBrowserInfo,
  checkUserAgent,
} from '../utils/diagnostics'

type Tab = 'diagnostics' | 'log'

interface DebugBannerProps {
  /** Whether the native install prompt was captured */
  canInstall?: boolean
}

const severityColors: Record<DebugSeverity, string> = {
  info: 'text-text-muted',
  success: 'text-accent',
  warn: 'text-amber-400',
  error: 'text-red-400',
}

const sourceColors: Record<DebugSource, string> = {
  InterestForm: 'text-primary',
  PWA: 'text-secondary',
  App: 'text-text-muted',
}

// Requirement: Floating debug panel for PWA / email diagnostics
// Note: UpdatePrompt moved to a top banner, so no vertical offset is needed here.

function statusIcon(status: DiagnosticCheck['status']) {
  switch (status) {
    case 'pass': return <span className="text-accent">&#10003;</span>
    case 'fail': return <span className="text-red-400">&#10007;</span>
    case 'warn': return <span className="text-amber-400">&#9888;</span>
    case 'running': return <span className="text-text-muted animate-pulse">&#8230;</span>
  }
}

export default function DebugBanner({ canInstall }: DebugBannerProps) {
  const [expanded, setExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('diagnostics')
  const [entries, setEntries] = useState<DebugEntry[]>([])
  const [diagnostics, setDiagnostics] = useState<DiagnosticCheck[]>([])
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  // Subscribe to the shared debug log store
  useEffect(() => {
    return subscribeDebugLog(setEntries)
  }, [])

  // Requirement: Immutable diagnostic state updates during async probe sequence
  // Approach: Helper that replaces the last entry in a new array copy, avoiding
  //   mutable index-based mutation on the same reference between async steps
  const replaceLast = (arr: DiagnosticCheck[], entry: DiagnosticCheck): DiagnosticCheck[] => [
    ...arr.slice(0, -1),
    entry,
  ]

  // Orchestrates diagnostic checks extracted to src/utils/diagnostics.ts.
  // Each check is a pure function; this callback manages sequencing and state updates.
  const runDiagnostics = useCallback(async () => {
    let checks: DiagnosticCheck[] = []

    // Sync checks
    checks = [...checks, checkProtocol(), checkNetwork(), checkApiUrl(import.meta.env.VITE_INTEREST_API_URL as string | undefined)]

    // API probes (only if URL is configured)
    const apiUrl = import.meta.env.VITE_INTEREST_API_URL as string | undefined
    if (apiUrl) {
      // 4a. Deployment check
      checks = [...checks, { label: 'API Deployed', status: 'running', detail: 'Checking health endpoint...' }]
      setDiagnostics(checks)
      const deployResult = await checkApiDeployed(apiUrl)
      checks = replaceLast(checks, deployResult.check)

      // 4b. Reachability check
      checks = [...checks, { label: 'API Reachable', status: 'running', detail: 'Checking...' }]
      setDiagnostics(checks)
      const reachResult = await checkApiReachable(apiUrl)
      checks = replaceLast(checks, reachResult.check)

      // 4a→4b refinement
      checks = refineDeployedCheck(checks, deployResult.deployed, reachResult.reachable)
      setDiagnostics(checks)

      // 4c. CORS headers (only if deployed)
      if (deployResult.deployed) {
        checks = [...checks, { label: 'CORS Headers', status: 'running', detail: 'Checking...' }]
        setDiagnostics(checks)
        checks = replaceLast(checks, await checkCorsHeaders(apiUrl, reachResult.reachable))
      }
    }

    // Async environment checks
    checks = [...checks, await checkServiceWorker()]

    // Sync environment checks
    checks = [...checks, checkInstallState(), checkInstallPrompt(canInstall ?? false), checkBrowserInfo(), checkUserAgent()]

    setDiagnostics(checks)
    debugLog('App', 'info', 'diagnostics-ran', {
      results: checks.map((c) => ({ label: c.label, status: c.status, detail: c.detail })),
    })
  }, [canInstall])

  // Cleanup copy-state reset timer on unmount or rapid re-copies
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    }
  }, [])

  const handleCopy = async () => {
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current)
    const text = formatDebugReport(diagnostics)
    try {
      await navigator.clipboard.writeText(text)
      setCopyState('copied')
      copyTimerRef.current = setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      setCopyState('failed')
    }
  }

  const errorCount = useMemo(
    () => entries.filter((e) => e.severity === 'error').length,
    [entries],
  )

  // Collapsed pill
  if (!expanded) {
    // Requirement: WCAG 2.5.5 touch target (44px min) + safe area clearance on notched devices
    // Approach: min-h/min-w 44px on pill, bottom/right use max() for safe area fallback
    // Alternatives considered:
    //   - Fixed 4rem offset: Rejected — overlaps home indicator on iPhone
    return (
      <button
        type="button"
        onClick={() => {
          setExpanded(true)
          if (diagnostics.length === 0) {
            void runDiagnostics()
          }
        }}
        className="fixed z-50 flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-xs font-mono shadow-lg transition-all hover:bg-surface-light no-print"
        style={{ bottom: 'max(1rem, env(safe-area-inset-bottom))', right: 'max(1rem, env(safe-area-inset-right))' }}
      >
        <span className="text-primary">DBG</span>
        <span className="text-text-muted">{entries.length}</span>
        {errorCount > 0 && (
          <span className="rounded-full bg-red-400/20 px-1.5 text-red-400">
            {errorCount} err
          </span>
        )}
      </button>
    )
  }

  // Expanded panel
  return (
    <div
      className="fixed bottom-0 right-0 z-50 m-2 flex max-h-[60vh] w-[calc(100vw-1rem)] max-w-lg flex-col rounded-xl border border-border bg-surface shadow-2xl no-print sm:m-0"
      style={{ bottom: 'max(0.5rem, env(safe-area-inset-bottom))', right: 'max(0.5rem, env(safe-area-inset-right))' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-1">
          {/* Tabs */}
          <button
            type="button"
            onClick={() => setActiveTab('diagnostics')}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              activeTab === 'diagnostics'
                ? 'bg-primary/20 text-primary'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Diagnostics
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('log')}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              activeTab === 'log'
                ? 'bg-primary/20 text-primary'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Event Log
            {entries.length > 0 && (
              <span className="ml-1 text-text-muted">({entries.length})</span>
            )}
          </button>
        </div>

        <div className="flex items-center gap-1">
          {activeTab === 'diagnostics' && (
            <button
              type="button"
              onClick={() => void runDiagnostics()}
              className="rounded px-2 py-1 text-xs text-text-muted hover:bg-surface-light transition-colors"
              title="Re-run diagnostics"
            >
              Re-run
            </button>
          )}
          {activeTab === 'log' && (
            <button
              type="button"
              onClick={clearDebugLog}
              className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-400/10 transition-colors"
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => void handleCopy()}
            className={`rounded px-2 py-1 text-xs transition-colors ${
              copyState === 'copied'
                ? 'text-accent'
                : 'text-text-muted hover:bg-surface-light'
            }`}
          >
            {copyState === 'copied' ? 'Copied!' : 'Copy All'}
          </button>
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded text-text-muted hover:text-text transition-colors"
            aria-label="Collapse debug panel"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Clipboard fallback for mobile browsers that block clipboard API */}
      {copyState === 'failed' && (
        <div className="border-b border-border px-3 py-2">
          <p className="mb-1 text-xs text-text-muted">
            Could not copy automatically. Select all text below and copy manually.
          </p>
          <textarea
            readOnly
            rows={6}
            value={formatDebugReport(diagnostics)}
            onFocus={(e) => e.target.select()}
            className="w-full rounded border border-border bg-background p-1.5 text-xs font-mono text-text-muted focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setCopyState('idle')}
            className="mt-1 text-xs text-primary hover:text-primary-light"
          >
            Hide
          </button>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {activeTab === 'diagnostics' && (
          <div className="space-y-1.5">
            {diagnostics.length === 0 && (
              <p className="py-4 text-center text-xs text-text-muted">
                Running diagnostics...
              </p>
            )}
            {diagnostics.map((check) => (
              <div
                key={check.label}
                className="flex items-start gap-2 rounded bg-background/50 px-2 py-1.5 text-xs"
              >
                <span className="mt-0.5 shrink-0 w-4 text-center">{statusIcon(check.status)}</span>
                <div className="min-w-0">
                  <span className="font-medium text-text">{check.label}</span>
                  <p className="truncate text-text-muted" title={check.detail}>
                    {check.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'log' && (
          <div className="space-y-1">
            {entries.length === 0 && (
              <p className="py-4 text-center text-xs text-text-muted">
                No events yet. Interact with the form to see logs.
              </p>
            )}
            {entries.map((entry, i) => (
              <div
                key={`${entry.timestamp}-${i}`}
                className="flex items-start gap-1.5 text-xs font-mono leading-relaxed"
              >
                <span className="shrink-0 text-text-muted">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span className={`shrink-0 uppercase font-semibold w-10 ${severityColors[entry.severity]}`}>
                  {entry.severity === 'success' ? 'ok' : entry.severity.slice(0, 4)}
                </span>
                <span className={`shrink-0 ${sourceColors[entry.source]}`}>
                  {entry.source}
                </span>
                <span className="text-text">{entry.event}</span>
                {entry.details && (
                  <details className="inline min-w-0">
                    <summary className="cursor-pointer text-text-muted hover:text-text">
                      {'{...}'}
                    </summary>
                    <pre className="mt-1 overflow-x-auto whitespace-pre-wrap rounded bg-background p-1.5 text-text-muted">
                      {JSON.stringify(entry.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border px-3 py-1.5 text-center">
        <p className="text-xs text-text-muted font-mono">
          {entries.length} events
          {errorCount > 0 && <span className="text-red-400"> &middot; {errorCount} errors</span>}
        </p>
      </div>
    </div>
  )
}
