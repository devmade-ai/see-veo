// Requirement: Shared validation logic for the interest form payload
// Approach: Export EMAIL_PATTERN and validatePayload so both the form component
//   and tests use the same code. Previously duplicated in the test file.
// Alternatives considered:
//   - Shared npm package with the API: Rejected — adds coupling between independently
//     deployed projects. This mirrors the API's contract for client-side pre-validation.

export const EMAIL_PATTERN =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

export interface InterestPayload {
  name: string
  email: string
  message: string
}

export function validatePayload(data: unknown): InterestPayload | null {
  if (typeof data !== 'object' || data === null) return null

  const obj = data as Record<string, unknown>
  const { name, email, message } = obj

  if (typeof name !== 'string' || name.trim().length === 0 || name.length > 100) return null
  if (typeof email !== 'string' || email.trim().length === 0 || email.trim().length > 254) return null
  if (typeof message !== 'string' || message.trim().length === 0 || message.length > 2000) return null

  if (!EMAIL_PATTERN.test(email.trim())) return null

  return {
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
  }
}
