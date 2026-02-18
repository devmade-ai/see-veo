import { describe, it, expect } from 'vitest'
import { cvData } from '../data/cv-data'

// Requirement: Validate CV data structure to catch missing/empty fields early
// Approach: Unit tests that assert required fields are present and IDs are unique
// Alternatives considered:
//   - Runtime validation in components: Rejected — tests catch issues at build time

describe('cvData', () => {
  it('has personal info with all required fields', () => {
    expect(cvData.personal.name).toBeTruthy()
    expect(cvData.personal.title).toBeTruthy()
    expect(cvData.personal.tagline).toBeTruthy()
    expect(cvData.personal.location).toBeTruthy()
    expect(cvData.personal.avatarInitials).toBeTruthy()
  })

  it('has at least one experience entry', () => {
    expect(cvData.experience.length).toBeGreaterThan(0)
  })

  it('has unique IDs across experience entries', () => {
    const ids = cvData.experience.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has all required fields in experience entries', () => {
    for (const item of cvData.experience) {
      expect(item.id).toBeTruthy()
      expect(item.company).toBeTruthy()
      expect(item.role).toBeTruthy()
      expect(item.period).toBeTruthy()
      expect(item.description).toBeTruthy()
      expect(Array.isArray(item.highlights)).toBe(true)
    }
  })

  it('has unique IDs across education entries', () => {
    const ids = cvData.education.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has unique IDs across skill categories', () => {
    const ids = cvData.skills.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has unique IDs across project entries', () => {
    const ids = cvData.projects.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has contact info with social links', () => {
    expect(cvData.contact.linkedin).toContain('linkedin.com')
    expect(cvData.contact.github).toContain('github.com')
  })
})
