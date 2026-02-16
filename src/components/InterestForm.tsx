import { useState, useEffect, useRef, type FormEvent } from 'react'
import EmailDebugButton, { type EmailDebugReport } from './EmailDebugModal'

// Requirement: Allow visitors to express interest via a one-off email notification
// Approach: Client-side form that POSTs to a serverless API endpoint which sends via SMTP
// Alternatives considered:
//   - Third-party form services (Formspree, Web3Forms): Rejected — user has own SMTP server
//   - mailto: link: Rejected — requires visitor to have email client, not a true notification
//   - Direct SMTP from browser: Rejected — not possible, SMTP requires server-side

// Requirement: Abort fetch after timeout so users aren't left waiting on dead networks
// Approach: AbortController with 10s timeout
// Alternatives considered:
//   - No timeout: Rejected — users wait indefinitely on slow/dead networks
//   - Shorter timeout (5s): Rejected — legitimate slow connections would fail unnecessarily

const FETCH_TIMEOUT_MS = 10_000
const ERROR_AUTO_DISMISS_MS = 8_000

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

interface FormData {
  name: string
  email: string
  message: string
}

/** Check if debug mode is active via URL parameter */
function isDebugMode(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('debug') === 'true'
  } catch {
    return false
  }
}

export default function InterestForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  })
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  // Honeypot field — bots fill this in, real users never see it
  const [honeypot, setHoneypot] = useState('')
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debug state — only active when ?debug=true is in URL
  const [debugEnabled] = useState(() => isDebugMode())
  const [debugReport, setDebugReport] = useState<EmailDebugReport | null>(null)

  // Auto-dismiss error messages after a delay
  useEffect(() => {
    if (status === 'error') {
      errorTimerRef.current = setTimeout(() => {
        setStatus('idle')
        setErrorMessage('')
      }, ERROR_AUTO_DISMISS_MS)
    }
    return () => {
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current)
        errorTimerRef.current = null
      }
    }
  }, [status])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Start building the debug report (only stored if debug is enabled)
    const report: EmailDebugReport = {
      timestamp: new Date().toISOString(),
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      apiUrl: '',
      request: null,
      response: null,
      error: null,
      outcome: 'success',
    }

    // Honeypot check: if filled, silently "succeed" to fool bots
    if (honeypot) {
      report.outcome = 'bot-detected'
      if (debugEnabled) setDebugReport(report)
      setStatus('success')
      return
    }

    const apiUrl = import.meta.env.VITE_INTEREST_API_URL as string | undefined
    report.apiUrl = apiUrl ?? 'NOT CONFIGURED'

    if (!apiUrl) {
      report.outcome = 'no-api-url'
      report.error = {
        type: 'ConfigError',
        message: 'VITE_INTEREST_API_URL environment variable is not set',
      }
      if (debugEnabled) setDebugReport(report)
      setStatus('error')
      setErrorMessage(
        'This feature is not available yet. Please reach out via email instead.'
      )
      return
    }

    setStatus('submitting')
    setErrorMessage('')

    const requestBody = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      message: formData.message.trim(),
    }

    report.request = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      fieldSummary: {
        name: requestBody.name.length > 0 ? `${requestBody.name.length} chars` : 'empty',
        email: requestBody.email.length > 0 ? `${requestBody.email.length} chars` : 'empty',
        message: requestBody.message.length > 0 ? `${requestBody.message.length} chars` : 'empty',
      },
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    const startTime = performance.now()

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(requestBody),
      })

      const elapsed = Math.round(performance.now() - startTime)

      // Read response body for debug report
      let responseBody: unknown = null
      try {
        responseBody = await response.clone().json()
      } catch {
        try {
          responseBody = await response.clone().text()
        } catch {
          responseBody = '(could not read body)'
        }
      }

      report.response = {
        status: response.status,
        statusText: response.statusText,
        elapsedMs: elapsed,
        body: responseBody,
      }

      if (!response.ok) {
        report.outcome = 'error'
        report.error = {
          type: `HTTP ${response.status}`,
          message: response.statusText,
          elapsedMs: elapsed,
        }
        throw new Error('Request failed')
      }

      report.outcome = 'success'
      setStatus('success')
      setFormData({ name: '', email: '', message: '' })
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime)
      setStatus('error')

      if (err instanceof Error && err.name === 'AbortError') {
        report.outcome = 'error'
        report.error = {
          type: 'Timeout',
          message: `Request aborted after ${FETCH_TIMEOUT_MS}ms`,
          elapsedMs: elapsed,
        }
        setErrorMessage(
          'The request took too long. Please check your connection and try again.'
        )
      } else if (!report.error) {
        // Only set if not already set by the !response.ok branch
        report.outcome = 'error'
        report.error = {
          type: err instanceof Error ? err.name : 'Unknown',
          message: err instanceof Error ? err.message : String(err),
          elapsedMs: elapsed,
        }
        setErrorMessage(
          'Something went wrong while sending your message. Please try again, or reach out directly via email.'
        )
      }
    } finally {
      clearTimeout(timeoutId)
      if (debugEnabled) setDebugReport(report)
    }
  }

  if (status === 'success') {
    return (
      <div className="mt-8 no-print">
        <div role="status" className="rounded-lg border border-accent/30 bg-accent/10 p-6 text-center">
          <p className="text-lg font-medium text-accent">Message sent!</p>
          <p className="mt-2 text-sm text-text-muted">
            Thanks for reaching out. I'll get back to you soon.
          </p>
          <button
            type="button"
            onClick={() => setStatus('idle')}
            className="mt-4 text-sm text-primary hover:text-primary-light"
          >
            Send another message
          </button>
        </div>

        {debugEnabled && <EmailDebugButton report={debugReport} />}
      </div>
    )
  }

  return (
    <div className="mt-8 no-print">
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <p className="text-sm text-text-muted">
          Interested in working together? Drop me a message.
        </p>

        {/* Honeypot field — hidden from real users, catches automated spam */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div>
          <label
            htmlFor="interest-name"
            className="mb-1 block text-sm font-medium text-text-muted"
          >
            Name
          </label>
          <input
            type="text"
            id="interest-name"
            required
            maxLength={100}
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Your name"
          />
        </div>

        <div>
          <label
            htmlFor="interest-email"
            className="mb-1 block text-sm font-medium text-text-muted"
          >
            Email
          </label>
          <input
            type="email"
            id="interest-email"
            required
            maxLength={254}
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="interest-message"
            className="mb-1 block text-sm font-medium text-text-muted"
          >
            Message{' '}
            <span className="text-text-muted/50">(optional)</span>
          </label>
          <textarea
            id="interest-message"
            rows={3}
            maxLength={2000}
            value={formData.message}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, message: e.target.value }))
            }
            className="w-full resize-y rounded-md border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Tell me what you're looking for..."
          />
        </div>

        {status === 'error' && (
          <div className="flex items-start justify-between gap-2 rounded-md bg-red-400/10 px-3 py-2">
            <p role="alert" className="text-sm text-red-400">{errorMessage}</p>
            <button
              type="button"
              onClick={() => { setStatus('idle'); setErrorMessage('') }}
              className="shrink-0 text-red-400 hover:text-red-300"
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === 'submitting' ? 'Sending...' : 'Send Message'}
        </button>
      </form>

      {debugEnabled && <EmailDebugButton report={debugReport} />}
    </div>
  )
}
