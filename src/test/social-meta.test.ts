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

  // Read the PNG's OWN header rather than asserting the literals twice.
  // `content="1200"` only proves the tag says 1200 — resize or replace the card
  // and this stayed green while every unfurl cropped. A PNG's IHDR begins at
  // byte 16: width and height are the next two big-endian uint32s.
  function pngSize(path: string): { width: number; height: number } {
    const buf = readFileSync(path)
    const signature = buf.subarray(0, 8).toString('hex')
    if (signature !== '89504e470d0a1a0a') throw new Error(`${path} is not a PNG`)
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
  }

  it('declares OG image dimensions matching the shipped card (1200×630)', () => {
    expect(html).toContain('property="og:image:width" content="1200"')
    expect(html).toContain('property="og:image:height" content="630"')

    // …and the shipped file really is that size.
    expect(pngSize(resolve(root, 'public/share/og-card.png'))).toEqual({
      width: 1200,
      height: 630,
    })
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

  // These three exist because the SPA rewrite used to answer for them: a
  // request for /robots.txt returned index.html with a 200, so the file was
  // "present" in the repo and absent to every crawler.
  it('ships a real robots.txt that allows the crawl and names the sitemap', () => {
    const robots = readFileSync(resolve(root, 'public/robots.txt'), 'utf8')
    expect(robots).toMatch(/^User-agent:\s*\*/m)
    expect(robots).toMatch(/^Allow:\s*\//m)
    expect(robots).not.toMatch(/^Disallow:\s*\/\s*$/m)
    expect(robots).toContain('Sitemap: https://see-veo.vercel.app/sitemap.xml')
  })

  it('ships a sitemap listing the canonical URL', () => {
    const sitemap = readFileSync(resolve(root, 'public/sitemap.xml'), 'utf8')
    expect(sitemap).toContain('<urlset')
    expect(sitemap).toContain('<loc>https://see-veo.vercel.app/</loc>')
  })

  it('declares a canonical URL matching og:url', () => {
    expect(html).toContain('<link rel="canonical" href="https://see-veo.vercel.app/" />')
  })

  // Regression guard. The meta description shipped EMPTY in production for as
  // long as an explanatory comment above it contained the literal text
  // `<meta name="description">` — the build picked up the commented example and
  // emitted it in place of the real tag.
  //
  // Two assertions, because the source was never wrong: the SOURCE must carry
  // real content, and no comment may contain a literal meta-tag that the build
  // can mistake for the real one. Checking dist/ would be stronger still, but
  // this file runs without a build and a test that silently skips when dist/ is
  // absent is the kind of green that hid this for months.
  it('ships a non-empty meta description', () => {
    const match = html.match(/<meta\s+name="description"\s+content="([^"]+)"/)
    expect(match?.[1] ?? '').not.toBe('')
    expect((match?.[1] ?? '').length).toBeGreaterThan(50)
  })

  it('has no literal meta tag inside an HTML comment', () => {
    const comments = html.match(/<!--[\s\S]*?-->/g) ?? []
    for (const comment of comments) {
      expect(
        comment,
        'a <meta …> literal inside a comment is picked up by the build and ' +
          'emitted in place of the real tag — write "the meta description" instead',
      ).not.toMatch(/<meta\s/i)
    }
  })
})
