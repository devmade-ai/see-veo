// Requirement: A half-written message must survive leaving the Contact level. Only the
//   active section is mounted (see LivingCv), so walking to another flag — or pressing an
//   arrow key with the page focused — unmounted InterestForm and silently discarded
//   everything the visitor had typed.
// Approach: Mirror the in-progress fields into sessionStorage on every change and restore
//   them when the form mounts. sessionStorage, not localStorage: a draft is only meaningful
//   for the visit that produced it, and it dies with the tab rather than surfacing someone
//   else's half-written message on a shared machine days later.
// Alternatives considered:
//   - Lift the form state into LivingCv: Rejected — pushes contact-form concerns into the
//     game orchestrator, and still loses everything on a page reload
//   - Keep CvContact mounted and hide it with CSS: Rejected — breaks the one-level-at-a-time
//     render and the keyed slide-in animation the design is built on
//   - localStorage: Rejected — a draft reappearing weeks later reads as a bug, not a rescue

import { MAX_NAME_LENGTH, MAX_EMAIL_LENGTH, MAX_MESSAGE_LENGTH } from './validation'

const DRAFT_KEY = 'jt-cv-contact-draft'

export interface ContactDraft {
  name: string
  email: string
  message: string
}

const EMPTY_DRAFT: ContactDraft = { name: '', email: '', message: '' }

/** Coerce one stored field to a string clamped to the limit its input enforces. */
function readField(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.slice(0, maxLength) : ''
}

/**
 * Restore the saved draft, or empty fields when there is none.
 *
 * Storage can throw (Safari private mode, storage disabled) and its contents are
 * untrusted — anything unparseable or the wrong shape degrades to empty fields
 * rather than breaking the form.
 */
export function loadDraft(): ContactDraft {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY)
    if (!raw) return { ...EMPTY_DRAFT }

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return { ...EMPTY_DRAFT }

    const draft = parsed as Record<string, unknown>
    return {
      name: readField(draft.name, MAX_NAME_LENGTH),
      email: readField(draft.email, MAX_EMAIL_LENGTH),
      message: readField(draft.message, MAX_MESSAGE_LENGTH),
    }
  } catch {
    return { ...EMPTY_DRAFT }
  }
}

/**
 * Persist the draft. An all-blank draft removes the entry instead of storing empty
 * strings, so a sent (or cleared) form leaves nothing behind.
 */
export function saveDraft(draft: ContactDraft): void {
  try {
    if (!draft.name && !draft.email && !draft.message) {
      sessionStorage.removeItem(DRAFT_KEY)
      return
    }
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    // Storage unavailable — the form still works, it just can't rescue a draft.
  }
}
