// Requirement: Debug modal for testing and logging email sending issues on mobile
// Approach: URL-parameter-gated modal (?debug=true) that captures and displays fetch
//   request/response details, timing, and errors in a scrollable log
// Alternatives considered:
//   - Keyboard shortcut (Ctrl+Shift+D): Rejected — not usable on mobile devices
//   - Triple-click trigger: Rejected — unreliable on touch screens, accidental triggers
//   - Console-only logging: Rejected — not accessible on mobile without remote debugging

import { useState } from 'react'

/** A single log entry captured during an email send attempt */
export interface DebugLogEntry {
  /** ISO timestamp of the event */
  timestamp: string
  /** What phase of the request this entry represents */
  phase: 'request' | 'response' | 'error' | 'info'
  /** Human-readable summary of the event */
  message: string
  /** Optional structured data (request body, response headers, etc.) */
  data?: Record<string, unknown>
}

interface EmailDebugModalProps {
  logs: DebugLogEntry[]
  onClose: () => void
  onClear: () => void
}

export default function EmailDebugModal({
  logs,
  onClose,
  onClear,
}: EmailDebugModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyEntry = async (entry: DebugLogEntry, index: number) => {
    const text = JSON.stringify(entry, null, 2)
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 1500)
    } catch {
      // Clipboard API may fail on some mobile browsers — fall back silently
    }
  }

  const copyAll = async () => {
    const text = JSON.stringify(logs, null, 2)
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(-1)
      setTimeout(() => setCopiedIndex(null), 1500)
    } catch {
      // Clipboard fallback: silent fail
    }
  }

  const phaseStyles: Record<DebugLogEntry['phase'], string> = {
    request: 'text-primary',
    response: 'text-accent',
    error: 'text-red-400',
    info: 'text-text-muted',
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 no-print"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="debug-modal-title"
        className="mx-2 mb-2 sm:mb-0 w-full max-w-lg max-h-[80vh] flex flex-col rounded-xl bg-surface border border-border shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2
            id="debug-modal-title"
            className="text-sm font-semibold text-text"
          >
            Email Debug Log
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void copyAll()}
              className="rounded px-2 py-1 text-xs text-text-muted hover:bg-surface-light transition-colors"
            >
              {copiedIndex === -1 ? 'Copied!' : 'Copy All'}
            </button>
            <button
              type="button"
              onClick={onClear}
              className="rounded px-2 py-1 text-xs text-red-400 hover:bg-red-400/10 transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-text-muted hover:text-text transition-colors"
              aria-label="Close debug modal"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Log entries */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {logs.length === 0 && (
            <p className="text-sm text-text-muted text-center py-8">
              No log entries yet. Submit the form to see debug output here.
            </p>
          )}
          {logs.map((entry, i) => (
            <div
              key={`${entry.timestamp}-${i}`}
              className="rounded-md bg-background/50 border border-border/50 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-mono font-semibold uppercase ${phaseStyles[entry.phase]}`}
                  >
                    {entry.phase}
                  </span>
                  <span className="text-xs text-text-muted font-mono">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => void copyEntry(entry, i)}
                  className="shrink-0 text-xs text-text-muted hover:text-text transition-colors"
                  aria-label="Copy log entry"
                >
                  {copiedIndex === i ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="mt-1 text-sm text-text">{entry.message}</p>
              {entry.data && (
                <pre className="mt-2 overflow-x-auto rounded bg-background p-2 text-xs text-text-muted font-mono">
                  {JSON.stringify(entry.data, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-3">
          <p className="text-xs text-text-muted text-center">
            Debug mode active &mdash; add <code className="text-primary">?debug=true</code> to URL
          </p>
        </div>
      </div>
    </div>
  )
}
