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
- **PWA updates follow the fleet auto-on-launch policy** (glow-props `docs/implementations/PWA_SYSTEM.md` → "Update Application Policy"). `registerType` stays `'prompt'` (the mechanism); `usePWAUpdate` is the policy: a worker already **waiting when the app starts** is applied silently (SKIP_WAITING posted to `registration.waiting`, one reload via the latch-gated `controllerchange` backstop + vite-plugin-pwa's own `controlling` listener), gated on the persisted **"Automatic updates"** preference (localStorage `jt-cv-auto-update`, absent = ON, try/catch-safe) and a 30s `sessionStorage` `jt-cv-pwa-updated` just-updated suppression. Updates detected **mid-session** (hourly poll + visibilitychange check) never reload — they arm the `UpdatePrompt` banner; the waiting worker applies on the next launch. **UI placement (no menu/settings surface exists):** the "Automatic updates" checkbox lives inside the `UpdatePrompt` banner (visible whenever the prompt shows); the **"Check for updates"** action (typed result `'no-sw' | 'up-to-date' | 'update-available' | 'error'`, `registration.update()` + ~1500ms settle) lives in the **Contact level next to the install affordance** — the app-management corner of the CV — with an always-mounted `role="status"` result line. The header SFX/PDF cluster was rejected as placement (primary game chrome; a third utility button adds noise).
- Print styles in `src/index.css` swap the game shell (`print:hidden`) for `CvPrintDoc` (a clean printed CV). `.no-print` also hides fixed chrome.
- Contact: the `InterestForm` (kept from the previous app, restyled) lives in the **Contact level**, alongside mailto + LinkedIn/GitHub links and the PWA install affordance. POSTs to an **external** SMTP relay via `VITE_INTEREST_API_URL`; degrades gracefully when unset/offline; validates via `validatePayload` first. An in-progress message is mirrored to `sessionStorage` (`jt-cv-contact-draft`, `src/utils/formDraft.ts`) on every change and restored on mount — only the active level is mounted, so walking to another flag mid-message would otherwise discard it silently. Sending clears the draft; storage failures degrade to empty fields.
- Google Analytics (gtag.js) embedded in `index.html` with measurement ID `G-61SDQXZSFT`. Standard async snippet; page-view fires on load (no routing).
- **Social share / link previews**: static Open Graph + Twitter Card tags in `index.html` drive rich unfurls (LinkedIn / Facebook / X / WhatsApp / Slack / Telegram / iMessage / Discord). URLs are **absolute** on the live domain `https://see-veo.vercel.app` (source of truth: the repo's GitHub `homepage` field) — scrapers don't run JS and won't follow a relative `og:image`. Card art lives in `public/share/`: `og-card.png` (1200×630, the unfurl image referenced by `og:image`/`twitter:image`), plus `square-card.png` (1080×1080) and `story-card.png` (1080×1920) for manual Instagram/story posts (those platforms don't unfurl links). Served as static files (Vercel checks the filesystem before the SPA rewrite) and **excluded from the SW precache** (`globIgnores: ['share/**']` in `vite.config.ts`) since the app never displays them. Copy is baked into **both** the meta tags and the PNGs — keep them in sync with `cv-data.ts` (name/title/tagline/handles/location); if the OG art is resized, update `og:image:width/height`. Source designs: handoff `guidelines/share-*.card.html`. Regression-guarded by `src/test/social-meta.test.ts`.
- **Removed in the redesign**: repo-tor activity charts (`ActivityCharts`/`ActivityTimeline`/`useRepoTorEmbed`/`constants/embed.ts`) and the on-screen debug banner (`DebugBanner`). See git history to recover.

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
- `glow-props` — shown as the **Full Portfolio** "see all" card at the end of the Projects list (`proj-portfolio`; deliberately NOT labelled "glow-props" — links to its GitHub Pages showcase `https://devmade-ai.github.io/glow-props/`). Previously excluded by owner; the owner opted it in as the portfolio index. When refreshing projects, keep it last and keep the display name generic.

**Excluded repos** (not shown in Projects):
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

Four parts, built on `vite-plugin-pwa` (^1.2.0) with React. Adapt patterns for other frameworks.

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

- **`registerType: 'prompt'`**: The mechanism that exposes the waiting worker to app code. The *behavior* on top is the fleet-standard **auto-on-launch** policy (apply at launch, defer mid-session, user toggle — see Key Decisions and glow-props `PWA_SYSTEM.md`). Raw `autoUpdate` silently refreshes mid-work; tap-only prompt leaves stale clients forever.
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

Wraps `vite-plugin-pwa`'s React hook with module-singleton state. Exposes `hasUpdate`, `update()`, `checkForUpdate()` (typed `'no-sw' | 'up-to-date' | 'update-available' | 'error'`), `autoUpdateEnabled` + `setAutoUpdate()`. Launch-applies an already-waiting worker (auto-on-launch policy); mid-session detections only arm the banner. Checks for new SW versions every 60 minutes and on visibilitychange.

#### Install Detection (`usePWAInstall.ts`)

Detects browser, captures `beforeinstallprompt` (consuming the early-captured event from `index.html`), tracks install analytics. Hides prompt when already installed or dismissed.

#### Key Lessons

1. **Never combine `"any maskable"` in icon purpose** — use separate entries with a dedicated 1024x1024 for maskable.
2. **Set `id` explicitly** in the manifest — Chrome derives it from `start_url` otherwise.
3. **The inline script in `index.html` is essential** — without it, repeat visitors on Chromium lose the install prompt.
4. **`registerType: 'prompt'` + auto-on-launch policy** — never raw `autoUpdate` (reloads mid-work) and never tap-only prompt (stale clients never converge). Launch-apply keeps both guarantees.
5. **Clean up all timers** — every `setTimeout`/`setInterval` in `useEffect` needs cleanup. Nested timeouts need the array pattern or mounted ref guard.

### App Icons

The current icons in `public/icons/` are **pre-built assets** shipped with the "The Applicant"
handoff (ink pixel-runner + amber flag on paper): `favicon.svg`, `favicon-16/32.png`,
`apple-touch-icon.png` (180), `icon-192/512.png` (any), `icon-maskable-192/512.png`. The old
`scripts/generate-icons.mjs` (Sharp-based generator) was **removed** in the redesign — if you
need to regenerate at other sizes, re-add a generator or export from the source drawing.

**SVG design rules for maskable icons (reference pattern):**
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

**Alternative — mounted ref guard:**
```typescript
const mountedRef = useRef(true);
useEffect(() => () => { mountedRef.current = false; }, []);

// In any async/timeout callback:
if (!mountedRef.current) return;
```

**General rule:** Every `setTimeout`, `setInterval`, `addEventListener`, or `subscribe` call inside a `useEffect` needs a corresponding cleanup in the return function. If callbacks create *new* async operations, those need cleanup too.

### HTTPS Proxy Support for Node.js Scripts

Zero-dependency HTTP CONNECT tunnel for Node.js scripts that need to reach external APIs through an HTTPS proxy. Solves the problem that Node.js's built-in `fetch()` (undici) and `https.get()` **do not** respect `HTTP_PROXY`/`HTTPS_PROXY` environment variables.

#### The Problem

In proxy-only environments (CI containers, Claude Code remote sessions, corporate networks), outbound traffic must route through an HTTP proxy. But:

- **`fetch()` (Node 18+ built-in)**: Uses undici internally. Does NOT auto-detect `HTTP_PROXY`/`HTTPS_PROXY` env vars. Requests fail with DNS errors.
- **`https.get()`**: Also does NOT respect proxy env vars. Same DNS failure.
- **`curl`**: Works — it reads `HTTP_PROXY`/`HTTPS_PROXY` automatically. But shelling out to curl from Node is ugly.
- **`global-agent` / `proxy-agent` packages**: Work, but add external dependencies for a simple tunnel.

#### The Solution

Detect the proxy from environment variables, establish an HTTP CONNECT tunnel, then pipe the HTTPS request through the tunnel socket. Pure `http`/`https` stdlib — no dependencies.

```javascript
import http from 'http';
import https from 'https';

// --- Proxy detection ---
// Check both lowercase and uppercase conventions.
// HTTPS_PROXY is used for HTTPS requests; HTTP_PROXY for HTTP requests.
// Most environments set both to the same value.
const PROXY_URL = process.env.https_proxy || process.env.HTTPS_PROXY || null;

function getProxyConnectOptions(targetHost) {
  const proxy = new URL(PROXY_URL);
  const options = {
    host: proxy.hostname,
    port: proxy.port,
    method: 'CONNECT',
    path: `${targetHost}:443`,
    headers: { 'Host': `${targetHost}:443` },
    timeout: 15000,
  };
  // Proxy authentication (username:password in proxy URL)
  if (proxy.username) {
    const auth = Buffer.from(
      decodeURIComponent(proxy.username) + ':' + decodeURIComponent(proxy.password)
    ).toString('base64');
    options.headers['Proxy-Authorization'] = `Basic ${auth}`;
  }
  return options;
}

// --- HTTPS GET with automatic proxy support ---
// When PROXY_URL is set: HTTP CONNECT tunnel → HTTPS over tunnel
// When PROXY_URL is null: Direct HTTPS request
function httpsGet(requestUrl, headers = {}) {
  const parsed = new URL(requestUrl);
  if (PROXY_URL) {
    return httpsGetViaProxy(parsed, headers);
  }
  return httpsGetDirect(parsed, headers);
}

function httpsGetDirect(parsed, headers) {
  return new Promise((resolve, reject) => {
    const req = https.get(parsed.href, { headers, timeout: 15000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
        }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

function httpsGetViaProxy(parsed, headers) {
  return new Promise((resolve, reject) => {
    const connectOptions = getProxyConnectOptions(parsed.hostname);
    const proxyReq = http.request(connectOptions);

    proxyReq.on('connect', (res, socket) => {
      if (res.statusCode !== 200) {
        socket.destroy();
        reject(new Error(`Proxy CONNECT failed: ${res.statusCode}`));
        return;
      }
      // TLS handshake through the tunnel
      const tlsReq = https.get({
        host: parsed.hostname,
        path: parsed.pathname + parsed.search,
        headers,
        socket,              // Reuse the CONNECT tunnel socket
        servername: parsed.hostname, // Required for SNI
        timeout: 15000,
      }, (tlsRes) => {
        let data = '';
        tlsRes.on('data', (chunk) => { data += chunk; });
        tlsRes.on('end', () => {
          if (tlsRes.statusCode >= 200 && tlsRes.statusCode < 300) {
            resolve(JSON.parse(data));
          } else {
            reject(new Error(`HTTP ${tlsRes.statusCode}: ${data.substring(0, 200)}`));
          }
        });
      });
      tlsReq.on('error', reject);
      tlsReq.on('timeout', () => { tlsReq.destroy(); reject(new Error('Request timeout')); });
    });

    proxyReq.on('error', reject);
    proxyReq.on('timeout', () => { proxyReq.destroy(); reject(new Error('Proxy connect timeout')); });
    proxyReq.end();
  });
}
```

**Usage:**

```javascript
// Works identically whether proxy is set or not
const data = await httpsGet('https://api.example.com/status', {
  'User-Agent': 'MyApp/1.0',
});
```

**For curl in shell scripts:**

```bash
# curl respects HTTP_PROXY/HTTPS_PROXY automatically — no code changes needed.
# If the env var is named differently (e.g., GLOBAL_AGENT_HTTP_PROXY), pass it explicitly:
curl -x "$GLOBAL_AGENT_HTTP_PROXY" https://api.example.com/status
```

#### Key Lessons

1. **Node's `fetch()` and `https.get()` ignore proxy env vars** — unlike `curl`, Python `requests`, or Go's `http.Client`, Node does not auto-detect `HTTP_PROXY`. This is a long-standing design choice, not a bug.
2. **HTTP CONNECT is the standard** — it's how all HTTPS proxying works. The proxy sees only the target hostname, not the request content (TLS encrypts everything after the tunnel opens).
3. **`socket` + `servername` are both required** — `socket` reuses the tunnel; `servername` enables SNI so the target server presents the correct TLS certificate.
4. **Auth uses Basic scheme** — proxy credentials are sent as `Proxy-Authorization: Basic base64(user:pass)` in the CONNECT request. URL-decode the username/password first (they may be percent-encoded in the URL).
5. **No external dependencies needed** — `global-agent`, `proxy-agent`, `https-proxy-agent` packages solve this too, but for scripts that just need GET requests, the stdlib solution above is simpler and has zero supply chain risk.
6. **`curl` just works** — it reads `HTTP_PROXY`/`HTTPS_PROXY` automatically. Use it for quick tests: `curl -x "$HTTPS_PROXY" https://example.com`.

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
- **Check build tools before building.** Run `npm install` or verify `node_modules/.bin/vite` exists before attempting `npm run build`. (`sharp` / `png-to-ico` remain devDependencies but are now unused — the icon generator script was removed; safe to prune if desired.)
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
| 8 | `debug` | `dbg` | Debug logging coverage — `debugLog` calls in the form/PWA hooks (the on-screen debug pill was removed) |
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
