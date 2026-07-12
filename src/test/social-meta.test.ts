/// <reference types="node" />
// ^ This test reads files from disk (index.html, public/share). The app tsconfig scopes
//   types to "vite/client" to keep app code browser-pure, so pull in Node's types just for
//   this file rather than loosening them project-wide.
import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

// Requirement: Social link previews ("unfurls") only work if index.html carries absolute
//   Open Graph / Twitter tags on the real domain and the referenced share image ships.
//   Every failure mode here is SILENT — a reintroduced YOUR-DOMAIN placeholder, a domain
//   typo, a resized card that desyncs the declared dimensions, or a moved image just make
//   previews render blank; nothing throws. This guards those invariants.
// Approach: Read the source index.html + public/share and assert what every scraper needs.
//   Static-HTML integrity check (matches cv-data.test.ts's build-time-validation approach).
// Alternatives considered:
//   - Snapshot the whole <head>: Rejected — brittle, breaks on unrelated tag edits
//   - No test (static/UI-only): Rejected — this is a critical, silent-failure invariant

const root = process.cwd()
const html = readFileSync(resolve(root, 'index.html'), 'utf-8')
const OG_IMAGE = 'https://see-veo.vercel.app/share/og-card.png'

describe('social share meta (index.html)', () => {
  it('has no unreplaced YOUR-DOMAIN placeholder', () => {
    expect(html).not.toContain('YOUR-DOMAIN')
  })

  it('uses an absolute og:url on the live domain', () => {
    expect(html).toMatch(
      /property="og:url"\s+content="https:\/\/see-veo\.vercel\.app\/"/,
    )
  })

  it('points og:image and twitter:image at the absolute share card', () => {
    // Absolute URLs are mandatory — most scrapers ignore a relative og:image.
    expect(html).toContain(`property="og:image" content="${OG_IMAGE}"`)
    expect(html).toContain(`name="twitter:image" content="${OG_IMAGE}"`)
  })

  it('declares OG image dimensions matching the shipped card (1200×630)', () => {
    expect(html).toContain('property="og:image:width" content="1200"')
    expect(html).toContain('property="og:image:height" content="630"')
  })

  it('sets the large-image Twitter card and core OG tags', () => {
    expect(html).toContain('name="twitter:card" content="summary_large_image"')
    expect(html).toContain('property="og:type" content="website"')
    expect(html).toMatch(/property="og:title"/)
    expect(html).toMatch(/property="og:description"/)
  })

  it('ships the referenced share images in public/share', () => {
    for (const name of ['og-card.png', 'square-card.png', 'story-card.png']) {
      expect(existsSync(resolve(root, 'public/share', name))).toBe(true)
    }
  })
})
