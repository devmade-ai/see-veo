import { useState, type FormEvent } from 'react'

// Requirement: Allow visitors to express interest via a one-off email notification
// Approach: Client-side form that POSTs to a serverless API endpoint which sends via SMTP
// Alternatives considered:
//   - Third-party form services (Formspree, Web3Forms): Rejected — user has own SMTP server
//   - mailto: link: Rejected — requires visitor to have email client, not a true notification
//   - Direct SMTP from browser: Rejected — not possible, SMTP requires server-side

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

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    } catch {
      setStatus('error')
      setErrorMessage(
        'Something went wrong while sending your message. Please try again, or reach out directly via email.'
      )
    }
  }

  if (status === 'success') {
    return (
      <div className="mt-8 rounded-lg border border-accent/30 bg-accent/10 p-6 text-center no-print">
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
        <p className="text-sm text-red-400">{errorMessage}</p>
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
