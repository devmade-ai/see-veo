// Requirement: One-tap copy of email debug report for pasting into another session
// Approach: Inline button that copies a pre-formatted plain-text diagnostic report
//   to clipboard. No modal, no scrolling — just tap and paste.
// Alternatives considered:
//   - Scrollable modal with per-entry copy buttons: Rejected — too many steps on mobile,
//     user just needs one copyable block to hand off to another session
//   - Console-only logging: Rejected — not accessible on mobile without remote debugging

import { useState } from 'react'

/** Complete diagnostic report for a single email send attempt */
export interface EmailDebugReport {
  /** When the submission started */
  timestamp: string
  /** The page URL (includes ?debug=true) */
  pageUrl: string
  /** Browser user-agent string */
  userAgent: string
  /** The API endpoint URL, or 'NOT CONFIGURED' */
  apiUrl: string
  /** Request details */
  request: {
    method: string
    headers: Record<string, string>
    /** Field names and character counts — never actual content */
    fieldSummary: Record<string, string>
  } | null
  /** Response details (null if request never completed) */
  response: {
    status: number
    statusText: string
    elapsedMs: number
    body: unknown
  } | null
  /** Error details (null if no error) */
  error: {
    type: string
    message: string
    elapsedMs?: number
  } | null
  /** Final form status */
  outcome: 'success' | 'error' | 'bot-detected' | 'no-api-url'
}

/** Format a report as plain text that another session can read and act on */
function formatReport(report: EmailDebugReport): string {
  const lines: string[] = [
    '## Email Send Debug Report',
    '',
    `Generated: ${report.timestamp}`,
    `Outcome: ${report.outcome}`,
    '',
    '### Environment',
    `- Page URL: ${report.pageUrl}`,
    `- User Agent: ${report.userAgent}`,
    `- API Endpoint: ${report.apiUrl}`,
  ]

  if (report.request) {
    lines.push(
      '',
      '### Request',
      `- Method: ${report.request.method}`,
      `- Headers: ${JSON.stringify(report.request.headers)}`,
      '- Fields:',
    )
    for (const [key, val] of Object.entries(report.request.fieldSummary)) {
      lines.push(`  - ${key}: ${val}`)
    }
  }

  if (report.response) {
    lines.push(
      '',
      '### Response',
      `- Status: ${report.response.status} ${report.response.statusText}`,
      `- Elapsed: ${report.response.elapsedMs}ms`,
      `- Body: ${typeof report.response.body === 'string' ? report.response.body : JSON.stringify(report.response.body, null, 2)}`,
    )
  }

  if (report.error) {
    lines.push(
      '',
      '### Error',
      `- Type: ${report.error.type}`,
      `- Message: ${report.error.message}`,
    )
    if (report.error.elapsedMs !== undefined) {
      lines.push(`- Elapsed: ${report.error.elapsedMs}ms`)
    }
  }

  return lines.join('\n')
}

interface EmailDebugButtonProps {
  report: EmailDebugReport | null
}

export default function EmailDebugButton({ report }: EmailDebugButtonProps) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  if (!report) {
    return (
      <p className="mt-3 text-center text-xs text-text-muted font-mono">
        Debug mode active — submit the form to capture a report
      </p>
    )
  }

  const handleCopy = async () => {
    const text = formatReport(report)
    try {
      await navigator.clipboard.writeText(text)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      // Clipboard API can fail on some mobile browsers — show the report
      // in a textarea as fallback so user can manually select and copy
      setCopyState('failed')
    }
  }

  if (copyState === 'failed') {
    return (
      <div className="mt-3 space-y-2">
        <p className="text-xs text-text-muted">
          Could not copy automatically. Select all the text below and copy it manually.
        </p>
        <textarea
          readOnly
          rows={12}
          value={formatReport(report)}
          onFocus={(e) => e.target.select()}
          className="w-full rounded-md border border-border bg-background p-2 text-xs font-mono text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="button"
          onClick={() => setCopyState('idle')}
          className="text-xs text-primary hover:text-primary-light"
        >
          Hide
        </button>
      </div>
    )
  }

  const isError = report.outcome === 'error' || report.outcome === 'no-api-url'

  return (
    <button
      type="button"
      onClick={() => void handleCopy()}
      className={`mt-3 w-full rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
        copyState === 'copied'
          ? 'border-accent/30 bg-accent/10 text-accent'
          : isError
            ? 'border-red-400/30 bg-red-400/10 text-red-400 hover:bg-red-400/20'
            : 'border-border bg-surface-light text-text-muted hover:bg-border'
      }`}
    >
      {copyState === 'copied'
        ? 'Copied! Paste into another session to diagnose.'
        : 'Copy Debug Report'}
    </button>
  )
}
