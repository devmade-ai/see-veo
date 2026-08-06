/**
 * Inject a crawlable, readable version of the CV into the built document.
 *
 * Requirement: the served page must contain the CV as text.
 *
 * Why: measured on the deployed origin, index.html had ZERO crawlable body
 *   characters. The head is excellent — title, description, canonical, full
 *   Open Graph, Person + ProfilePage structured data — sitting on top of an
 *   empty <div id="root">. That combination makes a link preview well and a
 *   page indexable not at all. For a CV that is the whole point backwards: the
 *   document exists to be found by someone searching a name and a skill.
 *
 * Approach: generate the markup FROM src/data/cv-data.ts at build time and
 *   inject it INTO the mount point. Two consequences worth stating:
 *
 *   1. Generated, not hand-written. A second hand-maintained copy of a CV
 *      would drift the first time a role changed, and a stale CV is worse than
 *      no crawlable text. There is one source; this is a projection of it.
 *
 *   2. Injected INTO #root, not beside it. React's first render replaces the
 *      container's children, so the handoff needs no removal step, no flag and
 *      no third moving part that can break. The app owning #root is what clears
 *      it.
 *
 * It is also the no-JS view and the first paint, so it is written to be read by
 *   a person — the runner-based UI is a presentation of this, not a substitute.
 *
 * Runs AFTER `vite build`, against dist/index.html. Doing it as a Vite plugin
 *   would mean importing a .ts module into vite.config at config-load time; a
 *   post-build pass over the emitted file keeps the data import in one place
 *   (esbuild transpiles it here) and asserts against what actually ships.
 */

import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = process.argv[2] ? resolve(process.argv[2]) : join(ROOT, 'dist')
const PAGE = join(DIST, 'index.html')
const MOUNT = '<div id="root"></div>'

/** Escape for HTML text nodes. The CV is our own copy, but it contains
 *  ampersands ("Sales Engineer & Analyst") that would otherwise be invalid. */
const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

/** Load the TS data module without adding a runtime dependency on ts-node. */
async function loadCvData() {
  const dir = mkdtempSync(join(tmpdir(), 'see-veo-cv-'))
  try {
    const out = join(dir, 'cv-data.mjs')
    await build({
      entryPoints: [join(ROOT, 'src', 'data', 'cv-data.ts')],
      outfile: out,
      format: 'esm',
      platform: 'node',
      bundle: true,
      logLevel: 'silent',
    })
    return (await import(`file://${out}`)).cvData
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

// Written against the exact shapes in src/data/cv-data.ts (ExperienceItem,
// SkillCategory, ProjectItem, EducationItem). No `?? ''` fallbacks: every field
// below is non-optional in those interfaces, so a fallback would only hide a
// data change that the length assertion at the end should surface loudly.
function render(cv) {
  const { personal, profileIntro, experience, skills, projects, education } = cv

  const section = (heading, body) => `<section><h2>${esc(heading)}</h2>${body}</section>`
  const list = (items) => `<ul>${items.join('')}</ul>`

  const experienceHtml = list(
    experience.map(
      (e) =>
        `<li><h3>${esc(e.role)} — ${esc(e.company)}</h3>` +
        `<p><time>${esc(e.period)}</time></p>` +
        `<p>${esc(e.description)}</p>` +
        // The highlights are the substance of a CV — the part a recruiter
        // actually searches. Dropping them would leave the crawlable version a
        // shell of the rendered one.
        list(e.highlights.map((h) => `<li>${esc(h)}</li>`)) +
        `</li>`,
    ),
  )

  const skillsHtml = list(
    skills.map((c) => `<li><h3>${esc(c.category)}</h3><p>${esc(c.skills.join(', '))}</p></li>`),
  )

  const projectsHtml = list(
    projects.map(
      (p) =>
        `<li><h3><a href="${esc(p.url)}">${esc(p.name)}</a></h3>` +
        `<p>${esc(p.stack)}</p><p>${esc(p.description)}</p></li>`,
    ),
  )

  const educationHtml = list(
    education.map(
      (e) => `<li><h3>${esc(e.degree)}</h3><p>${esc(e.institution)} · ${esc(e.period)}</p></li>`,
    ),
  )

  return (
    `<main class="seo-cv">` +
    `<h1>${esc(personal.name)} — ${esc(personal.title)}</h1>` +
    `<p>${esc(personal.location)}</p>` +
    `<p>${esc(profileIntro)}</p>` +
    section('Experience', experienceHtml) +
    section('Skills', skillsHtml) +
    section('Projects', projectsHtml) +
    section('Education', educationHtml) +
    `</main>`
  )
}

async function main() {
  if (!existsSync(PAGE)) {
    console.error(`[build-seo-body] ${PAGE} not found — run after \`vite build\`.`)
    process.exit(1)
  }
  const html = readFileSync(PAGE, 'utf8')
  if (!html.includes(MOUNT)) {
    // Fail loud. If the mount point is renamed or reformatted, silently
    // skipping would ship an empty document again — which is precisely how
    // this went unnoticed until the origin was measured.
    console.error(
      `[build-seo-body] mount point literal not found in dist/index.html: ${MOUNT}\n` +
        'Update MOUNT to match index.html, or the page ships with no crawlable body text.',
    )
    process.exit(1)
  }

  const body = render(await loadCvData())
  const text = body.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (text.length < 800) {
    console.error(`[build-seo-body] rendered only ${text.length} characters — the CV data looks empty.`)
    process.exit(1)
  }

  writeFileSync(PAGE, html.replace(MOUNT, `<div id="root">${body}</div>`))
  console.log(`[build-seo-body] injected ${text.length} characters of crawlable CV text`)
}

main().catch((err) => {
  console.error('[build-seo-body] failed:', err)
  process.exit(1)
})
