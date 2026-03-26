import { useState, useEffect, useRef, type FormEvent } from 'react'
import { debugLog } from '../utils/debugLog'
import { validatePayload } from '../utils/validation'
import { fetchWithTimeout } from '../utils/fetchWithTimeout'
import { diagnoseFailure } from '../utils/diagnostics'

// Requirement: Allow visitors to express interest via a one-off email notification
// Approach: Client-side form that POSTs to a serverless API endpoint which sends via SMTP
// Alternatives considered:
//   - Third-party form services (Formspree, Web3Forms): Rejected — user has own SMTP server
//   - mailto: link: Rejected — requires visitor to have email client, not a true notification
//   - Direct SMTP from browser: Rejected — not possible, SMTP requires server-side

// Requirement: Abort fetch after timeout so users aren't left waiting on dead networks
// Approach: Uses shared fetchWithTimeout utility (src/utils/fetchWithTimeout.ts)
// Alternatives considered:
//   - No timeout: Rejected — users wait indefinitely on slow/dead networks
//   - Shorter timeout (5s): Rejected — legitimate slow connections would fail unnecessarily

// Requirement: Retry on mobile network failures (TypeError: Failed to fetch)
// Approach: Single retry after 1.5s delay for network-level TypeErrors only
// Alternatives considered:
//   - No retry: Rejected — mobile networks are flaky, transient failures are common
//   - Multiple retries (3+): Rejected — compounds wait time, persistent failures won't self-resolve
//   - Immediate retry: Rejected — no back-off risks hitting same transient issue

const FETCH_TIMEOUT_MS = 10_000
const RETRY_DELAY_MS = 1_500
const MAX_ATTEMPTS = 2
const ERROR_AUTO_DISMISS_MS = 8_000

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

interface InterestFormData {
  name: string
  email: string
  message: string
}

export default function InterestForm() {
  const [formData, setFormData] = useState<InterestFormData>({
    name: '',
    email: '',
    message: '',
  })
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  // Honeypot field — bots fill this in, real users never see it
  const [honeypot, setHoneypot] = useState('')
  // Requirement: Timing-based bot detection — real users take >1s to fill a form
  // Approach: Record mount time, reject submissions faster than 1 second
  // Alternatives considered:
  //   - reCAPTCHA: Rejected — adds third-party dependency and privacy concern
  //   - Honeypot only: Insufficient — sophisticated bots detect common honeypot patterns
  const [mountTime] = useState(() => Date.now())
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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

    // Bot detection: honeypot field + timing check.
    // Silently "succeed" to avoid revealing detection to bots.
    const BOT_MIN_TIME_MS = 1_000
    if (honeypot || Date.now() - mountTime < BOT_MIN_TIME_MS) {
      debugLog('InterestForm', 'info', honeypot ? 'honeypot-triggered' : 'timing-bot-detected')
      setStatus('success')
      return
    }

    // Client-side validation using the shared validatePayload utility.
    // Catches invalid input before making a network request, providing
    // faster feedback and reducing unnecessary API calls.
    const validated = validatePayload(formData)
    if (!validated) {
      debugLog('InterestForm', 'warn', 'validation-failed', {
        name: formData.name.length,
        email: formData.email.length,
        message: formData.message.length,
      })
      setStatus('error')
      setErrorMessage(
        'Please check your details. Make sure your name, email, and message are filled in correctly.'
      )
      return
    }

    const apiUrl = import.meta.env.VITE_INTEREST_API_URL as string | undefined

    if (!apiUrl) {
      debugLog('InterestForm', 'error', 'api-url-missing', {
        envVar: 'VITE_INTEREST_API_URL',
      })
      setStatus('error')
      setErrorMessage(
        'This feature is not available yet. Please reach out via email instead.'
      )
      return
    }

    // Pre-check: avoid doomed requests when the device is clearly offline
    if (!navigator.onLine) {
      debugLog('InterestForm', 'warn', 'offline', {
        onLine: navigator.onLine,
      })
      setStatus('error')
      setErrorMessage(
        'You appear to be offline. Please check your connection and try again.'
      )
      return
    }

    setStatus('submitting')
    setErrorMessage('')

    // Requirement: Send _honeypot field to the API for server-side spam rejection
    // Approach: Always include _honeypot in the request body (empty string for real users).
    //   Client-side check above short-circuits bots that fill it, but sending the field
    //   means bots bypassing frontend JS still get caught by the server (400 response).
    // Alternatives considered:
    //   - Client-side check only: Rejected — bots can bypass JS, server needs the field
    const requestBody = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      message: formData.message.trim(),
      _honeypot: '',
    }

    debugLog('InterestForm', 'info', 'submit', {
      name: `${requestBody.name.length} chars`,
      email: `${requestBody.email.length} chars`,
      message: requestBody.message.length > 0 ? `${requestBody.message.length} chars` : 'empty',
    })

    const startTime = performance.now()

    // Attempt fetch with retry for transient mobile network failures.
    // Only network-level TypeErrors are retried; HTTP errors and aborts are not.
    let lastError: unknown = null

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        debugLog('InterestForm', 'info', 'request', {
          method: 'POST',
          url: apiUrl,
          headers: { 'Content-Type': 'application/json' },
          attempt,
          maxAttempts: MAX_ATTEMPTS,
        })

        // Requirement: Explicit mode: 'cors' for mobile browser compatibility
        // Approach: Set mode explicitly even though 'cors' is the default
        // Alternatives considered:
        //   - Rely on default: Rejected — some mobile browser versions handle
        //     implicit vs explicit CORS mode differently
        const response = await fetchWithTimeout(apiUrl, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }, FETCH_TIMEOUT_MS)

        const elapsed = Math.round(performance.now() - startTime)

        // Read response body for debug logging
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

        if (!response.ok) {
          debugLog('InterestForm', 'error', 'response-error', {
            status: response.status,
            statusText: response.statusText,
            elapsedMs: elapsed,
            body: responseBody,
            attempt,
          })
          // HTTP errors are not retryable — server received the request
          setStatus('error')
          setErrorMessage(
            'Something went wrong while sending your message. Please try again, or reach out directly via email.'
          )
          return
        }

        debugLog('InterestForm', 'success', 'response-ok', {
          status: response.status,
          elapsedMs: elapsed,
          body: responseBody,
          attempt,
        })

        setStatus('success')
        setFormData({ name: '', email: '', message: '' })
        return
      } catch (err) {
        lastError = err

        // AbortError means timeout — don't retry, report immediately
        if (err instanceof Error && err.name === 'AbortError') {
          const elapsed = Math.round(performance.now() - startTime)
          debugLog('InterestForm', 'error', 'timeout', {
            elapsedMs: elapsed,
            timeoutMs: FETCH_TIMEOUT_MS,
            attempt,
          })
          setStatus('error')
          setErrorMessage(
            'The request took too long. Please check your connection and try again.'
          )
          return
        }

        // Network-level failure (TypeError: Failed to fetch) — may be transient on mobile
        const elapsed = Math.round(performance.now() - startTime)
        debugLog('InterestForm', 'warn', 'fetch-failed-attempt', {
          elapsedMs: elapsed,
          attempt,
          maxAttempts: MAX_ATTEMPTS,
          willRetry: attempt < MAX_ATTEMPTS,
          error: err instanceof Error
            ? { name: err.name, message: err.message }
            : { raw: String(err) },
        })

        // Wait before retrying (only if there are attempts left)
        if (attempt < MAX_ATTEMPTS) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS))
        }
      }
    }

    // All attempts exhausted — report the final error
    const elapsed = Math.round(performance.now() - startTime)
    debugLog('InterestForm', 'error', 'all-attempts-failed', {
      elapsedMs: elapsed,
      attempts: MAX_ATTEMPTS,
      lastError: lastError instanceof Error
        ? { name: lastError.name, message: lastError.message }
        : { raw: String(lastError) },
    })

    setStatus('error')

    // Provide a specific message depending on failure cause.
    // On mobile Chrome, CORS preflight failures, 404s without CORS headers, and genuine
    // network errors all throw the same "TypeError: Failed to fetch", so we probe the
    // health endpoint to diagnose the actual cause.
    if (!navigator.onLine) {
      // Device went offline during attempts
      setErrorMessage(
        'Your connection dropped while sending. Please check your network and try again.'
      )
    } else {
      const cause = await diagnoseFailure(apiUrl)

      debugLog('InterestForm', 'info', 'failure-diagnosis', { cause })

      switch (cause) {
        case 'not-deployed':
          setErrorMessage(
            'This feature is temporarily unavailable — the messaging service is offline. '
            + 'Please reach out directly via email instead.'
          )
          break
        case 'browser-blocked':
          // Requirement: Actionable message for privacy-focused browser users
          // Approach: Suggest disabling shields/tracker blocking for this site,
          //   with a fallback to email. Non-technical language per UX rules.
          setErrorMessage(
            'Your browser\'s privacy settings may be blocking this form. '
            + 'Try disabling ad/tracker blocking for this site, or reach out directly via email instead.'
          )
          break
        case 'cors':
          setErrorMessage(
            'The server received your request but a security setting is blocking the response. '
            + 'This is a configuration issue — please try again later or reach out directly via email.'
          )
          break
        case 'network':
          setErrorMessage(
            'Could not reach the server. This may be a temporary network issue — please try again in a moment, or reach out directly via email.'
          )
          break
      }
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="mb-16 rounded-lg border border-accent/30 bg-accent/10 p-6 text-center no-print">
        <p className="text-lg font-medium text-accent">Message sent!</p>
        <p className="mt-2 text-sm text-text-muted">
          Thanks for reaching out. I'll get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 inline-flex min-h-[44px] items-center text-sm text-primary hover:text-primary-light"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="mb-16 space-y-4 no-print">
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
          className="min-h-[44px] w-full rounded-md border border-border bg-surface px-3 py-2.5 text-text placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
          className="min-h-[44px] w-full rounded-md border border-border bg-surface px-3 py-2.5 text-text placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="interest-message"
          className="mb-1 block text-sm font-medium text-text-muted"
        >
          Message
        </label>
        <textarea
          id="interest-message"
          required
          rows={3}
          maxLength={2000}
          value={formData.message}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, message: e.target.value }))
          }
          className="w-full resize-y rounded-md border border-border bg-surface px-3 py-2.5 text-text placeholder:text-text-muted/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder="Tell me what you're looking for..."
        />
      </div>

      {status === 'error' && (
        <div className="flex items-start justify-between gap-2 rounded-md bg-red-400/10 px-3 py-2.5">
          <p role="alert" className="text-sm text-red-400">{errorMessage}</p>
          <button
            type="button"
            onClick={() => {
              if (errorTimerRef.current) { clearTimeout(errorTimerRef.current); errorTimerRef.current = null }
              setStatus('idle'); setErrorMessage('')
            }}
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center text-red-400 hover:text-red-300"
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex min-h-[44px] items-center rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'submitting' ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  )
}
