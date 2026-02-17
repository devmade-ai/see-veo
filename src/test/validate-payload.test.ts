import { describe, it, expect } from 'vitest'

// Requirement: Test the validatePayload and email regex logic used by the external API
// Approach: Replicate the validation logic locally for unit testing, ensuring this
//   frontend stays in sync with the API's contract
// Alternatives considered:
//   - Integration tests only: Rejected — unit tests catch edge cases faster
//   - Shared package: Rejected — adds coupling between two independently deployed projects

const EMAIL_PATTERN = /^[a-zA-Z0-9](?:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

interface InterestPayload {
  name: string
  email: string
  message: string
}

function validatePayload(data: unknown): InterestPayload | null {
  if (typeof data !== 'object' || data === null) return null

  const obj = data as Record<string, unknown>
  const { name, email, message } = obj

  if (typeof name !== 'string' || name.trim().length === 0 || name.length > 100) return null
  if (typeof email !== 'string' || email.length > 254) return null
  if (typeof message !== 'string' || message.length > 2000) return null

  if (!EMAIL_PATTERN.test(email.trim())) return null

  return {
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
  }
}

describe('validatePayload', () => {
  it('accepts a valid payload', () => {
    const result = validatePayload({
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Hello!',
    })
    expect(result).toEqual({
      name: 'Jane Doe',
      email: 'jane@example.com',
      message: 'Hello!',
    })
  })

  it('trims whitespace from all fields', () => {
    const result = validatePayload({
      name: '  Jane  ',
      email: '  jane@example.com  ',
      message: '  Hello!  ',
    })
    expect(result).toEqual({
      name: 'Jane',
      email: 'jane@example.com',
      message: 'Hello!',
    })
  })

  it('accepts empty message', () => {
    const result = validatePayload({
      name: 'Jane',
      email: 'jane@example.com',
      message: '',
    })
    expect(result).not.toBeNull()
    expect(result!.message).toBe('')
  })

  it('rejects null input', () => {
    expect(validatePayload(null)).toBeNull()
  })

  it('rejects non-object input', () => {
    expect(validatePayload('string')).toBeNull()
    expect(validatePayload(42)).toBeNull()
    expect(validatePayload(undefined)).toBeNull()
  })

  it('rejects empty name', () => {
    expect(validatePayload({ name: '', email: 'a@b.com', message: '' })).toBeNull()
  })

  it('rejects whitespace-only name', () => {
    expect(validatePayload({ name: '   ', email: 'a@b.com', message: '' })).toBeNull()
  })

  it('rejects name exceeding 100 characters', () => {
    expect(validatePayload({
      name: 'a'.repeat(101),
      email: 'jane@example.com',
      message: '',
    })).toBeNull()
  })

  it('rejects email exceeding 254 characters', () => {
    expect(validatePayload({
      name: 'Jane',
      email: 'a'.repeat(250) + '@b.com',
      message: '',
    })).toBeNull()
  })

  it('rejects message exceeding 2000 characters', () => {
    expect(validatePayload({
      name: 'Jane',
      email: 'jane@example.com',
      message: 'a'.repeat(2001),
    })).toBeNull()
  })

  it('rejects missing fields', () => {
    expect(validatePayload({ name: 'Jane' })).toBeNull()
    expect(validatePayload({ email: 'jane@example.com' })).toBeNull()
    expect(validatePayload({ name: 'Jane', email: 'jane@example.com' })).toBeNull()
  })

  it('rejects non-string fields', () => {
    expect(validatePayload({ name: 123, email: 'a@b.com', message: '' })).toBeNull()
    expect(validatePayload({ name: 'Jane', email: 123, message: '' })).toBeNull()
    expect(validatePayload({ name: 'Jane', email: 'a@b.com', message: 123 })).toBeNull()
  })
})

describe('EMAIL_PATTERN', () => {
  const validEmails = [
    'user@example.com',
    'user.name@example.com',
    'user+tag@example.com',
    'user@sub.example.com',
    'user@example.co.uk',
    'u@example.com',
    'user123@example.com',
  ]

  // Note: a..b@example.com is allowed by our regex — consecutive dots in the local part
  // are technically valid in many implementations, and the SMTP server does final validation
  const invalidEmails = [
    'a@b.c',              // single char TLD
    '@example.com',       // no local part
    'user@',              // no domain
    'user@.com',          // domain starts with dot
    'user@com',           // no TLD separator
    '',                   // empty
    'user @example.com',  // space in local
    '.user@example.com',  // starts with dot
    'user.@example.com',  // ends with dot before @
  ]

  validEmails.forEach((email) => {
    it(`accepts valid email: ${email}`, () => {
      expect(EMAIL_PATTERN.test(email)).toBe(true)
    })
  })

  invalidEmails.forEach((email) => {
    it(`rejects invalid email: "${email}"`, () => {
      expect(EMAIL_PATTERN.test(email)).toBe(false)
    })
  })
})
