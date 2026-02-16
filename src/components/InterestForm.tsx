import { useState, useEffect, useRef, type FormEvent } from 'react'

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

    // Honeypot check: if filled, silently "succeed" to fool bots
    if (honeypot) {
      setStatus('success')
      return
    }

    const apiUrl = import.meta.env.VITE_INTEREST_API_URL as string | undefined
    if (!apiUrl) {
      setStatus('error')
      setErrorMessage(
        'This feature is not available yet. Please reach out via email instead.'
      )
      return
    }

    setStatus('submitting')
    setErrorMessage('')

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Request failed')
      }

      setStatus('success')
      setFormData({ name: '', email: '', message: '' })
    } catch (err) {
      setStatus('error')
      if (err instanceof Error && err.name === 'AbortError') {
        setErrorMessage(
          'The request took too long. Please check your connection and try again.'
        )
      } else {
        setErrorMessage(
          'Something went wrong while sending your message. Please try again, or reach out directly via email.'
        )
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="mt-8 rounded-lg border border-accent/30 bg-accent/10 p-6 text-center no-print">
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
    )
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4 no-print">
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
  )
}
