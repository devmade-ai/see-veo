// Requirement: Test the validatePayload and email regex logic used by the external API
// Approach: Import and test the real functions from utils/validation
// Alternatives considered:
//   - Local copy of functions: Rejected — tests a copy, not the real code
//   - Integration tests only: Rejected — unit tests catch edge cases faster
//   - Shared package: Rejected — adds coupling between two independently deployed projects

import { describe, it, expect } from 'vitest'
import { validatePayload, EMAIL_PATTERN } from '../utils/validation'

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

  it('rejects empty message', () => {
    expect(validatePayload({
      name: 'Jane',
      email: 'jane@example.com',
      message: '',
    })).toBeNull()
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
