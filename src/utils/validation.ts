// Requirement: Shared validation logic for the interest form payload
// Approach: Export EMAIL_PATTERN and validatePayload so both the form component
//   and tests use the same code. Previously duplicated in the test file.
// Alternatives considered:
//   - Shared npm package with the API: Rejected — adds coupling between independently
//     deployed projects. This mirrors the API's contract for client-side pre-validation.

export const EMAIL_PATTERN =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

// Field limits, mirroring the API's lib/constants.ts. Exported so the form's
// maxLength attributes, this validator, and the saved draft all clamp to the
// same numbers instead of keeping three copies that can drift apart.
export const MAX_NAME_LENGTH = 100
export const MAX_EMAIL_LENGTH = 254
export const MAX_MESSAGE_LENGTH = 2000

export interface InterestPayload {
  name: string
  email: string
  message: string
}

export function validatePayload(data: unknown): InterestPayload | null {
  if (typeof data !== 'object' || data === null) return null

  const obj = data as Record<string, unknown>
  const { name, email, message } = obj

  if (typeof name !== 'string' || name.trim().length === 0 || name.length > MAX_NAME_LENGTH) return null
  if (typeof email !== 'string' || email.trim().length === 0 || email.trim().length > MAX_EMAIL_LENGTH) return null
  if (typeof message !== 'string' || message.trim().length === 0 || message.length > MAX_MESSAGE_LENGTH) return null

  if (!EMAIL_PATTERN.test(email.trim())) return null

  return {
    name: name.trim(),
    email: email.trim(),
    message: message.trim(),
  }
}
