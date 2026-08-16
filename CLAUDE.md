# see-veo

React + TypeScript + Vite PWA that presents a personal CV/resume as a playable,
ink-on-paper "pixel-runner" document (a Chrome-dino-style character walks between
section flags). Design from the Claude Design handoff "The Applicant".

## Fetching the Fleet Standards

The canonical rules live in **gp-props** and this file mirrors them. To read the current version:

```bash
curl -sf "https://gp-props.vercel.app/CLAUDE.md"
```

Implementation patterns are fetched separately — see Implementation Patterns below.

## Tech Stack

- React 19 with TypeScript
- Vite 7 with `@vitejs/plugin-react`
- Tailwind CSS v4 via `@tailwindcss/vite` (no tailwind.config — all config is CSS-first in `src/index.css` using `@theme`)
- PWA via `vite-plugin-pwa` (Workbox service worker, web manifest)
- Vercel deployment (auto-deploys on push to `main`, configured via `vercel.json`)

## Project Structure

- `src/data/cv-data.ts` — All CV content + TypeScript interfaces **and** the game's `sections` config (flag labels + coin values). Edit this single file to update the resume.
- `src/game/pixelRunnerEngine.ts` — Framework-agnostic canvas engine: the pixel runner (sprites + physics), the numeric HUD (score/hi/distance written per frame), and Web Audio blips. Driven imperatively by `LivingCv`; no-ops without a 2D context (jsdom).
- `src/components/` — `LivingCv` (orchestrator: nav state, engine wiring, keyboard), `CvHeader` (title + HUD + SFX/PDF), `CvGameStrip` (canvas + clickable section flags), one component per CV section (`CvProfile`, `CvExperience`, `CvSkills`, `CvProjects`, `CvEducation`, `CvContact`), `CvSectionHeading` (shared), `CvPrintDoc` (print-only clean CV), plus the kept-and-restyled `InterestForm`, `InstallInstructionsModal`, `UpdatePrompt`.
- `src/hooks/` — `usePWAInstall` (install prompt) and `usePWAUpdate` (fleet auto-on-launch update policy: launch-apply, mid-session banner, "Automatic updates" toggle, typed `checkForUpdate`).
- `src/utils/` — Shared utilities: `debugLog.ts` (pub/sub event store; now headless — backs the contact form's diagnosability), `pwa.ts` (browser detection, standalone check), `validation.ts` (email pattern, field-length limits, form payload validation), `fetchWithTimeout.ts` (fetch wrapper with abort-on-timeout), `diagnostics.ts` (`diagnoseFailure` — contact-form failure diagnosis), `formDraft.ts` (sessionStorage rescue for a half-written contact message).
- `src/fonts.css` + `src/fonts/` — Self-hosted `@font-face` for Spectral (serif) / Space Mono (mono) / Silkscreen (pixel). Exposed as `font-serif` / `font-mono` / `font-pixel`.
- `src/index.css` — Tailwind import, `@import "./fonts.css"`, custom `@theme` color tokens (**warm-paper palette**), keyframes (doc-in / coin-pop / flag-wave / caret), base + print styles. Single source of truth for theme colors — `vite.config.ts` parses this file to feed the PWA manifest and HTML `theme-color`.
- `src/App.tsx` — Composes `LivingCv` + the PWA update toast + install modal. No routing.
- `vite.config.ts` — Vite config with Tailwind plugin, PWA plugin, `themeColorInjector` plugin (injects theme colors into HTML), and Workbox runtime caching rules.
- `vercel.json` — Vercel deployment config with SPA rewrites.
- `vitest.config.ts` — Vitest config with jsdom environment, React plugin, and setup file (`src/test/setup.ts`).
- `src/test/` — Test files (Vitest + Testing Library).
- `.env.example` — Example environment variables (`VITE_INTEREST_API_URL`).

## Commands

- `npm run dev` — Start dev server
- `npm run type-check` — TypeScript type check only (no build)
- `npm run build` — TypeScript check + production build (`tsc -b && vite build`)
- `npm run lint` — Run ESLint
- `npm run preview` — Preview production build locally
- `npm run test` — Run Vitest test suite
- `npm run test:watch` — Run Vitest in watch mode

## Key Decisions

- **Warm-paper "The Applicant" theme** (single theme, no toggle): paper `#F4ECD8`, ink `#2B2118`, one amber accent `#E0972B`, defined via Tailwind v4 `@theme` tokens. The existing token NAMES were kept and only revalued, so kept components (form/modal/toast) re-theme automatically.
- **Playable single screen** (`LivingCv`), no client-side routing: six discrete "levels" (Profile/Work/Skills/Projects/Study/Contact), each a flag the pixel runner walks to. React owns navigation/visited state (source of truth); the canvas engine renders + scores. `←`/`→` walk, `Space` jump, click a flag. **The key handler yields to the page**: it ignores events dispatched from a form field (`input`/`textarea`/`select`/contenteditable), skips `Space` when a button/`summary`/`role="button"` has focus, and ignores Ctrl/Meta/Alt combos. This is not optional polish — `preventDefault()` on a keydown cancels the browser's character insertion, and before the guard existed every space typed into the contact form was swallowed by the jump control (a real visitor's message arrived by email as `pleasesendmeyourcellphonenumber.`). Pinned by `src/test/living-cv.test.tsx`. Coin score persists a high score to `localStorage` (`jt-cv-hi`). Motion-safe via `prefers-reduced-motion` (`motion-safe:` variants + engine teleport).
- PWA `scope` and `start_url` use `/` — Vercel serves at root, no base-path prefix. `theme-color` = ink, manifest `background_color` = paper, `orientation: portrait`. Icons self-hosted in `public/icons/` (ink runner + amber flag motif from the handoff).
- **PWA updates follow the fleet auto-on-launch policy** (gp-props `docs/implementations/PWA_SYSTEM.md` → "Update Application Policy"). `registerType` stays `'prompt'` (the mechanism); `usePWAUpdate` is the policy: a worker already **waiting when the app starts** is applied silently (SKIP_WAITING posted to `registration.waiting`, one reload via the latch-gated `controllerchange` backstop + vite-plugin-pwa's own `controlling` listener), gated on the persisted **"Automatic updates"** preference (localStorage `jt-cv-auto-update`, absent = ON, try/catch-safe) and a 30s `sessionStorage` `jt-cv-pwa-updated` just-updated suppression. Updates detected **mid-session** (hourly poll + visibilitychange check) never reload — they arm the `UpdatePrompt` banner; the waiting worker applies on the next launch. **UI placement (no menu/settings surface exists):** the "Automatic updates" checkbox lives inside the `UpdatePrompt` banner (visible whenever the prompt shows); the **"Check for updates"** action (typed result `'no-sw' | 'up-to-date' | 'update-available' | 'error'`, `registration.update()` + ~1500ms settle) lives in the **Contact level next to the install affordance** — the app-management corner of the CV — with an always-mounted `role="status"` result line. The header SFX/PDF cluster was rejected as placement (primary game chrome; a third utility button adds noise).
- Print styles in `src/index.css` swap the game shell (`print:hidden`) for `CvPrintDoc` (a clean printed CV). `.no-print` also hides fixed chrome.
- Contact: the `InterestForm` (kept from the previous app, restyled) lives in the **Contact level**, alongside mailto + LinkedIn/GitHub links and the PWA install affordance. POSTs to an **external** SMTP relay via `VITE_INTEREST_API_URL`; degrades gracefully when unset/offline; validates via `validatePayload` first. An in-progress message is mirrored to `sessionStorage` (`jt-cv-contact-draft`, `src/utils/formDraft.ts`) on every change and restored on mount — only the active level is mounted, so walking to another flag mid-message would otherwise discard it silently. Sending clears the draft; storage failures degrade to empty fields.
- Google Analytics (gtag.js) embedded in `index.html` with measurement ID `G-61SDQXZSFT`. Standard async snippet; page-view fires on load (no routing).
- **Social share / link previews**: static Open Graph + Twitter Card tags in `index.html` drive rich unfurls (LinkedIn / Facebook / X / WhatsApp / Slack / Telegram / iMessage / Discord). URLs are **absolute** on the live domain `https://see-veo.vercel.app` (source of truth: the repo's GitHub `homepage` field) — scrapers don't run JS and won't follow a relative `og:image`. Card art lives in `public/share/`: `og-card.png` (1200×630, the unfurl image referenced by `og:image`/`twitter:image`), plus `square-card.png` (1080×1080) and `story-card.png` (1080×1920) for manual Instagram/story posts (those platforms don't unfurl links). Served as static files (Vercel checks the filesystem before the SPA rewrite) and **excluded from the SW precache** (`globIgnores: ['share/**']` in `vite.config.ts`) since the app never displays them. Copy is baked into **both** the meta tags and the PNGs — keep them in sync with `cv-data.ts` (name/title/tagline/handles/location); if the OG art is resized, update `og:image:width/height`. Source designs: handoff `guidelines/share-*.card.html`. Regression-guarded by `src/test/social-meta.test.ts`.
- **Removed in the redesign**: repo-tor activity charts (`ActivityCharts`/`ActivityTimeline`/`useRepoTorEmbed`/`constants/embed.ts`) and the on-screen debug banner (`DebugBanner`). See git history to recover.

---

## Process

1. **Read these preferences first**
2. **Gather context from documentation** (CLAUDE.md, relevant docs/)
3. **Then proceed with the task**

> **Project notes:** plans and scratch files go in `/docs/working`, never the repo root. Verify with `npm run build` (TypeScript + build) and `npm run test` (Vitest).

### REMINDER: READ AND FOLLOW THE PROCESS EVERY TIME

## Principles

1. **User-first design** - Align with how real people will use the tool (top priority)
2. **Simplicity** - Simple flow, clear guidance, non-overwhelming visuals, accurate interpretation
3. **Document WHY** - Explain decisions and how they align with tool goals
4. **Testability** - Ensure correctness and alignment with usage goals can be verified
5. **Know the purpose** - Always be aware of what the tool is for
6. **Follow conventions** - Best practices and consistent patterns
7. **Repeatable process** - Follow consistent steps to ensure all the above

### REMINDER: READ AND FOLLOW THE PRINCIPLES EVERY TIME

---

## Code Standards

These rules are non-negotiable.

### Best Practices

- Follow established patterns and conventions already in the codebase
- Use industry-standard solutions over custom implementations when available
- Prefer well-maintained, widely-adopted libraries over obscure alternatives
- Apply SOLID principles, DRY, and separation of concerns
- Follow security best practices (input validation, sanitization, principle of least privilege)
- Handle errors gracefully with meaningful messages
- Write self-documenting code with clear naming

### Code Organization

- Prefer smaller, focused files and functions
- Pause and consider extraction at: 500 lines (file), 100 lines (function), 400 lines (class)
- Strongly consider refactoring at: 800+ lines (file), 150+ lines (function), 600+ lines (class)
- Extract reusable logic into separate modules/files immediately
- Group related functionality into logical directories
- Split large classes into smaller, focused classes when responsibilities diverge

### Styling

- Use Tailwind CSS utility classes in JSX — this is the project's standard approach
- Custom theme tokens, base styles, and print overrides go in `src/index.css` via `@theme`
- Do not create separate component stylesheet files
- Do not write inline `style={}` attributes; use Tailwind classes instead

### Decision Documentation

Every non-trivial code change must include comments explaining:
- **What** the requirement or instruction was
- **Why** this approach was chosen
- **What alternatives** were considered and why they were rejected

Trivial changes (content updates in `cv-data.ts`, minor styling tweaks) do not need this.

Example:
```typescript
// Requirement: Rate limit API calls to external service
// Approach: Token bucket algorithm with Redis backend
// Alternatives considered:
//   - Simple sleep/delay: Rejected - doesn't handle concurrent requests
//   - Fixed window counter: Rejected - allows burst at window boundaries
//   - Leaky bucket: Similar but token bucket gives more control over burst allowance
```

### User Experience

Assume all end users are non-technical. This is non-negotiable.

- UI must be intuitive without instructions
- Use plain language — no jargon, technical terms, or developer-speak
- Error messages must tell users what went wrong AND what to do next, in simple terms
- Labels, buttons, and instructions should be clear to someone unfamiliar with the domain
- Prioritize clarity over brevity in user-facing text
- Provide feedback for all user actions (loading states, success confirmations, etc.)
- Design for the least technical person who will use this

> **Project note:** The site includes an interest/contact form (`InterestForm` component). All UX rules above apply to this and any future interactive features.

### Cleanup

- Remove all temporary files after implementation is complete
- Delete unused imports, variables, and dead code immediately
- Remove commented-out code unless explicitly marked `// KEEP:` with reason
- Clean up `console.log`/`console.debug` statements before marking work complete

### Timer and Subscription Cleanup

- Every `setTimeout`/`setInterval`/`addEventListener`/`subscribe` needs a matching cleanup (`clearTimeout`/`clearInterval`/`removeEventListener`/unsubscribe handle).
- Store timer ids in a scope the cleanup can reach. Nested timeouts → array; single-shot → local const or ref.
- In React: return cleanup from `useEffect`. In plain modules: export a `dispose()` or use `AbortController`.
- HMR-safe: guard global listener attachment behind a `window.__<featureName>Attached` flag so hot-reload doesn't double-subscribe. For frameworks exposing `import.meta.hot`, also release listeners via `import.meta.hot.dispose()`.
- See the [TIMER_LEAKS pattern](https://gp-props.vercel.app/patterns/TIMER_LEAKS.md) for concrete patterns (nested-timeout array, AbortController, per-effect dispose, HMR guard). The hosted URL, not a repo-relative path — this block is mirrored into every repo, and only gp-props holds the file.

### Quality Checks

During every change, actively scan for:
- Error handling gaps
- Edge cases not covered
- Inconsistent naming
- Code duplication that should be extracted
- Missing input validation at boundaries
- Security concerns (XSS via dangerouslySetInnerHTML, unsanitized user input)
- Performance issues (unnecessary re-renders, missing keys, large re-computations)

Fix what you find. Raise it instead of fixing it only when the fix needs a decision that is genuinely the user's.

### Testing

- Write tests for critical paths and core business logic
- Test error handling and edge cases for critical functions
- Tests are not required for trivial getters/setters or UI-only code
- Run existing tests before and after changes

> **Project note:** Vitest is configured with jsdom environment. Tests live in `src/test/`. Run with `npm run test`.

### Commit Message Format

All commits must include metadata footers:

```
type(scope): subject

Body explaining why.

Tags: tag1, tag2, tag3
Complexity: 1-5
Urgency: 1-5
Impact: internal|user-facing|infrastructure|api
Risk: low|medium|high
Debt: added|paid|neutral
Epic: feature-name
Semver: patch|minor|major
```

**Tags:** Free-form descriptive tags relevant to the change (e.g., `audit`, `a11y`, `validation`, `pwa`, `embed`, `form`, `testing`, `styling`, `data`, `infrastructure`)
**Complexity:** 1=trivial, 2=small, 3=medium, 4=large, 5=major rewrite
**Urgency:** 1=planned, 2=normal, 3=elevated, 4=urgent, 5=critical
**Impact:** internal, user-facing, infrastructure, or api
**Risk:** low=safe change, medium=could break things, high=touches critical paths
**Debt:** added=introduced shortcuts, paid=cleaned up debt, neutral=neither
**Epic:** groups related commits under one feature/initiative name
**Semver:** patch=bugfix, minor=new feature, major=breaking change

These footers are required on every commit. No exceptions.

### REMINDER: READ AND FOLLOW THE CODE STANDARDS EVERY TIME

## Documentation

**AI assistants automatically maintain these documents.** Update them as you work — don't wait for the user to ask. This ensures context is always current for the next session.

**Maintained against reality, not appended to.** Before adding to any of these files, check what is already in them. If an entry is done, deployed, superseded, or no longer true, **delete it** — don't annotate it, don't mark it complete, don't keep it "for the record". Git history is the record.

This matters most where an entry can be resolved without the file being touched — `USER_ACTIONS.md` above all, where the user does the thing in a dashboard and nothing in the repo changes. Never assume such an entry is still pending: **check reality first** (hit the URL, read the deployed output, query the API), then delete or correct it. A stale entry is worse than a missing one — it gets acted on, and it makes the whole file look untrustworthy.

- Update relevant documentation with every code change
- All documentation lives in `/docs` directory
- Plans, notes, and scratch files go in `/docs/working`
- Never write docs or plans to root directory or random locations
- This CLAUDE.md must reflect current project state at all times

### `CLAUDE.md`

**Purpose:** AI preferences, project overview, architecture, key decisions.
**When to read:** At the start of every session, before doing any work.
**When to update:** When project architecture changes, state structure changes, or preferences evolve.
**What to include:**

- Process, Principles, AI Notes: Update when learning new patterns or preferences
- Project Status: Current working features (bullet list)
- Architecture: File structure with brief descriptions
- Key Decisions: Important architectural choices with rationale
- Any section that becomes outdated after feature changes

**Why:** This is the primary context for AI assistants. Accurate info here prevents mistakes.

### `docs/SESSION_NOTES.md`

**Purpose:** The few things the next session cannot work without. **Default state is empty.**
**When to read:** At the start of a session.
**When to update:** At session end, and the moment an entry goes stale — delete stale content, don't annotate it.
**What to include:** Only what the next session genuinely needs *and* cannot get from the code, the docs, or `git log`. If nothing qualifies, leave the file empty. Most sessions leave it empty.

Not a session log, not a changelog, not a record of what you did — git history already holds that, and a summary of finished work is noise the next session has to read past. Pending work goes in `docs/TODO.md`. Things only the user can do go in `docs/USER_ACTIONS.md`. Mistakes worth remembering go in `docs/AI_MISTAKES.md`. If an item fits one of those, it goes there, not here.

**Why:** An always-populated notes file trains sessions to skim it. Kept empty by default, anything in it is known to matter.

### REMINDER: READ AND FOLLOW THE DOCUMENTATION EVERY TIME

## Communication

Respond as if talking to yourself. Peer-to-peer, no servility.

- **Direct.** No filler, no preamble, no conversational padding. State facts and actions.
- **No sycophancy.** No "great question", "you're absolutely right", "excellent point". Acknowledge errors briefly and move on.
- **No hedging.** Commit to a position. "I think" / "perhaps" only when genuinely uncertain. Naming a concern is not hedging; declining to commit to a recommendation after naming it is. When challenged, state the answer plainly — padding, or defending a past decision instead of answering, reads as evasion. If you were wrong, say so in one line and move on.
- **Assume competence.** The reader is a developer. Don't over-explain basics.
- **Push back.** Disagree when warranted. State your view first, then say what you're doing about it.
- **Proper solutions only.** The right fix, not a hack that hides the problem. Proper means *correct*, not *elaborate* — see Scope and Completion.
- **Work, not process.** Only discuss work that can be done and work that is done. Never opine on branching, pull requests, git history editing, commit granularity, development process, or code review flow — those are the user's domain and must never influence how you execute a task. If you notice a process OPINION, keep it to yourself and get on with the work. A bare process FACT that decides whether or when the work takes effect is not an opinion and belongs in what needs their attention.
- **Say what you checked.** "Done" means verified — name the check that proved it (the command, the test, the reproduction). If nothing was run, say the change is unverified and what would prove it. Never report a pass, a fix, or compliance from memory.
- **Length is proportional to the decision it supports.** Lead with the outcome: answer, say what you did, stop. Don't restate the request, don't list options you're not recommending, and don't narrate the work — no step-by-step of what you checked, verified, or considered. The commit and the diff are the record. If a short answer is growing headers, tables and bullet lists, that is the signal it has gone wrong.
- **State the problem, then the fix.** When something is broken: one line on what's broken, one on what you did about it. No background, no evidence dump, no history of how you found it. Give the reasoning if asked.

### How a reply ends

Three parts, in this order. Each earns its place or it isn't written. Nothing is included to fill the shape.

1. **What you did, or what you found.** Concise. The outcome, not the journey.
2. **What needs their attention.** Only what they genuinely must know: a decision that is actually theirs, something you could not verify, something that will bite them. **A fixable problem reported instead of fixed is a failure, not a finding** — if you could have fixed it, you should have. **Be specific** — name the file, the assumption, the failure mode. "Might have edge cases" is noise; "this assumes every article has a section, and nothing validates that" is a concern. Distinguish *I decided this* (overrulable, state it) from *you must decide this* (blocking, ask it). If there is nothing, write nothing — never append "worth flagging", "one thing to note", or a trailing list of everything noticed along the way. An invented worry trains the reader to skip the section, which destroys the point of having it.
3. **Suggestions, or a full stop.** Actionable next moves, numbered. If there are none, just end.

**Never end on an open question.** A question left dangling after the work is work handed back. Questions belong *before* the work (see Scope and Completion); once work has started, an unknown becomes a stated assumption, not a question.

### REMINDER: READ AND FOLLOW THE COMMUNICATION RULES EVERY TIME

## Scope and Completion

How far the work goes, when to ask instead of deciding, and when stopping is legitimate.

### Scope is the user's call, never the session's

- **Everything is in scope unless the user says otherwise.** The user names what's out. A session never decides something is out of scope, and never uses the phrase to account for work it didn't do.
- **Scope is the request plus the code that exists** — not the code you imagine will exist.
- **Broken is always in scope. If you find something broken, fix it.** Pre-existing is not a reason to leave it. "Different kind of change from the rest of this branch" is not a reason to leave it. Size is not a reason to leave it — a big fix gets done, not deferred.
- **Wrong is in scope; different-from-your-taste is not.** Fix what is broken, incorrect, or unsafe. Don't restyle, rename, or rewrite working code because you would have written it differently.

### Build for the requirement that exists

- **Never invent a requirement, then solve it or report it as a problem.** If nobody said there is a migration path, there is no migration path. If nobody said the old behaviour must keep working, it doesn't have to. Requirements come from the user or from the code — never from what a system like this "usually" needs.
- **Simplest thing that solves the actual problem, first.** No speculative abstraction, no compatibility layer for callers that don't exist, no configurability nothing asked for, no defensive handling of states that can't occur.
- **Refactoring is expected, not a failure.** Building the simple version now is correct even knowing it will be rewritten later. Building the elaborate version now to avoid that rewrite is the mistake.

### Asking vs deciding

- **Investigate, don't interrogate.** Never build a fix on a guessed cause. Where the cause is knowable, go and find it — read the code, measure it in a browser, run the failing case. Reading the code, the design or the docs is not assuming. Ask only for what exists solely in the user's head: intent, priority, a product choice, access.
- **Ask when the answer changes what gets built and neither the request nor the code tells you which way.** That means: two readings leading to materially different work; a substantial build with no stated requirement anchoring it; or an irreversible action the request doesn't clearly authorise.
- **Decide when one reading is clearly the intended one**, when the detail is cheap to change later (naming, placement, wording, layout), or when the answer wouldn't change what you do. State what you decided — don't ask.
- **Ask once, up front, batched.** Every question you have, numbered, in a single message, before starting.
- **The last answer starts the work.** No confirmation round, no restating the plan for approval. Answers arrive, work begins.
- **Once work has started, don't stop to ask.** An unknown becomes a stated assumption and the work continues. Name the assumption in the reply.

### When stopping is legitimate

Stopping needs a real reason. There are three:

1. **The work is done** — all of it.
2. **Only the user can unblock it** — a credential, an access grant, a product decision that is genuinely theirs — and it was asked up front, not discovered at the end.
3. **Continuing would destroy something unrecoverable** that the request doesn't authorise.

Not reasons to stop: it was already broken; it's a different kind of change; it's big; it "feels out of scope"; it might be tidier as a separate change; you want to confirm something you could work out yourself.

**Done means done.** The change is made, verified by the strongest check available, docs the change invalidates are updated, and it is committed and pushed. Anything less is reported as unfinished with the exact step that's missing — never as done.

### REMINDER: READ AND FOLLOW THE SCOPE AND COMPLETION RULES EVERY TIME

---

## External Dependencies

### repo-tor Embed Charts — REMOVED (2026-07-11)

The repo-tor iframe chart embeds (`ActivityCharts`, `ActivityTimeline`, `useRepoTorEmbed`,
`src/constants/embed.ts`) were removed in the pixel-runner redesign — the new design has no
charts section. If re-introducing them, the embed docs live in
[devmade-ai/repo-tor](https://github.com/devmade-ai/repo-tor) `docs/` (`EMBED_IMPLEMENTATION.md`,
`EMBED_REFERENCE.md`); see `docs/EXTERNAL_REFERENCES.md` and git history prior to 2026-07-11.

### Deployed Projects (Projects Section)

Project cards in `src/data/cv-data.ts` are sourced from deployed repos across the `devmade-ai` and `illuminAI-select` GitHub accounts. To refresh or add new projects:

1. **List all repos** using the GitHub API with the `GITHUB_ALL_REPO_TOKEN` env var (user-scoped PAT):
   ```bash
   curl -s -H "Authorization: token $GITHUB_ALL_REPO_TOKEN" \
     "https://api.github.com/user/repos?per_page=100&visibility=all"
   ```
2. **Identify deployed repos** — look for `has_pages: true` (GitHub Pages) or a `homepage` field pointing to Vercel.
3. **Read each repo's README and package.json** to extract the project name, a non-technical description, and the tech stack. For private repos, use the API contents endpoint with the `Accept: application/vnd.github.v3.raw` header.
4. **Add entries** to the `projects` array in `src/data/cv-data.ts`.

**Included as the capstone card:**
- `gp-props` — shown as the **Full Portfolio** "see all" card at the end of the Projects list (`proj-portfolio`; deliberately NOT labelled "gp-props" — links to its live showcase `https://gp-props.vercel.app/`). Previously excluded by owner; the owner opted it in as the portfolio index. When refreshing projects, keep it last and keep the display name generic.

**Excluded repos** (not shown in Projects):
- `canva-grid-assets` — asset storage, not a standalone project
- `plant-fur` — excluded by owner
- `coin-zapp` — excluded by owner
- `tool-till-tees` — excluded by owner
- `chatty-chart` — excluded by owner
- `see-veo` — this repo (the CV site itself)

---

## Implementation Patterns (Source of Truth)

All implementation patterns live in the **gp-props** repo and are the single source of truth for all devmade-ai projects.

**Source location:** `docs/implementations/` in the gp-props repo

**How to access from any repo:**
- Fetch from the live site: `curl -sf "https://gp-props.vercel.app/patterns/{PATTERN_NAME}.md"`
- Fetch via GitHub API: `curl -sf -H "Authorization: token $(printenv GITHUB_ALL_REPO_TOKEN)" "https://api.github.com/repos/devmade-ai/gp-props/contents/docs/implementations/{PATTERN_NAME}.md" | jq -r .content | base64 -d`
- To list all available patterns: `curl -sf -H "Authorization: token $(printenv GITHUB_ALL_REPO_TOKEN)" "https://api.github.com/repos/devmade-ai/gp-props/contents/docs/implementations" | jq -r '.[].name'`

**Adding a new pattern:** Drop a `.md` file into `docs/implementations/` with YAML frontmatter and it appears in the app automatically. Required frontmatter fields:
```yaml
---
slug: url-safe-slug
title: Display Title
badge: Category
description: One-line description for the card.
tags:
  - tag1
  - tag2
order: 10
---
```
The `generatePatternManifest` Vite plugin scans the folder at build time, parses frontmatter, validates required fields, and generates `patterns/manifest.json`. Both `index.html` and `pattern.html` consume this manifest — no hardcoded lists.

**Rules:**
- **Always fetch the latest version** from gp-props before implementing — patterns are continuously improved
- **Never create local copies** of implementation pattern files in downstream repos
- **Do not hardcode a list of patterns** — scan the source folder to discover what's available
- The set of patterns grows over time; always check the source for new additions

### Alignment levels up, never down

gp-props is the source of truth, but "source of truth" does not mean "the version that wins". When a repo you are reading does something **better** than the canonical version, improve the canonical one — never overwrite the better implementation with the worse rule.

- **Applies to anything, not just patterns** — a rule, a PWA implementation, a hook, a tripwire, a doc convention, a line of copy.
- **Better means demonstrably better:** more correct, catches a case the other misses, or says the same thing more sharply and concretely. Not "different", not "how I would have written it" — that is the taste rule in Scope and Completion, and it still applies.
- **Upstream first, then sync.** Land the improvement in gp-props, then propagate it, so every repo ends up with the better version instead of one repo quietly keeping an advantage the rest never get.
- **Say what you took and where from**, so the trail exists.
- **Levelling a repo DOWN to match the canonical version is a regression**, even when it turns the alignment audit green. A green audit over a worse fleet is a failure of the audit, not a success.
## Project-Specific Configuration

### Paths
```
DOCS_PATH=/docs
WORKING_DOCS_PATH=/docs/working
COMPONENTS_PATH=src/components/
STYLES_PATH=src/index.css
TESTS_PATH=src/test/
```

### Stack
```
LANGUAGE=TypeScript
FRAMEWORK=React 19
TEST_RUNNER=vitest
PACKAGE_MANAGER=npm
```

### Conventions
```
NAMING_CONVENTION=camelCase
FILE_NAMING=PascalCase (components), kebab-case (config)
COMPONENT_STRUCTURE=flat (src/components/)
```

---

## AI Notes

- Always read a file before attempting to edit it
- Check for existing patterns in the codebase before creating new ones
- Commit and push changes before ending a session
- Clean up completed or obsolete docs/files and remove references to them
- **ASK before assuming.** When a user reports a bug, ask clarifying questions (which mode? what did you type? what do you see?) BEFORE writing code. Don't guess the cause and build a fix on an assumption — you'll waste time fixing the wrong thing. One clarifying question saves multiple wrong commits.
- **Always read files before editing.** Use the Read tool on every file before attempting to Edit it. Editing without reading first will fail.
- **Check build tools before building.** Run `npm install` or verify `node_modules/.bin/vite` exists before attempting `npm run build`. (`sharp` / `png-to-ico` remain devDependencies but are now unused — the icon generator script was removed; safe to prune if desired.)
- **Communication style:** Direct, concise responses. No filler phrases or conversational padding. State facts and actions. Ask specific questions with concrete options when clarification is needed.
- **Claude Code mobile/web — accessing sibling repos:**
  - Use `GITHUB_ALL_REPO_TOKEN` with the GitHub API (`api.github.com/repos/devmade-ai/{repo}/contents/{path}`) to read files from other devmade-ai repos
  - Use `$(printenv GITHUB_ALL_REPO_TOKEN)` not `$GITHUB_ALL_REPO_TOKEN` to avoid shell expansion issues
  - Never clone sibling repos — use the API instead

---

## Triggers

Commands that invoke focused analysis passes. Each trigger is a single perspective — what you'd notice that the others wouldn't.

### How to invoke

- **One perspective** — type the trigger name or its alias (e.g. `bugs`, `sec`, `a11y`).
- **A group** — type the group name (e.g. `correctness`, `frontend`, `ops`).
- **Everything** — type `all`.
- **Meta sweep** — type `quick`, `ship`, or `risk` for pre-curated bundles.

### Scope modifiers (suffix any trigger)

- *(none)* — whole codebase.
- `branch` — diff against the branch's base (default: `main`).
- `branch <base>` — diff against a specified base.
- `staged` — staged changes only.
- `file <path>` — single file.

Examples:
- `bugs` — bugs check across the whole codebase.
- `bugs branch` — bugs check on the current branch's diff vs main.
- `correctness branch main` — every correctness trigger against the branch diff.
- `all staged` — every applicable trigger against staged files.

### Behavior rules

- One trigger pass per response. Never combine.
- Findings are numbered text — never interactive prompts or selection UIs.
- After each pass, pause. User responds with `fix` / `skip` / `stop`:
  - `fix` — apply the suggested fixes for this trigger, then move on.
  - `skip` — skip this trigger's findings and move on.
  - `stop` — end the sweep entirely.
- Groups, meta sweeps, and `all` run triggers sequentially in table order, pausing after each.
- If a trigger doesn't apply to this repo (e.g. `database` on a static site), report "N/A for this repo" and move on.
- Triggers are the one place a pause is expected rather than a stop needing justification (Scope and Completion) — the user asked for a review, not a rewrite. Everywhere else, a found problem gets fixed.

### Correctness — group `correctness`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 1 | `bugs` | `bug` | Logic errors, off-by-ones, null/undefined paths, wrong default branches, stale assumptions |
| 2 | `errors` | `err` | Missing try/catch, swallowed failures, unhelpful error surfaces to user and dev |
| 3 | `race` | `rac` | Concurrency, stale closures, async ordering, event leaks, double-fire guards |
| 4 | `types` | `typ` | `any`/`as` abuse, unsafe casts, missing generics, runtime-vs-compile-time gaps |
| 5 | `edges` | `edg` | Empty/null/zero/max/unicode/timezone boundary cases; 0-item, 1-item, 10k-item behavior |

### Security / trust — group `trust`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 6 | `security` | `sec` | Injection, XSS, CSRF, auth gaps, insecure defaults, exposed secrets in code or bundle |
| 7 | `privacy` | `pri` | PII flow, redaction, retention, client-side data leaks, telemetry overreach |
| 8 | `supply-chain` | `sup` | Dep integrity, lockfile drift, postinstall hooks, third-party scripts |

### Performance — group `speed`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 9 | `performance` | `perf` | Render loops, expensive ops in hot paths, memory leaks, large re-computations |
| 10 | `network` | `net` | Request count, caching, batching, waterfalls, payload size, compression |
| 11 | `database` | `db` | N+1, missing indexes, transaction scope, lock contention |
| 12 | `bundle` | `bun` | Code splitting, tree-shaking, duplicate deps, blocking resources |

### User-facing — group `frontend`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 13 | `ux` | `ux` | Friction, cognitive load, missing loading/empty/error states, undiscoverable affordances |
| 14 | `a11y` | `a11y` | Keyboard nav, screen reader labels, focus order, contrast, ARIA correctness |
| 15 | `mobile` | `mob` | Touch target size, viewport, safe areas, tap delay, gestures, iOS keyboard handling |
| 16 | `motion` | `mot` | `prefers-reduced-motion` respect, animation jank, 60fps budgets, autoplay, transitions that interrupt screen-reader flow |
| 17 | `forms` | `frm` | Input validation, per-field error states, submit error handling, accessible field labels, paste/autofill behavior, unsaved-changes warnings |
| 18 | `copy` | `cpy` | Microcopy, voice consistency, jargon, error messages users actually see |
| 19 | `i18n` | `i18` | Hardcoded strings, RTL readiness, date/number formatting, pluralization |
| 20 | `dark-mode` | `dm` | Semantic color usage, contrast in both themes, flash-on-load |
| 21 | `visual` | `vis` | Layout/spacing/alignment, visual hierarchy, brand consistency, dark-vs-light visual parity, inconsistent corner radii/shadows/type scale |

### Maintainability — group `quality`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 22 | `clean` | `cln` | Dead code, duplication, commented-out blocks, unused imports/exports, leftover TODOs |
| 23 | `naming` | `nam` | Identifier clarity, consistency with local norms, misleading abbreviations |
| 24 | `patterns` | `pat` | Deviation from established patterns (fleet-wide gp-props or repo-local), reinvented wheels |
| 25 | `docs` | `doc` | Docs ↔ code drift, missing docs on public API, outdated README/CLAUDE.md claims |
| 26 | `doc-cleanup` | `dcl` | Duplicated content across doc files, stale files no longer relevant, orphaned docs nothing references, superseded files that replaced but didn't delete their predecessor, sections still describing removed features |
| 27 | `tests` | `tst` | Coverage gaps on critical paths, flaky patterns, test smells, missing edge-case tests |
| 28 | `complexity` | `cpx` | Function length, nesting depth, cyclomatic complexity hotspots |
| 29 | `hacks` | `hck` | `TODO`/`FIXME`/`HACK`/`XXX` markers, `@ts-ignore`/`@ts-expect-error`, `any` escapes framed as temporary, `setTimeout` for timing fixes, quick patches waiting to be done properly |
| 30 | `simplify` | `smp` | Reinvented framework features, over-engineered abstractions, custom code that could be 1–2 stdlib/library calls, unnecessary layers |
| 31 | `reuse` | `rus` | Custom-vs-stdlib balance: how much is hand-written that shouldn't be; logic that should be extracted for reuse but isn't; abstractions generalized for a single caller; speculative parameters, defensive checks for impossible states, and configurability serving no real need |
| 32 | `back-compat` | `bck` | Orphaned feature flags, deprecated branches with no callers, `legacy*` exports, backcompat shims outliving their purpose, `// kept for compatibility` blocks |
| 33 | `comments` | `cmt` | Code comments against repo rules — WHY not WHAT, no PR-reference rot, no AI narration, no commented-out blocks unless `// KEEP:` annotated |
| 34 | `dx` | `dx` | Developer experience: README/setup clarity, dev-error message quality, source map/stack trace usefulness, debug-surface ergonomics, contribution path friction |
| 35 | `undone` | `und` | Started-but-unfinished work — partial implementations, half-wired features, WIP branches of logic, features only reachable from dev but not production |

### Operational — group `ops`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 36 | `deps` | `dep` | Outdated, unused, vulnerable, license-risky dependencies |
| 37 | `observability` | `obs` | Log coverage, metric hygiene, trace completeness, debug-pill surfaces |
| 38 | `reliability` | `rel` | Retries, timeouts, idempotency, graceful degradation, offline handling |
| 39 | `config` | `cfg` | Env var handling, secret management, config schema drift |
| 40 | `migration` | `mig` | DB migration safety, API versioning, rollback plan, backward compatibility |
| 41 | `ci` | `ci` | Pipeline health, build speed, cache effectiveness, flake rate |
| 42 | `pwa` | `pwa` | Service worker correctness, manifest validity, install prompt handling, update flow, offline behavior, icon cache-busting, standalone-mode quirks |

### Design-level — group `design`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 43 | `architecture` | `arch` | Coupling, layering violations, abstraction leaks, module boundaries |
| 44 | `api` | `api` | Interface consistency, versioning, deprecation, contract clarity |
| 45 | `state` | `sta` | Where state lives, derivation vs storage, single-source-of-truth violations |
| 46 | `data-model` | `dat` | Schema normalization, foreign-key integrity, nullable discipline |

### Fleet alignment — group `fleet`

| # | Trigger | Alias | Looks for |
|---|---------|-------|-----------|
| 47 | `align` | `aln` | Drift between this repo's CLAUDE.md and gp-props CLAUDE.md — missing sections, stale rules, divergent conventions. Drift runs both ways: anything this repo does better gets upstreamed, not overwritten (see "Alignment levels up, never down") |
| 48 | `pattern-audit` | `pa` | Every gp-props implementation pattern: implemented / partial / missing / deviates — with diff notes for each. A deviation that is an improvement is an upstream candidate, not a defect |

### Meta sweeps

Run multiple triggers sequentially, pausing after each for `fix` / `skip` / `stop`. Organised roughly by cadence — pick the one that matches when you're running it.

| Trigger | Alias | Cadence | What it does |
|---------|-------|---------|--------------|
| `hot` | `h` | pre-commit | `bugs` + `types` + `errors` — fastest sanity check before committing. Pairs well with `hot staged` |
| `quick` | `q` | pre-push | `bugs` + `security` + `a11y` — the "don't ship this" triad |
| `ship` | `shp` | pre-merge | `correctness` + `trust` + `a11y` + `tests` — full pre-merge check |
| `session` | `ses` | end of session | `surface` + `wrap` + `undone` + `skipped` — "what state am I leaving this in?" |
| `tidy` | `tdy` | weekly | `clean` + `doc-cleanup` + `hacks` + `deps` + `undone` + `dx` — maintenance / hygiene sweep |
| `all` | `*` | quarterly | Every applicable trigger across every group, in order |

### Reflective passes

Single-pass, no fan-out to other triggers. Each answers one specific question about the recent work.

| Trigger | Alias | What it does |
|---------|-------|--------------|
| `risk` | `rsk` | Worst-case blast radius analysis on the current change |
| `surface` | `srf` | Reflective pass on recent changes: what was decided, what was assumed, what was skipped, what needs human review |
| `wrap` | `wrp` | Wrap-up pass before moving on — anything to double-check / strengthen / improve, anything discovered / assumed / skipped, anything to cleanup / update / tighten, anything to note / document / clarify |
| `skipped` | `skp` | What was left undone — issues noticed and not fixed, wherever they were noticed. Each item: what it is, where, why it wasn't fixed. Under Scope and Completion this list should come back empty; anything in it is a defect to close, not a record to keep |
| `assumed` | `asm` | What was assumed — anything decided rather than asked. Each item: the assumption, why it was made, what happens if wrong |
| `approach` | `apr` | Was the fix the best / most proper way? Honest self-review: what shortcuts were taken, what a senior reviewer would flag, what the "proper" version looks like if different |
| `cold` | `cld` | Fresh-eyes branch audit. Re-read CLAUDE.md from scratch. Review every change on the branch as if this were a new session with no prior context — don't privilege the diffs you just made. List all findings with a fix plan per item. Default scope: `branch` |

### REMINDER: READ AND FOLLOW THE TRIGGERS EVERY TIME

## Prohibitions

Never:
- Start a substantial build without knowing the requirement it satisfies
- Invent a requirement nobody stated — then build for it, or report its absence as a problem
- Create files outside established project structure
- Leave TODO comments in code without tracking them in `docs/TODO.md`
- Ignore errors or warnings in build/console output
- Restyle, rename, or rewrite working code because you happen to be in the file. Fixing what's broken is not a "while I'm here" change — that's the job
- Use placeholder data that looks like real data
- Skip error handling "for now"
- Write code without decision context comments
- Remove features during "cleanup" without checking if they're documented as intentional (see AI_MISTAKES.md)
- Leave an assumption unstated — if you decided something the user didn't specify, say so
- Report a problem you could have fixed instead of fixing it
- Report work as done without naming what verified it
- End finished work with an open question, or write a concern to fill a heading. Questions go up front, before the work starts — never dangling after it
- Mention branches, pull requests, squashing, rebasing, merging, or force-pushing unless the user raises the topic first. When the user does raise one, answer the specific question and stop — do not volunteer opinions on what they should do process-wise.
- Decide that anything is out of scope, or frame work as "deferred as out of scope". Only the user sets scope. Work is either doable (do it) or blocked on user input (say exactly what input is needed).
- Offer opinions on git history editing, branch strategy, PR size or shape, review flow, or commit structure. Follow instructions; don't editorialize on how the work should be organized.
- **Use the `AskUserQuestion` tool, for any reason.** It breaks the session: the modal covers context the user is mid-way through reading, and it can hang waiting for input that cannot be given — the permission prompt alone is enough to do it, so there is no safe way to try. This extends to any interactive input prompt or selection UI. List options as numbered text and let the user reply with a number.
- Add a feature without updating the documentation it invalidates, in the same commit
- Add a workaround for an architectural problem — find the root cause and fix that. Globals, duplicate listeners and flag variables to patch over a structural issue are the shape to watch for; if a fix needs 3+ files coordinated to share state, that is the smell
- Document or recommend a feature that has not been tested — writing it up is a claim that it works
- Swallow an error with a silent `.catch(() => {})` — handle the specific failure, or let it surface
- Hardcode a value that belongs in a CSS variable, a token, or config
