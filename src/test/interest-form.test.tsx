// Requirement: Interaction tests for InterestForm — submit, validation, error states
// Approach: Testing Library with userEvent for realistic form interactions, vi.fn() for
//   fetch mocking, and import.meta.env stubbing for API URL control
// Alternatives considered:
//   - MSW (Mock Service Worker): Rejected — adds a dependency for a single form endpoint;
//     vi.fn() on global fetch is sufficient and keeps tests lightweight
//   - Cypress/Playwright: Rejected — E2E overkill for unit-level form behavior

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InterestForm from '../components/InterestForm'

// Store original env and fetch so we can restore after each test
const originalFetch = globalThis.fetch

beforeEach(() => {
  // Default: API URL is configured
  vi.stubEnv('VITE_INTEREST_API_URL', 'https://api.example.com/interest')
  // Default: browser is online
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true)
  // Bypass timing-based bot detection: component records Date.now() at mount,
  // then checks elapsed time on submit. Mock returns mount=0, submit=10s later.
  let callCount = 0
  vi.spyOn(Date, 'now').mockImplementation(() => (callCount++ === 0 ? 0 : 10_000))
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  globalThis.fetch = originalFetch
})

async function fillForm(user: ReturnType<typeof userEvent.setup>, overrides?: { name?: string; email?: string; message?: string }) {
  const name = overrides?.name ?? 'Jane Doe'
  const email = overrides?.email ?? 'jane@example.com'
  const message = overrides?.message ?? 'Hello there!'

  // userEvent.type throws on empty strings, so skip empty fields
  if (name) await user.type(screen.getByLabelText('Name'), name)
  if (email) await user.type(screen.getByLabelText('Email'), email)
  if (message) await user.type(screen.getByLabelText('Message'), message)
}

describe('InterestForm', () => {
  describe('rendering', () => {
    it('renders the form with name, email, and message fields', () => {
      render(<InterestForm />)
      expect(screen.getByLabelText('Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Email')).toBeInTheDocument()
      expect(screen.getByLabelText('Message')).toBeInTheDocument()
    })

    it('renders the submit button', () => {
      render(<InterestForm />)
      expect(screen.getByRole('button', { name: 'Send Message' })).toBeInTheDocument()
    })

    it('renders the introductory text', () => {
      render(<InterestForm />)
      expect(screen.getByText(/Interested in working together/)).toBeInTheDocument()
    })

    it('renders honeypot field hidden from view', () => {
      const { container } = render(<InterestForm />)
      const honeypotWrapper = container.querySelector('[aria-hidden="true"]')
      expect(honeypotWrapper).toBeInTheDocument()
      expect(honeypotWrapper).toHaveClass('absolute')
    })
  })

  describe('validation', () => {
    // HTML5 required/type="email" constraints block submit via userEvent.click.
    // Use fireEvent.submit to bypass browser validation and test validatePayload
    // logic directly. Whitespace-only values pass HTML required but fail
    // validatePayload's trim check.

    it('shows error when name is whitespace-only', async () => {
      const user = userEvent.setup()
      render(<InterestForm />)
      await user.type(screen.getByLabelText('Name'), '   ')
      await user.type(screen.getByLabelText('Email'), 'test@example.com')
      await user.type(screen.getByLabelText('Message'), 'Hi')
      fireEvent.submit(screen.getByRole('button', { name: 'Send Message' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
      expect(screen.getByRole('alert')).toHaveTextContent(/check your details/i)
    })

    it('shows error for invalid email format', async () => {
      const user = userEvent.setup()
      render(<InterestForm />)
      await user.type(screen.getByLabelText('Name'), 'Jane')
      await user.type(screen.getByLabelText('Email'), 'not-an-email')
      await user.type(screen.getByLabelText('Message'), 'Hi')
      // fireEvent.submit bypasses HTML5 type="email" validation
      fireEvent.submit(screen.getByRole('button', { name: 'Send Message' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
      expect(screen.getByRole('alert')).toHaveTextContent(/check your details/i)
    })

    it('shows error when message is whitespace-only', async () => {
      const user = userEvent.setup()
      render(<InterestForm />)
      await user.type(screen.getByLabelText('Name'), 'Jane')
      await user.type(screen.getByLabelText('Email'), 'jane@example.com')
      await user.type(screen.getByLabelText('Message'), '   ')
      fireEvent.submit(screen.getByRole('button', { name: 'Send Message' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
      expect(screen.getByRole('alert')).toHaveTextContent(/check your details/i)
    })
  })

  describe('submission', () => {
    it('shows success state after successful submission', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        clone: () => ({ json: () => Promise.resolve({ success: true }) }),
      })

      const user = userEvent.setup()
      render(<InterestForm />)
      await fillForm(user)
      await user.click(screen.getByRole('button', { name: 'Send Message' }))

      await waitFor(() => {
        expect(screen.getByText('Message sent!')).toBeInTheDocument()
      })
    })

    it('sends correct request body', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        clone: () => ({ json: () => Promise.resolve({ success: true }) }),
      })
      globalThis.fetch = mockFetch

      const user = userEvent.setup()
      render(<InterestForm />)
      await fillForm(user)
      await user.click(screen.getByRole('button', { name: 'Send Message' }))

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled()
      })

      const [url, options] = mockFetch.mock.calls[0]
      expect(url).toBe('https://api.example.com/interest')
      expect(options.method).toBe('POST')
      expect(options.headers).toEqual({ 'Content-Type': 'application/json' })

      const body = JSON.parse(options.body)
      expect(body.name).toBe('Jane Doe')
      expect(body.email).toBe('jane@example.com')
      expect(body.message).toBe('Hello there!')
      expect(body._honeypot).toBe('')
    })

    it('shows submitting state while request is in flight', async () => {
      // Never-resolving fetch to keep the form in submitting state
      globalThis.fetch = vi.fn().mockReturnValue(new Promise(() => {}))

      const user = userEvent.setup()
      render(<InterestForm />)
      await fillForm(user)
      await user.click(screen.getByRole('button', { name: 'Send Message' }))

      await waitFor(() => {
        expect(screen.getByText('Sending...')).toBeInTheDocument()
      })
      expect(screen.getByRole('button', { name: 'Sending...' })).toBeDisabled()
    })

    it('shows error on HTTP error response', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        clone: () => ({
          json: () => Promise.reject(new Error('no json')),
          text: () => Promise.resolve('Server error'),
        }),
      })

      const user = userEvent.setup()
      render(<InterestForm />)
      await fillForm(user)
      await user.click(screen.getByRole('button', { name: 'Send Message' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
      expect(screen.getByRole('alert')).toHaveTextContent(/Something went wrong/)
    })

    it('allows sending another message after success', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        clone: () => ({ json: () => Promise.resolve({ success: true }) }),
      })

      const user = userEvent.setup()
      render(<InterestForm />)
      await fillForm(user)
      await user.click(screen.getByRole('button', { name: 'Send Message' }))

      await waitFor(() => {
        expect(screen.getByText('Message sent!')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Send another message'))
      expect(screen.getByLabelText('Name')).toBeInTheDocument()
    })
  })

  describe('honeypot', () => {
    it('silently succeeds when honeypot is filled (bot detection)', async () => {
      const mockFetch = vi.fn()
      globalThis.fetch = mockFetch

      const user = userEvent.setup()
      render(<InterestForm />)
      await fillForm(user)

      // Fill the honeypot field (hidden from real users)
      const honeypotInput = screen.getByLabelText('Website')
      await user.type(honeypotInput, 'spam-bot-url')

      await user.click(screen.getByRole('button', { name: 'Send Message' }))

      await waitFor(() => {
        expect(screen.getByText('Message sent!')).toBeInTheDocument()
      })
      // No fetch should have been made
      expect(mockFetch).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('shows error when API URL is not configured', async () => {
      vi.stubEnv('VITE_INTEREST_API_URL', '')

      const user = userEvent.setup()
      render(<InterestForm />)
      await fillForm(user)
      await user.click(screen.getByRole('button', { name: 'Send Message' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
      expect(screen.getByRole('alert')).toHaveTextContent(/not available yet/)
    })

    it('shows error when device is offline', async () => {
      vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false)

      const user = userEvent.setup()
      render(<InterestForm />)
      await fillForm(user)
      await user.click(screen.getByRole('button', { name: 'Send Message' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
      expect(screen.getByRole('alert')).toHaveTextContent(/offline/)
    })

    it('dismisses error when dismiss button is clicked', async () => {
      vi.stubEnv('VITE_INTEREST_API_URL', '')

      const user = userEvent.setup()
      render(<InterestForm />)
      await fillForm(user)
      await user.click(screen.getByRole('button', { name: 'Send Message' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })

      await user.click(screen.getByLabelText('Dismiss error'))
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('shows timeout error when fetch is aborted', async () => {
      globalThis.fetch = vi.fn().mockRejectedValue(
        Object.assign(new Error('The operation was aborted'), { name: 'AbortError' })
      )

      const user = userEvent.setup()
      render(<InterestForm />)
      await fillForm(user)
      await user.click(screen.getByRole('button', { name: 'Send Message' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
      expect(screen.getByRole('alert')).toHaveTextContent(/took too long/)
    })
  })
})
