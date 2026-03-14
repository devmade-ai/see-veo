# see-veo

React + TypeScript + Vite PWA that displays a personal CV/resume.

## Tech Stack

- React 19 with TypeScript
- Vite 7 with `@vitejs/plugin-react`
- Tailwind CSS v4 via `@tailwindcss/vite` (no tailwind.config — all config is CSS-first in `src/index.css` using `@theme`)
- PWA via `vite-plugin-pwa` (Workbox service worker, web manifest)
- Vercel deployment (auto-deploys on push to `main`, configured via `vercel.json`)

## Project Structure

- `src/data/cv-data.ts` — All CV content and TypeScript interfaces. Edit this single file to update the resume.
- `src/components/` — One component per CV section (Hero, About, Experience, Education, Skills, Projects) plus feature components (ActivityCharts, ActivityTimeline, InterestForm, DebugBanner, UpdatePrompt, InstallInstructionsModal) and reusable helpers (Section, TimelineItem, SkillBadge).
- `src/hooks/` — Custom React hooks. `useRepoTorEmbed` loads repo-tor's `embed.js` helper script to auto-size chart iframes; `usePWAInstall` and `usePWAUpdate` for install/update prompts.
- `src/constants/embed.ts` — Centralized repo-tor embed configuration (base URL, script URL, chart colors).
- `src/utils/` — Shared utilities: `debugLog.ts` (pub/sub event store for mobile debugging), `pwa.ts` (browser detection, standalone check), `validation.ts` (email pattern, form payload validation).
- `src/index.css` — Tailwind import, custom `@theme` color tokens (dark palette), and print styles.
- `src/App.tsx` — Composes all sections into a single-page layout. No routing.
- `vite.config.ts` — Vite config with Tailwind plugin, PWA plugin, and Workbox runtime caching rules.
- `vercel.json` — Vercel deployment config with SPA rewrites.
- `vitest.config.ts` — Vitest config with jsdom environment, React plugin, and setup file (`src/test/setup.ts`).
- `src/test/` — Test files (Vitest + Testing Library).
- `.env.example` — Example environment variables (`VITE_INTEREST_API_URL`).

## Commands

- `npm run dev` — Start dev server
- `npm run build` — TypeScript check + production build (`tsc -b && vite build`)
- `npm run lint` — Run ESLint
- `npm run preview` — Preview production build locally
- `npm run test` — Run Vitest test suite
- `npm run test:watch` — Run Vitest in watch mode

## Key Decisions

- Dark theme only (no light/dark toggle). Colors defined via Tailwind v4 `@theme` tokens.
- Single-page app with no client-side routing.
- PWA `scope` and `start_url` use `/` — Vercel serves at root, no base-path prefix needed.
- Print styles in `src/index.css` override to white background. Elements with class `no-print` are hidden when printing.
- Interest notification form (`InterestForm` component, rendered inline after Education) — POSTs to an **external** API endpoint (separate project, not part of this repo) configured via `VITE_INTEREST_API_URL` env variable. Hidden when printing. Degrades gracefully when API is not configured or offline. Client-side validation via shared `validatePayload` utility before network requests.

---

## Hard Rules

These rules are non-negotiable. Stop and ask before proceeding if any rule would be violated.

### Before Making Changes

- Read relevant existing code and documentation first
- Ask clarifying questions if scope, approach, or intent is unclear
- Confirm understanding before implementing non-trivial changes
- Never assume — when in doubt, ask

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

### Quality Checks

During every change, actively scan for:
- Error handling gaps
- Edge cases not covered
- Inconsistent naming
- Code duplication that should be extracted
- Missing input validation at boundaries
- Security concerns (XSS via dangerouslySetInnerHTML, unsanitized user input)
- Performance issues (unnecessary re-renders, missing keys, large re-computations)

Report findings even if not directly related to current task.

### Documentation

**AI assistants automatically maintain these documents.** Update them as you work — don't wait for the user to ask. This ensures context is always current for the next session.

- Update relevant documentation with every code change
- All documentation lives in `/docs` directory
- Plans, notes, and scratch files go in `/docs/working`
- Never write docs or plans to root directory or random locations
- This CLAUDE.md must reflect current project state at all times

#### `CLAUDE.md`

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

#### `docs/SESSION_NOTES.md`

**Purpose:** Compact context summary for session continuity (like `/compact` output).
**When to read:** At the start of a session to quickly understand what was done previously.
**When to update:** Rewrite at session end with a fresh summary. Clear previous content.
**What to include:**

- **Worked on:** Brief description of focus area
- **Accomplished:** Bullet list of completions
- **Current state:** Where things stand (working/broken/in-progress)
- **Key context:** Important info the next session needs to know

**Why:** Enables quick resumption without re-reading entire codebase. Not a changelog — a snapshot.

#### `docs/TODO.md`

**Purpose:** AI-managed backlog of ideas and potential improvements.
**When to read:** When looking for work to do, or when the user asks about pending tasks.
**When to update:** When noticing potential improvements. Move completed items to HISTORY.md.
**What to include:**

- Group by category (Features, UX, Technical, etc.)
- Use `- [ ]` for pending items only
- Brief description of what and why
- When complete, move to HISTORY.md (don't keep in TODO)

**Why:** User reviews this to prioritize work. Keeps TODO focused on pending items only.

#### `docs/HISTORY.md`

**Purpose:** Changelog and record of completed work.
**When to read:** When you need historical context about why something was built a certain way.
**When to update:** When completing TODO items or making significant changes.
**What to include:**

- Completed TODO items (organized by category)
- Bug fixes and changes (organized by date)
- Brief description of what was done

**Why:** Historical context separate from active TODO. Tracks what's been accomplished.

#### `docs/USER_ACTIONS.md`

**Purpose:** Manual actions requiring user intervention outside the codebase.
**When to read:** When something requires manual user intervention (deployments, API keys, external config).
**When to update:** When tasks need external action. Clear when completed.
**What to include:**

- Action title and description
- Why it's needed
- Steps to complete
- Keep empty when nothing pending (with placeholder text)

**Why:** Some tasks require credentials, dashboards, or manual config the AI can't do.

#### `docs/AI_MISTAKES.md`

**Purpose:** Record significant AI mistakes and learnings to prevent repetition.
**When to read:** When starting a session, to avoid repeating past mistakes.
**When to update:** After making a mistake that wasted time or broke things.
**What to include:**

- What went wrong
- Why it happened
- How to prevent it
- Date (for context)

**Why:** AI assistants repeat mistakes across sessions. This document builds institutional memory.

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

---

## Communication Style

- Direct, concise responses
- No filler phrases or conversational padding
- State facts and actions, not opinions
- Ask specific questions with concrete options when clarification needed
- Never proceed with assumptions on ambiguous requests

---

## External Dependencies

### repo-tor Embed Charts

The `ActivityCharts` component embeds charts from [devmade-ai/repo-tor](https://github.com/devmade-ai/repo-tor) via iframes. Full embed documentation lives in that repo's `docs/` folder. To fetch these docs in a session:

```bash
# Implementation details (architecture, URL params, color system)
WebFetch: https://raw.githubusercontent.com/devmade-ai/repo-tor/main/docs/EMBED_IMPLEMENTATION.md

# Quick reference (all embed IDs, chart types, color customization)
WebFetch: https://raw.githubusercontent.com/devmade-ai/repo-tor/main/docs/EMBED_REFERENCE.md
```

A local summary with all embed IDs, URL params, and available palettes is at `docs/EXTERNAL_REFERENCES.md`.

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

**Excluded repos** (not shown in Projects):
- `glow-props` — excluded by owner
- `canva-grid-assets` — asset storage, not a standalone project
- `plant-fur` — excluded by owner
- `coin-zapp` — excluded by owner
- `tool-till-tees` — excluded by owner
- `chatty-chart` — excluded by owner
- `see-veo` — this repo (the CV site itself)

---

## Suggested Implementations

Reference patterns for features that should be implemented across all projects. These describe the architecture and behavior to follow — adapt file names and frameworks to the specific project.

### PWA System

Four parts, built on `vite-plugin-pwa` (^0.21.1) with React. Adapt patterns for other frameworks.

#### Vite Config (`vite.config.ts`)

```typescript
import { VitePWA } from 'vite-plugin-pwa'

// Inside defineConfig plugins array:
VitePWA({
  registerType: 'prompt',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
  manifest: {
    name: 'Your App',
    short_name: 'App',
    description: 'Description here',
    id: '/',
    theme_color: '#10b981',
    background_color: '#ffffff',
    display: 'standalone',
    scope: '/',
    start_url: '/',
    prefer_related_applications: false,
    icons: [
      { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: 'pwa-1024x1024.png', sizes: '1024x1024', type: 'image/png', purpose: 'maskable' }
    ]
  }
})
```

- **`registerType: 'prompt'`**: Users control when updates apply. `autoUpdate` silently refreshes mid-work.
- **`id`**: Stable app identity. Without it, Chrome derives from `start_url` — breaks on config changes or redeployments.
- **`prefer_related_applications: false`**: Without this, Chrome may skip `beforeinstallprompt` if it thinks a native app exists.
- **Separate icon purposes**: `any` for standard display (192, 512), `maskable` for full-bleed (1024). Never combine `"any maskable"` — browsers pick the wrong one. Use a dedicated 1024x1024 for maskable.

#### Install Prompt Race Condition (`index.html`)

`beforeinstallprompt` fires once. On repeat visits with a cached SW, it fires before the framework mounts — if nothing catches it, the install prompt is permanently lost.

Inline classic (non-module) script before any `<script type="module">`:

```html
<script>
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    window.__pwaInstallPromptEvent = e;
  });
</script>
```

Executes synchronously during HTML parse. Stashes the event for the React hook to consume. `e.preventDefault()` suppresses the browser's default mini-infobar. The hook's fallback `useEffect` listener handles first-visit timing (SW registers after mount). Neither alone covers both cases.

#### Service Worker Updates (`usePWAUpdate.ts`)

Wraps `vite-plugin-pwa`'s React hook. Exposes `hasUpdate` boolean and `updateApp()`. Checks for new SW versions every 60 minutes. Offline-ready auto-dismisses after 3 seconds.

#### Install Detection (`usePWAInstall.ts`)

Detects browser, captures `beforeinstallprompt` (consuming the early-captured event from `index.html`), tracks install analytics. Hides prompt when already installed or dismissed.

#### Key Lessons

1. **Never combine `"any maskable"` in icon purpose** — use separate entries with a dedicated 1024x1024 for maskable.
2. **Set `id` explicitly** in the manifest — Chrome derives it from `start_url` otherwise.
3. **The inline script in `index.html` is essential** — without it, repeat visitors on Chromium lose the install prompt.
4. **`registerType: 'prompt'`** gives users control. `autoUpdate` silently refreshes mid-work.
5. **Clean up all timers** — every `setTimeout`/`setInterval` in `useEffect` needs cleanup. Nested timeouts need the array pattern or mounted ref guard.

### App Icons from SVG Source

Single SVG source file, Sharp converts to all needed PNG sizes at 400 DPI for crisp edges. One command regenerates everything.

**Dependencies:** `sharp` (devDependency)

**Run:** `node scripts/generate-icons.mjs`

**SVG design rules for maskable icons:**
- Canvas must be square (e.g. `viewBox="0 0 1024 1024"`)
- Add `shape-rendering="geometricPrecision"` to the root `<svg>` element
- Background fills entire canvas (no transparency)
- Important content stays within the inner 80% (safe zone for maskable crop)
- Design must be legible at 48px (favicon) — avoid fine details

### Download as PDF (via `window.print()`)

Zero-dependency PDF download using the browser's native print dialog. No PDF libraries needed — the user selects "Save as PDF" from their system print dialog.

Three pieces: a trigger button, a `no-print` utility class, and print-friendly CSS overrides.

1. A button that calls `window.print()`
2. `@media print` CSS rules with `.no-print { display: none !important; }`
3. `break-inside: avoid` on content blocks you don't want split across pages

#### Key Lessons

1. **No library needed** — `window.print()` opens the system print dialog, which includes "Save as PDF" on all major browsers.
2. **`!important` is justified here** — print overrides must win against inline styles and dark mode classes.
3. **Test in print preview** — use Ctrl/Cmd+P to verify layout before committing.
4. **`break-inside: avoid` on sections** — prevents awkward mid-section page breaks.
5. **Hide the download button itself** — the button that triggers `window.print()` should be inside a `no-print` container.

### Fix: Timer Leaks on Unmount (Nested Timeouts)

Debounce patterns using `setTimeout` leak when a component unmounts mid-timeout. The nested case is worse: a timeout callback sets *another* timeout, and cleaning up only the outer one leaves the inner one orphaned.

**Fix — track all timeout IDs:**
```typescript
useEffect(() => {
  const timeouts: ReturnType<typeof setTimeout>[] = [];

  const outer = setTimeout(() => {
    doSomething();
    const inner = setTimeout(() => save(), 500);
    timeouts.push(inner);
  }, 300);
  timeouts.push(outer);

  return () => timeouts.forEach(clearTimeout);
}, [value]);
```

**General rule:** Every `setTimeout`, `setInterval`, `addEventListener`, or `subscribe` call inside a `useEffect` needs a corresponding cleanup in the return function. If callbacks create *new* async operations, those need cleanup too.

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

## Workflow

1. **Receive task** — Ask clarifying questions if needed
2. **Plan** — Write plan to `/docs/working` if task is non-trivial
3. **Implement** — Follow all hard rules above
4. **Verify** — Run `npm run build` to confirm TypeScript and build pass; run tests if configured
5. **Document** — Update all affected documentation (this file, `/docs`, etc.)
6. **Report** — Summarize changes and any issues found

---

## AI Notes

- Always read a file before attempting to edit it
- Check for existing patterns in the codebase before creating new ones
- Commit and push changes before ending a session
- Clean up completed or obsolete docs/files and remove references to them
- **ASK before assuming.** When a user reports a bug, ask clarifying questions (which mode? what did you type? what do you see?) BEFORE writing code. Don't guess the cause and build a fix on an assumption — you'll waste time fixing the wrong thing. One clarifying question saves multiple wrong commits.
- **Always read files before editing.** Use the Read tool on every file before attempting to Edit it. Editing without reading first will fail.
- **Communication style:** Direct, concise responses. No filler phrases or conversational padding. State facts and actions. Ask specific questions with concrete options when clarification is needed.
- **Claude Code mobile/web — accessing sibling repos:**
  - Use `GITHUB_ALL_REPO_TOKEN` with the GitHub API (`api.github.com/repos/devmade-ai/{repo}/contents/{path}`) to read files from other devmade-ai repos
  - Use `$(printenv GITHUB_ALL_REPO_TOKEN)` not `$GITHUB_ALL_REPO_TOKEN` to avoid shell expansion issues
  - Never clone sibling repos — use the API instead

---

## Triggers

Single-word commands that invoke focused analysis passes. Each trigger has a short alias. Type the word or alias to activate.

| # | Trigger | Alias | What it does |
|---|---------|-------|--------------|
| 1 | `review` | `rev` | Code review — bugs, UI, UX, simplification |
| 2 | `audit` | `aud` | Code quality — hacks, anti-patterns, latent bugs, race conditions |
| 3 | `docs` | `doc` | Documentation accuracy vs actual code |
| 4 | `mobile` | `tap` | Mobile UX — touch targets, viewport, safe areas |
| 5 | `clean` | `cln` | Hygiene — duplication, refactor candidates, dead code |
| 6 | `performance` | `perf` | Re-renders, expensive ops, bundle size, DB/API, memory |
| 7 | `security` | `sec` | Injection, auth gaps, data exposure, insecure defaults, CVEs |
| 8 | `debug` | `dbg` | Debug pill coverage — missing logs, noise |
| 9 | `improve` | `imp` | Open-ended — architecture, DX, anything else |
| 10 | `start` | `go` | Sequential sweep of all 9 above, one at a time |

### Trigger behavior

- Each trigger runs a single focused pass and reports findings.
- Findings are listed as numbered text — never interactive prompts or selection UIs.
- One trigger per response. Never combine multiple triggers in a single response.

### `start` / `go` behavior

Runs all 9 triggers in priority sequence, one at a time:

`rev` → `aud` → `doc` → `tap` → `cln` → `perf` → `sec` → `dbg` → `imp`

After each trigger completes and findings are presented, the user responds with one of:
1. `fix` — apply the suggested fixes, then move to the next trigger
2. `skip` — skip this trigger's findings and move to the next trigger
3. `stop` — end the sweep entirely

Rules:
- Always pause after each trigger — never auto-advance to the next one.
- Never run multiple triggers in one response.
- Wait for the user's explicit `fix`, `skip`, or `stop` before proceeding.

---

## Prohibitions

Never:
- Start implementation without understanding full scope
- Create files outside established project structure
- Leave TODO comments in code without tracking them in `docs/TODO.md`
- Ignore errors or warnings in build/console output
- Make "while I'm here" changes without asking first
- Use placeholder data that looks like real data
- Skip error handling "for now"
- Write code without decision context comments
- Remove features during "cleanup" without checking if they're documented as intentional (see AI_MISTAKES.md)
- Proceed with assumptions when a single clarifying question would prevent a wrong commit
- Use interactive input prompts or selection UIs — list options as numbered text instead
