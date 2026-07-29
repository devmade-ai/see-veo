// Requirement: The saved contact-form draft comes back from sessionStorage, which is
//   untrusted input — anything there can be edited, truncated, or left by an older build.
// Approach: Exercise loadDraft/saveDraft directly for the degrade-to-empty branches and
//   the field clamps; the form-level behaviour is covered in interest-form.test.tsx.

import { describe, it, expect, beforeEach } from 'vitest'
import { loadDraft, saveDraft } from '../utils/formDraft'
import { MAX_NAME_LENGTH, MAX_MESSAGE_LENGTH } from '../utils/validation'

const DRAFT_KEY = 'jt-cv-contact-draft'
const EMPTY = { name: '', email: '', message: '' }

describe('formDraft', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  it('returns empty fields when nothing is stored', () => {
    expect(loadDraft()).toEqual(EMPTY)
  })

  it('round-trips a draft', () => {
    const draft = { name: 'Louise Wentworth', email: 'louisew@example.com', message: 'Hello there' }
    saveDraft(draft)
    expect(loadDraft()).toEqual(draft)
  })

  it('removes the entry instead of storing a blank draft', () => {
    saveDraft({ name: 'Jane', email: '', message: '' })
    saveDraft(EMPTY)
    expect(sessionStorage.getItem(DRAFT_KEY)).toBeNull()
  })

  it('degrades to empty fields on unparseable storage', () => {
    sessionStorage.setItem(DRAFT_KEY, 'not json')
    expect(loadDraft()).toEqual(EMPTY)
  })

  it('degrades to empty fields when the stored shape is wrong', () => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(['nope']))
    expect(loadDraft()).toEqual(EMPTY)
  })

  it('drops fields that are not strings', () => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ name: 42, email: null, message: 'Hi' }))
    expect(loadDraft()).toEqual({ name: '', email: '', message: 'Hi' })
  })

  it('clamps restored fields to the limits the inputs enforce', () => {
    sessionStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ name: 'a'.repeat(500), email: '', message: 'b'.repeat(5000) }),
    )
    const draft = loadDraft()
    expect(draft.name).toHaveLength(MAX_NAME_LENGTH)
    expect(draft.message).toHaveLength(MAX_MESSAGE_LENGTH)
  })
})
