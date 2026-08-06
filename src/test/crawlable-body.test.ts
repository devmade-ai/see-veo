// Requirement: the served document must contain the CV as readable text.
//
// Why this exists: measured on the deployed origin, index.html had ZERO
//   crawlable body characters. The head was excellent — title, description,
//   canonical, full Open Graph, Person + ProfilePage structured data — sitting
//   on an empty <div id="root">. That combination makes a link preview well and
//   a page indexable not at all, which for a CV is the point backwards: the
//   document exists to be found by someone searching a name and a skill.
//
// These assertions run against dist/, because the injection happens after
//   `vite build`. They skip rather than fail without it so a fresh clone can run
//   the suite — the deploy builds first, so they are live where it counts.
//
// Two things are deliberate:
//   1. Assertions are INSIDE the mount point. The name and title also appear in
//      <title>, og:title and the JSON-LD, so a whole-file search for them passes
//      on a page whose body was never injected.
//   2. Comments are stripped first. A regex cannot tell it is inside <!-- -->,
//      and this head carries long explanatory comments — that exact confusion
//      produced a false "the description is empty in production" finding against
//      this very repo.

import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { cvData } from '../data/cv-data'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const PAGE = join(ROOT, 'dist', 'index.html')

const built = existsSync(PAGE) ? readFileSync(PAGE, 'utf8').replace(/<!--[\s\S]*?-->/g, '') : null

/** The injected markup, isolated from the rest of the document. */
const rootInner = built?.match(/<div id="root">([\s\S]*?)<\/div>\s*<script/)?.[1] ?? ''
const rootText = rootInner
  .replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim()

const describeBuilt = built ? describe : describe.skip

describeBuilt('the document a crawler receives', () => {
  it('carries substantial text inside the mount point', () => {
    expect(rootText.length).toBeGreaterThan(3000)
  })

  it('names the person and their title', () => {
    expect(rootText).toContain(cvData.personal.name)
    expect(rootText).toContain(cvData.personal.title)
    expect(rootText).toContain(cvData.personal.location)
  })

  it('has one h1 and a heading for every section', () => {
    expect(rootInner.match(/<h1\b/g) ?? []).toHaveLength(1)
    for (const heading of ['Experience', 'Skills', 'Projects', 'Education']) {
      expect(rootInner).toContain(`<h2>${heading}</h2>`)
    }
  })

  it('includes every role, company and period', () => {
    for (const e of cvData.experience) {
      expect(rootText, `missing role ${e.role}`).toContain(e.role)
      expect(rootText, `missing company ${e.company}`).toContain(e.company)
      expect(rootText, `missing period ${e.period}`).toContain(e.period)
    }
  })

  it('includes the highlights, which are the substance a recruiter searches', () => {
    // The failure this catches is a renderer that emits the scaffolding — roles
    // and headings — while silently dropping the bullet points, leaving the
    // crawlable version a shell of the rendered one.
    for (const e of cvData.experience) {
      for (const h of e.highlights) {
        expect(rootText, `missing highlight: ${h.slice(0, 40)}…`).toContain(h)
      }
    }
  })

  it('includes every skill', () => {
    for (const c of cvData.skills) {
      expect(rootText, `missing category ${c.category}`).toContain(c.category)
      for (const s of c.skills) expect(rootText, `missing skill ${s}`).toContain(s)
    }
  })

  it('stays in step with the head rather than duplicating it by hand', () => {
    // Generated from cv-data, so this can only fail if the generator and the
    // head drift apart — which is the reason the body is generated at all.
    expect(built).toContain(`content="${cvData.personal.name}`)
  })
})
