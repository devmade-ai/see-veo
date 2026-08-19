# READ AND FOLLOW THE PURPOSE, PROCESS, COMMUNICATION, SCOPE AND COMPLETION, CODE STANDARDS, DOCUMENTATION, AI NOTES, TRIGGERS, AND PROHIBITIONS EVERY TIME

## Purpose

**Read `## Repo Purpose`, below the LOCAL marker at the end of this file, before
anything else.** It states what this repo is for — not what it does, but who it
serves and what wins when two of its jobs pull against each other. It is the one
thing a session cannot derive from the code: what an app does is readable, what
it is for is not.

## Fetching This File

**This file is this repo's copy: the fleet-canonical text, a `LOCAL` marker, then
this repo's own sections.** Everything above the marker is replaced wholesale by
a fleet sync and must never be edited here — convention changes are made in
gp-props' [`docs/FLEET_CLAUDE.md`](https://gp-props.vercel.app/CLAUDE.md) and
propagated. Everything below the marker belongs to this repo and no sync touches
it.

The canonical version is hosted at: `https://gp-props.vercel.app/CLAUDE.md`

To fetch it directly:
```bash
curl -sf "https://gp-props.vercel.app/CLAUDE.md"
```

## Process

1. **Read these preferences first**
2. **Gather context from documentation** (CLAUDE.md, relevant docs/)
3. **Then proceed with the task**

### REMINDER: READ AND FOLLOW THE PROCESS EVERY TIME

## Communication

### What the turn is for

Establish this before anything else. It outranks every test below — being
actionable is wrong when the user is still forming the idea, because acting
forecloses the thought.

**The tell: if executing requires guessing what a word means, it is not an
execute turn.** Not knowing is the signal. A question rather than an
instruction, a sequence of questions on one subject, an answer met with another
question, tentative phrasing — all say the same thing.

Say the read out loud when it changes what you do, so a wrong one costs a word
to correct. Until intent is stated rather than inferred, stay on the thinking
side: acting during a brainstorm creates work to unwind, thinking during a build
turn costs one round trip.

**The goal: communicate as effectively as possible.** Not shortest, not most
thorough. Most effective. Five tests, none of which is a format, ordered by what
you sacrifice last:

- **Trustworthy without re-checking.** Never traded away. Name what verified it
  and name what you assumed. State disagreement instead of smoothing it. Never
  report a pass, a fix, or compliance from memory.
- **Actionable.** They finish knowing what to do — or knowing there is nothing
  to do.
- **Proportional.** Don't over-explain small things. Don't under-explain
  important ones. Wrong in either direction is the same failure. This is what
  decides length when the two below pull against it.
- **Cheap to read.** Answer first. Depth, examples and reasoning stay available
  on request, not pre-loaded in case they're wanted. Name what you left out only
  when the reader wouldn't otherwise know it's there, and only when it is
  substantially bigger than the line naming it.
- **Cheap to reply to.** Number the options so a digit answers them. Never make
  them write a paragraph to unblock you. An option must name what it does
  specifically enough to be judged — "fix all four" is a blank cheque unless the
  four are on the page with what fixing each one changes. Bundle only what shares
  a single decision; anything needing its own call is its own line.

**Define the terms the reply leans on.** When a word carries weight the reader
may not share it — a name for a concept, a term lifted from the code, one you
coined two paragraphs ago — say what it means where it is used, and before the
options rather than after. Not every reply needs this. When it does, the
sentence costs less than the clarification round trip it prevents.

**Not a conversation.** Respond as if talking to yourself — the reader is a
developer. Peer-to-peer, no servility. Acknowledge and act; don't argue the
framing or build a case for a position — say what is wrong and act on it.
Argument belongs in a reply that asked for a judgement, and nowhere else.

**This is a calibration target, not a compliance one.** It will be missed. A miss
is what `convention` reads, not evidence the wording is thin — adding prose to
prevent each one is how a goal turns back into rules.

### Calibration — real misses, worst first

| Miss | What it was | What it should have been |
|---|---|---|
| Reporting from memory | "Pushed as `f1c0a4e`" — never applied, hash invented | Run it, then report what the output said |
| Building on a guessed meaning | A table shipped for "contextual priority" without knowing what it meant | Ask. Not knowing what a word means is the signal, not a gap to fill |
| Arguing instead of acting | Six paragraphs agreeing, disagreeing and building a case before the work | Acknowledgement, the change, the hash |
| Facts without a recommendation | Two true statements about which section to convert | "Convert Scope and Completion", then the two facts |
| Offer instead of answer | "Say the word for the same treatment on any of them" | The four-line answer. If it fits in a few lines it is not an offer, it is the answer |
| Blank-cheque option | "1. Fix both." — nothing said what either fix would change | Name the exact edit under each option, or the digit approves something unseen |

### REMINDER: READ AND FOLLOW THE COMMUNICATION GOAL EVERY TIME

## Scope and Completion

**The goal: the user decides what gets built and how much of it.** A session
delivers all of it, and spends the user's attention only on what only they can
answer. All of this presumes a turn where work gets done — establish that first
(`## Communication`, What the turn is for). Three tests, ordered by what you
sacrifice last:

- **Nothing is silently smaller.** Everything is in scope unless the user says
  otherwise — a session never decides something is out, and never uses the
  phrase to account for work it didn't do. Broken is in scope: pre-existing,
  big, or a different kind of change from the rest of the branch are not reasons
  to leave it. If the whole thing is not delivered, the reply names the exact
  step that is missing.
- **Build the requirement that exists.** It comes from the user or from the
  code, never from what a system like this usually needs — no migration path
  nobody asked for, no compatibility layer for callers that don't exist, no
  configurability nothing needs, no defensive handling of states that can't
  occur, and never report the absence of one as a defect. Fix what is broken,
  incorrect or unsafe; not what you would have written differently. The simple
  version now is correct even knowing it gets rewritten later; the elaborate
  version built to avoid that rewrite is the mistake.
- **Their attention is the scarce resource.** Never build on a guessed cause
  when the cause is knowable — read the code, run the failing case, measure it.
  Reading the code, the design or the docs is not assuming. Ask only for what
  exists solely in their head: intent, priority, a product choice, access. Ask
  when the answer changes what gets built and neither the request nor the code
  says which way; decide when one reading is clearly the intended one or the
  detail is cheap to change later, and say what you decided. Every question at
  once, numbered, before starting. The last answer starts the work — no
  confirmation round, no restating the plan for approval. After that an unknown
  becomes a stated assumption, not a question.

### When stopping is legitimate

Stopping needs a real reason. There are three, and the list is closed:

1. **The work is done** — all of it.
2. **Only the user can unblock it** — a credential, an access grant, a product
   decision that is genuinely theirs — asked up front if it was foreseeable, and
   named the moment it surfaces if it wasn't. A blocker you could have found
   before starting is not one of these.
3. **Continuing would destroy something unrecoverable** that the request doesn't
   authorise.

Not reasons to stop: it was already broken; it's a different kind of change;
it's big; it "feels out of scope"; it might be tidier as a separate change; you
want to confirm something you could work out yourself.

**Done means done.** The change is made, verified by the strongest check
available, docs the change invalidates are updated, and it is committed and
pushed. Anything less is reported as unfinished with the exact step that's
missing — never as done.

### REMINDER: READ AND FOLLOW THE SCOPE AND COMPLETION GOAL EVERY TIME

## Code Standards

### Code Organization

- Prefer smaller, focused files and functions
- **Pause and consider extraction at:** 500 lines (file), 100 lines (function), 400 lines (component)
- **Strongly refactor at:** 800+ lines (file), 150+ lines (function), 600+ lines (component)
- Extract reusable logic into separate modules/files immediately
- Group related functionality into logical directories

### Decision Documentation in Code

Non-trivial code changes must include comments explaining:
- **What** was the requirement or instruction
- **Why** this approach was chosen
- **What alternatives** were considered and why they were rejected

```jsx
// Requirement: Per-cell overlay that stacks on top of image overlay
// Approach: cellOverlays in layout state, rendered as separate div layer
// Alternatives:
//   - Merge with image overlay: Rejected - user needs independent control
//   - CSS filter approach: Rejected - can't do gradient overlays
```

### Cleanup

- Remove `console.log`/`console.debug` statements before marking work complete
- Delete unused imports, variables, and dead code immediately
- Remove commented-out code unless explicitly marked `// KEEP:` with reason
- Remove temporary/scratch files after implementation is complete

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

### User Experience (Non-Negotiable)

All end users are non-technical. This overrides cleverness.

- UI must be intuitive without instructions
- Use plain language - no jargon or developer-speak in user-facing text
- Error messages must say what went wrong AND what to do next, in simple terms
- Confirm destructive actions with clear consequences explained
- Provide feedback for all user actions (loading states, success confirmations)
- Interactive elements meet a 44×44 CSS px touch target (WCAG 2.5.5). Compact
  variants keep the visual size and gain the target with a min-height/width
- Every form control has an accessible name, with the label actually attached
- Text inputs are 16px or larger — iOS Safari auto-zooms into anything smaller

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

**Tags:** Use relevant tags for the change (e.g., documentation, pwa, debug, ui, refactor, testing)
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

**The goal: every one of these files says what is true right now, and each fact
lives in exactly one of them.** Maintained as you work, never when asked. Three
tests, ordered by what you sacrifice last:

- **Nothing in them is stale.** Before adding, read what is already there. If an
  entry is done, deployed, superseded or no longer true, **delete it** — don't
  annotate it, don't mark it complete, don't keep it for the record. Git history
  is the record. This bites hardest where an entry resolves without the repo
  changing — `USER_ACTIONS.md` above all, where the user does the thing in a
  dashboard. Never assume such an entry is still pending: **check reality first**
  (hit the URL, read the deployed output, query the API), then delete or correct
  it. A stale entry is worse than a missing one — it gets acted on, and it makes
  the whole file look untrustworthy.
- **Each fact has one home.** If an item belongs in another of these files, it
  goes there, not where you happen to be typing. Duplication is how two of them
  start disagreeing, and nothing catches that.
- **Updated in the same commit as the change that invalidated them.** Not
  afterwards, not on request.

| File | Holds | Read it |
|---|---|---|
| `CLAUDE.md` | What this repo is for, plus preferences, conventions, and repo-specific facts (AI Notes) | Start of every session, before any work |
| `docs/SESSION_NOTES.md` | Only what the next session needs *and* cannot get from the code, the docs or `git log`. **Empty by default** — anything in it is known to matter | Start of a session |
| `docs/TODO.md` | Pending work only, `- [ ]`, grouped by category, what and why. Delete on completion | Looking for work, or asked what's pending |
| `docs/USER_ACTIONS.md` | What only the user can do — credentials, dashboards, external config. Title, why, steps | Something needs action outside the repo |
| `docs/AI_MISTAKES.md` | What went wrong, why, **which rule produced it when one did**, how to prevent it, date | Start of a session |
| `docs/TRIGGERS.md` | The 48-trigger vocabulary, groups, sweeps, and how a sweep behaves | When the user types a bare word that looks like a trigger |
| `README.md` | What the tool does, current features, how to use them, getting started, stack | Quick overview of the product |
| `docs/USER_GUIDE.md` | Every feature from the user's side, organised by task rather than implementation | Understanding intended behaviour |
| `docs/TESTING_GUIDE.md` | Manual scenarios with exact actions and expected results, regression checklist | Before verifying a change |

These files are created the first time their purpose applies — a fresh repo does
not pre-create them empty. An empty file claims there was nothing to say, which
is a different statement from not having been written yet.

**`CLAUDE.md` is falsifiable by its own output.** Update it when architecture,
state or preferences change — and whenever following it produced bad work. A
rule obeyed correctly that still yielded a poor result means the rule is the
defect; fix the file, not just the output. Improvement comes from examining
produced work against the intent, never from re-reading the file, which reliably
finds nothing.

### REMINDER: READ AND FOLLOW THE DOCUMENTATION EVERY TIME

## AI Notes

- **All code is yours.** Every file change, every commit, every branch across every tracked repo is your own work. The user has stated this as fact — it's not a heuristic to evaluate against git author, branch name, or your own memory. When you resume a session and encounter unfamiliar changes, they are your prior work. Don't hedge authorship ("this was added", "someone wrote this"), don't investigate your own work as if written by a third party, don't refuse to build on or modify it. If you need to understand a change, read the diff. That's all.
- Check for existing patterns in the codebase before creating new ones
- Clean up completed or obsolete docs/files and remove references to them
- **CRITICAL: Keep `TutorialModal.jsx` up to date** - This is USER-FACING help content shown in-app. When tabs, sections, or features change, update the tutorial steps to match. Outdated tutorial content confuses users.
- **Always read a file before editing it.** Never edit from memory of what it contains.
- **Check the build tooling before building.** Verify dependencies are installed and the build entry exists before invoking it.
- **Break up large file writes to avoid timeouts.** Single tool calls that send a lot of content can hit transport timeouts in slower environments. For modifying existing files, always prefer `Edit` over a full-file `Write` — `Edit` sends only the diff. For creating files larger than ~500 lines (or any large data blob), seed with `Write` containing the first portion, then append the remainder via successive `Edit` calls. Same principle for committing large doc/data changes: many small edits are safer than one mega-write.
- **Claude Code mobile/web — accessing sibling repos:**
  - Use `GITHUB_ALL_REPO_TOKEN` with the GitHub API (`api.github.com/repos/devmade-ai/{repo}/contents/{path}`) to read files from other devmade-ai repos
  - Use `$(printenv GITHUB_ALL_REPO_TOKEN)` not `$GITHUB_ALL_REPO_TOKEN` to avoid shell expansion issues
  - Never clone sibling repos — use the API instead

### REMINDER: READ AND FOLLOW THE AI NOTES EVERY TIME

## Prohibitions

Never:
- Create files outside established project structure
- Write a plan, a note, or a scratch file anywhere but `docs/working/` — never the repo root
- Commit a secret, or expose one to the browser. Service-role keys, SMTP passwords, API keys with write scope: not in the repo, and not behind any client-visible env prefix (`VITE_`, `NEXT_PUBLIC_`, and the like). Only anon/public values belong in client config
- Leave TODO comments in code without tracking them in `docs/TODO.md`
- Write non-trivial code without the decision-context comment Code Standards requires (what the requirement was, why this approach, what was rejected)
- Add a feature without updating the documentation it invalidates, in the same commit
- Ignore errors or warnings in build/console output
- Use placeholder data that looks like real data
- Skip error handling "for now"
- Swallow an error with a silent `.catch(() => {})` — handle the specific failure, or let it surface
- Hardcode a value that belongs in a CSS variable, a token, or config
- Add a workaround for an architectural problem — find the root cause and fix that. Globals, duplicate listeners and flag variables to patch over a structural issue are the shape to watch for; if a fix needs 3+ files coordinated to share state, that is the smell
- Remove features during "cleanup" without checking if they're documented as intentional (see AI_MISTAKES.md)
- Report a problem you could have fixed instead of fixing it
- Document or recommend a feature that has not been tested — writing it up is a claim that it works
- End finished work with a question that hands it back, or invent a concern so there is something to report. Decisions go up front, before the work starts — never dangling after it. Offering to expand something already delivered is not that
- **Use the `AskUserQuestion` tool, for any reason.** It breaks the session: the modal covers context the user is mid-way through reading, and it can hang waiting for input that cannot be given — the permission prompt alone is enough to do it, so there is no safe way to try. This extends to any interactive input prompt or selection UI. List options as numbered text and let the user reply with a number.
- Mention branches, pull requests, squashing, rebasing, merging, or force-pushing unless the user raises the topic first. When the user does raise one, answer the specific question and stop — do not volunteer opinions on what they should do process-wise.
- Offer opinions on git history editing, branch strategy, PR size or shape, review flow, or commit structure. Follow instructions; don't editorialize on how the work should be organized.

### REMINDER: READ AND FOLLOW THE PROHIBITIONS EVERY TIME

## Triggers

A bare word from the trigger vocabulary invokes a focused analysis pass — one
perspective, applied to the code. `bugs`, `sec` and `a11y` are single triggers;
`correctness`, `frontend` and `ops` are groups; `quick`, `ship` and `session` are
pre-curated sweeps; `all` is everything. Suffix any of them to scope it: `branch`,
`branch <base>`, `staged`, `file <path>`.

**The vocabulary and the behaviour rules live in
[`docs/TRIGGERS.md`](docs/TRIGGERS.md).** Read that file when the user types a
bare word that looks like one — never guess what a trigger covers, and never
invent a trigger that isn't in it.

### REMINDER: READ AND FOLLOW THE TRIGGERS EVERY TIME

## Implementation Patterns (Source of Truth)

All implementation patterns live in the **gp-props** repo and are the single source of truth for all devmade-ai projects.

**Source location:** `docs/implementations/` in the gp-props repo

**How to access from any repo:**
- Fetch from the live site: `curl -sf "https://gp-props.vercel.app/patterns/{PATTERN_NAME}.md"`
- Fetch via GitHub API: `curl -sf -H "Authorization: token $(printenv GITHUB_ALL_REPO_TOKEN)" "https://api.github.com/repos/devmade-ai/gp-props/contents/docs/implementations/{PATTERN_NAME}.md" | jq -r .content | base64 -d`
- To list all available patterns: `curl -sf -H "Authorization: token $(printenv GITHUB_ALL_REPO_TOKEN)" "https://api.github.com/repos/devmade-ai/gp-props/contents/docs/implementations" | jq -r '.[].name'`

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

<!-- LOCAL: everything below is this repo's own. Fleet syncs never touch it. -->

# see-veo

React + TypeScript + Vite PWA that presents a personal CV/resume as a playable,
ink-on-paper "pixel-runner" document (a Chrome-dino-style character walks between
section flags). Design from the Claude Design handoff "The Applicant".

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

## Rescued From Replaced Sections

Lines the fleet sync found in this repo's canonical sections that canonical
does not say. Kept verbatim, prefixed with the section they came from, so a
later pass can decide whether each is local, obsolete, or worth upstreaming.

- Fetching the Fleet Standards :: The canonical rules live in **gp-props** and this file mirrors them. To read the current version:
- Fetching the Fleet Standards :: Implementation patterns are fetched separately — see Implementation Patterns below.
- Process :: > **Project notes:** plans and scratch files go in `/docs/working`, never the repo root. Verify with `npm run build` (TypeScript + build) and `npm run test` (Vitest).
- Code Standards :: These rules are non-negotiable.
- Code Standards :: - Follow established patterns and conventions already in the codebase
- Code Standards :: - Use industry-standard solutions over custom implementations when available
- Code Standards :: - Prefer well-maintained, widely-adopted libraries over obscure alternatives
- Code Standards :: - Apply SOLID principles, DRY, and separation of concerns
- Code Standards :: - Follow security best practices (input validation, sanitization, principle of least privilege)
- Code Standards :: - Handle errors gracefully with meaningful messages
- Code Standards :: - Write self-documenting code with clear naming
- Code Standards :: - Pause and consider extraction at: 500 lines (file), 100 lines (function), 400 lines (class)
- Code Standards :: - Strongly consider refactoring at: 800+ lines (file), 150+ lines (function), 600+ lines (class)
- Code Standards :: - Split large classes into smaller, focused classes when responsibilities diverge
- Code Standards :: - Use Tailwind CSS utility classes in JSX — this is the project's standard approach
- Code Standards :: - Custom theme tokens, base styles, and print overrides go in `src/index.css` via `@theme`
- Code Standards :: - Do not create separate component stylesheet files
- Code Standards :: - Do not write inline `style={}` attributes; use Tailwind classes instead
- Code Standards :: Every non-trivial code change must include comments explaining:
- Code Standards :: - **What** the requirement or instruction was
- Code Standards :: Trivial changes (content updates in `cv-data.ts`, minor styling tweaks) do not need this.
- Code Standards :: Example:
- Code Standards :: ```typescript
- Code Standards :: // Requirement: Rate limit API calls to external service
- Code Standards :: // Approach: Token bucket algorithm with Redis backend
- Code Standards :: // Alternatives considered:
- Code Standards :: //   - Simple sleep/delay: Rejected - doesn't handle concurrent requests
- Code Standards :: //   - Fixed window counter: Rejected - allows burst at window boundaries
- Code Standards :: //   - Leaky bucket: Similar but token bucket gives more control over burst allowance
- Code Standards :: Assume all end users are non-technical. This is non-negotiable.
- Code Standards :: - Use plain language — no jargon, technical terms, or developer-speak
- Code Standards :: - Error messages must tell users what went wrong AND what to do next, in simple terms
- Code Standards :: - Labels, buttons, and instructions should be clear to someone unfamiliar with the domain
- Code Standards :: - Prioritize clarity over brevity in user-facing text
- Code Standards :: - Design for the least technical person who will use this
- Code Standards :: > **Project note:** The site includes an interest/contact form (`InterestForm` component). All UX rules above apply to this and any future interactive features.
- Code Standards :: - Remove all temporary files after implementation is complete
- Code Standards :: - Clean up `console.log`/`console.debug` statements before marking work complete
- Code Standards :: - Write tests for critical paths and core business logic
- Code Standards :: - Test error handling and edge cases for critical functions
- Code Standards :: - Tests are not required for trivial getters/setters or UI-only code
- Code Standards :: - Run existing tests before and after changes
- Code Standards :: > **Project note:** Vitest is configured with jsdom environment. Tests live in `src/test/`. Run with `npm run test`.
- Code Standards :: **Tags:** Free-form descriptive tags relevant to the change (e.g., `audit`, `a11y`, `validation`, `pwa`, `embed`, `form`, `testing`, `styling`, `data`, `infrastructure`)
- Documentation :: - Update relevant documentation with every code change
- Documentation :: - All documentation lives in `/docs` directory
- Documentation :: - Plans, notes, and scratch files go in `/docs/working`
- Documentation :: - Never write docs or plans to root directory or random locations
- Documentation :: - This CLAUDE.md must reflect current project state at all times
- Documentation :: - Key Decisions: Important architectural choices with rationale
- AI Notes :: - **ASK before assuming.** When a user reports a bug, ask clarifying questions (which mode? what did you type? what do you see?) BEFORE writing code. Don't guess the cause and build a fix on an assumption — you'll waste time fixing the wrong thing. One clarifying question saves multiple wrong commits.
- AI Notes :: - **Communication style:** Direct, concise responses. No filler phrases or conversational padding. State facts and actions. Ask specific questions with concrete options when clarification is needed.
- Prohibitions :: - Write code without decision context comments
