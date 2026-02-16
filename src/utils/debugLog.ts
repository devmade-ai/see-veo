// Requirement: Shared debug logging backbone for diagnosing email issues on mobile
// Approach: Pub/sub in-memory event store with capped buffer (200 entries).
//   Components call debugLog() to emit events; the DebugBanner subscribes to
//   display them in real time. The store is global so it survives re-renders.
// Alternatives considered:
//   - Per-component local state: Rejected — logs lost when component unmounts
//   - External logging service: Rejected — adds dependency, overkill for dev debugging
//   - Console.log only: Rejected — not accessible on mobile without remote debugger

const MAX_ENTRIES = 200

export type DebugSeverity = 'info' | 'success' | 'warn' | 'error'
export type DebugSource = 'InterestForm' | 'PWA' | 'App'

export interface DebugEntry {
  /** ISO timestamp */
  timestamp: string
  /** Which part of the app emitted this */
  source: DebugSource
  /** Severity level for color-coding */
  severity: DebugSeverity
  /** Short event name (e.g. "submit", "response", "timeout") */
  event: string
  /** Optional details — structured data for diagnostics */
  details?: Record<string, unknown>
}

type Listener = (entries: DebugEntry[]) => void

/** In-memory store — lives for the lifetime of the page */
const entries: DebugEntry[] = []
const listeners = new Set<Listener>()

function notify() {
  for (const fn of listeners) {
    fn([...entries])
  }
}

/** Emit a debug log entry. No-ops are cheap — call freely in any code path. */
export function debugLog(
  source: DebugSource,
  severity: DebugSeverity,
  event: string,
  details?: Record<string, unknown>,
): void {
  entries.push({
    timestamp: new Date().toISOString(),
    source,
    severity,
    event,
    details,
  })

  // Cap the buffer to prevent unbounded growth
  if (entries.length > MAX_ENTRIES) {
    entries.splice(0, entries.length - MAX_ENTRIES)
  }

  notify()
}

/** Subscribe to log updates. Returns an unsubscribe function. */
export function subscribeDebugLog(fn: Listener): () => void {
  listeners.add(fn)
  // Immediately send current entries so subscriber is up to date
  fn([...entries])
  return () => listeners.delete(fn)
}

/** Clear all entries and notify subscribers */
export function clearDebugLog(): void {
  entries.length = 0
  notify()
}

/** Get a snapshot of all entries (for copy-to-clipboard) */
export function getDebugEntries(): DebugEntry[] {
  return [...entries]
}

/** Format all entries as a plain-text report for pasting into another session */
export function formatDebugReport(): string {
  const lines: string[] = [
    '## Debug Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    `Page URL: ${window.location.href}`,
    `User Agent: ${navigator.userAgent}`,
    `Online: ${navigator.onLine}`,
    `Protocol: ${window.location.protocol}`,
    '',
    `### Event Log (${entries.length} entries)`,
    '',
  ]

  for (const entry of entries) {
    const time = new Date(entry.timestamp).toLocaleTimeString()
    const detailStr = entry.details
      ? ` | ${JSON.stringify(entry.details)}`
      : ''
    lines.push(
      `[${time}] [${entry.severity.toUpperCase()}] [${entry.source}] ${entry.event}${detailStr}`,
    )
  }

  return lines.join('\n')
}
