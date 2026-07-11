import { useState, useEffect, useRef, type FormEvent } from 'react'
import { debugLog } from '../utils/debugLog'
import { validatePayload } from '../utils/validation'
import { fetchWithTimeout } from '../utils/fetchWithTimeout'
import { diagnoseFailure } from '../utils/diagnostics'

// Requirement: Let visitors reach out via a real notification (not just a mailto).
// Approach: Client-side form that POSTs to a personal serverless SMTP relay
//   (VITE_INTEREST_API_URL). Restyled to the "The Applicant" paper/ink theme and
//   embedded in the Contact "level", but the submission logic (validation, bot traps,
//   timeout + single retry, failure diagnosis) is unchanged from the previous app.
// Alternatives considered:
//   - Third-party form services (Formspree/Web3Forms): Rejected — user runs own SMTP
//   - Plain mailto: link: Kept as a secondary affordance in CvContact, but a form is a
//     true notification that doesn't depend on the visitor having a mail client

// Requirement: Abort fetch after timeout so users aren't left waiting on dead networks
// Approach: Uses shared fetchWithTimeout utility (src/utils/fetchWithTimeout.ts)

// Requirement: Retry on mobile network failures (TypeError: Failed to fetch)
// Approach: Single retry after 1.5s delay for network-level TypeErrors only

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

// Shared field styling — squared paper inputs with an ink hairline and an amber
// focus ring, matching the document aesthetic of the surrounding CV.
const FIELD_CLASS =
  'w-full border border-[rgba(43,33,24,0.2)] bg-surface px-3.5 py-2.5 font-serif text-[0.95rem] text-text placeholder:text-text-faint focus:border-primary focus:outline-none focus:ring-2 focus:ring-accent/40'
const LABEL_CLASS =
  'mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted'

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
  // Timing-based bot detection — real users take >1s to fill a form
  const [mountTime] = useState(() => Date.now())
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Guard against setState after unmount during async diagnoseFailure
  const mountedRef = useRef(true)
  useEffect(() => () => { mountedRef.current = false }, [])

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

    // Client-side validation before making a network request.
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
      debugLog('InterestForm', 'error', 'api-url-missing', { envVar: 'VITE_INTEREST_API_URL' })
      setStatus('error')
      setErrorMessage(
        'This feature is not available yet. Please reach out via email instead.'
      )
      return
    }

    // Pre-check: avoid doomed requests when the device is clearly offline
    if (!navigator.onLine) {
      debugLog('InterestForm', 'warn', 'offline', { onLine: navigator.onLine })
      setStatus('error')
      setErrorMessage(
        'You appear to be offline. Please check your connection and try again.'
      )
      return
    }

    setStatus('submitting')
    setErrorMessage('')

    // Send _honeypot to the API so bots bypassing frontend JS still get caught server-side.
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

        // Explicit mode: 'cors' for mobile browser compatibility.
        const response = await fetchWithTimeout(apiUrl, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        }, FETCH_TIMEOUT_MS)

        const elapsed = Math.round(performance.now() - startTime)

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

    // Guard: component may have unmounted during the retry loop.
    if (!mountedRef.current) return

    setStatus('error')

    if (!navigator.onLine) {
      setErrorMessage(
        'Your connection dropped while sending. Please check your network and try again.'
      )
    } else {
      const cause = await diagnoseFailure(apiUrl)

      if (!mountedRef.current) return
      debugLog('InterestForm', 'info', 'failure-diagnosis', { cause })

      switch (cause) {
        case 'not-deployed':
          setErrorMessage(
            'This feature is temporarily unavailable — the messaging service is offline. '
            + 'Please reach out directly via email instead.'
          )
          break
        case 'browser-blocked':
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
      <div
        role="status"
        className="border border-success/40 bg-success/10 p-6 text-center"
      >
        <p className="font-serif text-[1.15rem] font-semibold text-success">Message sent!</p>
        <p className="mt-2 text-[0.9rem] text-text-muted">
          Thanks for reaching out &mdash; I&rsquo;ll get back to you soon.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-4 inline-flex min-h-[44px] items-center font-mono text-[11px] uppercase tracking-[0.08em] text-link hover:text-accent"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
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
        <label htmlFor="interest-name" className={LABEL_CLASS}>
          Name
        </label>
        <input
          type="text"
          id="interest-name"
          required
          maxLength={100}
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          className={FIELD_CLASS}
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="interest-email" className={LABEL_CLASS}>
          Email
        </label>
        <input
          type="email"
          id="interest-email"
          required
          maxLength={254}
          value={formData.email}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          className={FIELD_CLASS}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="interest-message" className={LABEL_CLASS}>
          Message
        </label>
        <textarea
          id="interest-message"
          required
          rows={3}
          maxLength={2000}
          value={formData.message}
          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
          className={`${FIELD_CLASS} resize-y`}
          placeholder="Tell me what you're looking for..."
        />
      </div>

      {status === 'error' && (
        <div className="flex items-start justify-between gap-2 border border-error/30 bg-error/10 px-3.5 py-2.5">
          <p role="alert" className="text-[0.9rem] text-error">{errorMessage}</p>
          <button
            type="button"
            onClick={() => {
              if (errorTimerRef.current) { clearTimeout(errorTimerRef.current); errorTimerRef.current = null }
              setStatus('idle'); setErrorMessage('')
            }}
            className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center text-error hover:text-error/70"
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex min-h-[48px] cursor-pointer items-center border border-primary bg-primary px-[22px] font-mono text-[12px] tracking-[0.08em] text-primary-ink shadow-[4px_4px_0_rgba(43,33,24,0.25)] transition-transform hover:bg-primary-light active:translate-x-0.5 active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === 'submitting' ? 'SENDING…' : '→ SEND A MESSAGE'}
      </button>
    </form>
  )
}
