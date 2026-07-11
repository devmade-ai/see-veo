import { describe, it, expect } from 'vitest'
import { cvData, sections } from '../data/cv-data'

// Requirement: Validate CV data + game section config to catch missing/empty fields early
// Approach: Unit tests asserting required fields are present, IDs are unique, and the
//   section metadata that drives navigation + scoring is well-formed
// Alternatives considered:
//   - Runtime validation in components: Rejected — tests catch issues at build time

describe('cvData', () => {
  it('has personal info with all required fields', () => {
    expect(cvData.personal.name).toBeTruthy()
    expect(cvData.personal.title).toBeTruthy()
    expect(cvData.personal.location).toBeTruthy()
    expect(cvData.personal.quote).toBeTruthy()
    expect(cvData.personal.email).toContain('@')
  })

  it('has social links with url + label', () => {
    expect(cvData.personal.linkedin.url).toContain('linkedin.com')
    expect(cvData.personal.linkedin.label).toBeTruthy()
    expect(cvData.personal.github.url).toContain('github.com')
    expect(cvData.personal.github.label).toBeTruthy()
  })

  it('has a profile intro and four stats', () => {
    expect(cvData.profileIntro).toBeTruthy()
    expect(cvData.stats.length).toBe(4)
    for (const stat of cvData.stats) {
      expect(stat.label).toBeTruthy()
      expect(stat.value).toBeTruthy()
    }
  })

  it('has at least one experience entry with all required fields', () => {
    expect(cvData.experience.length).toBeGreaterThan(0)
    for (const item of cvData.experience) {
      expect(item.id).toBeTruthy()
      expect(item.company).toBeTruthy()
      expect(item.role).toBeTruthy()
      expect(item.period).toBeTruthy()
      expect(item.description).toBeTruthy()
      expect(Array.isArray(item.highlights)).toBe(true)
      expect(item.highlights.length).toBeGreaterThan(0)
    }
  })

  it('has project entries with a stack line and url', () => {
    expect(cvData.projects.length).toBeGreaterThan(0)
    for (const item of cvData.projects) {
      expect(item.id).toBeTruthy()
      expect(item.name).toBeTruthy()
      expect(item.description).toBeTruthy()
      expect(item.stack).toBeTruthy()
      expect(item.url).toMatch(/^https?:\/\//)
    }
  })

  it('has education entries with all required fields', () => {
    expect(cvData.education.length).toBeGreaterThan(0)
    for (const item of cvData.education) {
      expect(item.id).toBeTruthy()
      expect(item.institution).toBeTruthy()
      expect(item.degree).toBeTruthy()
      expect(item.period).toBeTruthy()
    }
  })

  it('has skill categories each with skills', () => {
    expect(cvData.skills.length).toBeGreaterThan(0)
    for (const cat of cvData.skills) {
      expect(cat.id).toBeTruthy()
      expect(cat.category).toBeTruthy()
      expect(cat.skills.length).toBeGreaterThan(0)
    }
  })

  it('has unique IDs within every collection', () => {
    const collections = [
      cvData.experience.map((e) => e.id),
      cvData.education.map((e) => e.id),
      cvData.skills.map((s) => s.id),
      cvData.projects.map((p) => p.id),
    ]
    for (const ids of collections) {
      expect(new Set(ids).size).toBe(ids.length)
    }
  })
})

describe('sections (game config)', () => {
  it('lists the six navigable levels starting with profile', () => {
    expect(sections.map((s) => s.id)).toEqual([
      'profile',
      'experience',
      'skills',
      'projects',
      'education',
      'contact',
    ])
  })

  it('has a flag label and a positive coin value for every section', () => {
    for (const section of sections) {
      expect(section.flagLabel).toBeTruthy()
      expect(section.coinValue).toBeGreaterThan(0)
    }
  })

  it('has unique section IDs', () => {
    const ids = sections.map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
