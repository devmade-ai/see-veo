# History

Record of completed work and changes.

## 2026-07-29

### Fix: InterestForm's unmount guard stayed false after StrictMode's dev double-mount
`InterestForm`'s `mountedRef` was only ever set to `false` on unmount, never back to `true`
on mount. StrictMode (which `src/main.tsx` enables) runs a mount → cleanup → mount cycle in
development, so after the first cleanup the ref stayed `false` for the component's whole
life and the async failure-diagnosis branch (`diagnoseFailure` → error message) silently
no-op'd every time in dev. Production was unaffected. Now sets `true` in the mount effect
and `false` in its cleanup — the same shape `CvContact` already used. Regression-pinned by
an interest-form test that renders inside `<StrictMode>` and asserts the diagnosed failure
message still reaches the visitor (verified it fails against the old guard). 131 tests.

### Fix: the game's Space key was eating every space typed into the contact form
A real interest email arrived with the sender's name as `LouiseWentworth` and her message as
`pleasesendmeyourcellphonenumber.` — every space gone, while the template's own text was
untouched. Cause: `LivingCv`'s `window` keydown listener claimed `Space` for the runner's jump
and called `preventDefault()` with no check on the event target, and cancelling a keydown
cancels the browser's insertion of that character. The email path was verified innocent first
(the API only trims the outer edges, and the MIME nodemailer produces for that payload is
7bit with the spaces intact) — nothing in `tool-till-tees` needed changing.

The failure is worst on Android: Gboard routes letters through the IME composition path where
no cancellable keydown fires, while the space bar dispatches a real one — so the visitor gets
every letter and no spaces.

- **`src/components/LivingCv.tsx`**: the listener now returns early for events dispatched from
  an `input`/`textarea`/`select`/contenteditable target, skips `Space` when the focused element
  is one a browser activates with it (`button`, `summary`, `[role="button"]` — otherwise keyboard
  users can't press "Send a message" or tick "Automatic updates"), and ignores Ctrl/Meta/Alt
  combos so browser shortcuts still work. Arrow keys still navigate from a focused flag button.
- **`src/utils/formDraft.ts`** (new): mirrors the in-progress contact fields to `sessionStorage`
  (`jt-cv-contact-draft`) and restores them on mount. Only the active level is mounted, so
  walking to another flag — or, before the guard, a stray arrow key while typing — unmounted
  `InterestForm` and discarded the message silently. Untrusted-storage safe (unparseable, wrong
  shape, or non-string fields degrade to empty; fields clamp to the input limits).
- **`src/components/InterestForm.tsx`**: seeds state from the draft, writes every change back,
  and drops its duplicate form-data interface for `ContactDraft`.
- **`src/utils/validation.ts`**: exports `MAX_NAME_LENGTH` / `MAX_EMAIL_LENGTH` /
  `MAX_MESSAGE_LENGTH` (mirroring the API's `lib/constants.ts`) so the `maxLength` attributes,
  the validator, and the draft clamp share one set of numbers.
- **Tests**: 5 new in `living-cv.test.tsx` (spaces survive typing, arrows move the caret not the
  runner, Space still activates a focused button, Space still jumps elsewhere, a half-written
  message survives leaving the level), 2 in `interest-form.test.tsx` (draft restored on remount,
  cleared after sending), and `form-draft.test.ts` (7 — round-trip + every degrade branch).
  Verified the 4 behavioural ones fail with the guard removed. `src/test/setup.ts` clears
  `sessionStorage` between tests. 130 tests pass; lint, type-check, and build clean.

## 2026-07-21

### Fleet-standard PWA update policy — auto-on-launch
Implemented the devmade-ai fleet update policy (glow-props `docs/implementations/PWA_SYSTEM.md`
→ "Update Application Policy — fleet standard: auto-on-launch"). `registerType` stays
`'prompt'`; the policy is layered in `usePWAUpdate`.

- **`src/hooks/usePWAUpdate.ts`** (rewritten): module-singleton state + pub/sub. **Launch-apply** —
  a worker already waiting when registration first resolves is applied silently
  (`SKIP_WAITING` posted to `registration.waiting`; reload via a latch-gated
  `controllerchange` backstop plus vite-plugin-pwa's own `controlling` listener), gated on
  the "Automatic updates" preference (localStorage `jt-cv-auto-update`, default ON,
  try/catch-safe) and a 30s sessionStorage `jt-cv-pwa-updated` just-updated suppression
  (also written on user-tap updates). **Mid-session** detections (hourly poll + new
  visibilitychange check) never reload — they arm the banner; the worker applies next
  launch. Added `checkForUpdate()` (`registration.update()` + 1500ms settle → typed
  `'no-sw' | 'up-to-date' | 'update-available' | 'error'`). Background `update()` polls now
  catch offline rejections into `debugLog` instead of leaking unhandled rejections.
- **`src/components/UpdatePrompt.tsx`**: hosts the "Automatic updates" checkbox (amber
  accent, mono, 44px touch target) — see-veo has no menu/settings surface, so the
  preference rides with the banner. `onUpdate` now typed to return a promise so the
  banner's error state actually catches rejections.
- **`src/components/CvContact.tsx`**: "Check for updates" button beside the install
  affordance (the Contact level is the app-management corner) with plain-language results
  in an always-mounted `role="status"` line and an unmount guard around the async result.
- **`src/App.tsx` / `src/components/LivingCv.tsx`**: wiring + `onCheckForUpdates` threading.
- **Tests**: `pwa-hooks.test.ts` rewritten for the policy (launch-apply + both gates,
  mid-session arm-only, toggle persistence, all four check results — 11 tests) with a
  `_resetPwaUpdateStateForTesting()` export; `components.test.tsx` gains CvContact check
  + UpdatePrompt toggle coverage. 116 tests total; type-check, lint, and build pass;
  verified the generated `dist/sw.js` carries the `SKIP_WAITING` message handler the
  launch-apply postMessage relies on.

## 2026-07-12

### Social share / link previews (Open Graph + Twitter cards)
Implemented the share/unfurl feature from the `jaco-theron-cv-design-system` handoff
(`templates/cv-page/CvPage.dc.html` `<helmet>`).

- **`index.html`**: added static Open Graph + Twitter Card meta tags so the CV unfurls with
  the paper-and-pixel landscape card on LinkedIn / Facebook / X / WhatsApp / Slack / Telegram /
  iMessage / Discord. All URLs are **absolute** on the real domain
  `https://see-veo.vercel.app` (from the repo's GitHub `homepage` field) — the design's
  `YOUR-DOMAIN` placeholder is fully replaced. Also aligned `<meta name="description">` with
  the design's richer copy (Cape Town, nine years, "play through") so search + social + card
  art tell one story. Tags are static (not React-injected) because scrapers don't run JS.
- **`public/share/`**: shipped `og-card.png` (1200×630), `square-card.png` (1080×1080),
  `story-card.png` (1080×1920) from the handoff. Served as static files at `/share/*.png`
  (verified on the live site that Vercel serves root static files before the SPA rewrite;
  the og:image now resolves as a real PNG instead of the app shell).
- **`vite.config.ts`**: `globIgnores: ['share/**']` keeps the share cards out of the SW
  precache — the app never displays them, so precaching all three saved ~0.5 MB per install
  (precache 1075 → 565 KiB).
- **`src/test/social-meta.test.ts`**: new guard (6 tests) asserting no `YOUR-DOMAIN`
  placeholder, absolute `og:url`/`og:image`/`twitter:image`, `1200×630` dimensions, the
  large-image Twitter card, and that the three PNGs ship. Catches the silent-failure modes
  (blank previews) that this feature is prone to.
- Verified copy against `cv-data.ts` and the baked PNG art: name, title, tagline, "nine
  years", "Cape Town", and both handles all match. type-check, lint, build, and 103 tests pass.
- **User-only follow-up** (→ `USER_ACTIONS.md`): force a re-scrape on the LinkedIn / Facebook /
  X validators after deploy (they cache aggressively); post the square/story cards manually
  where links don't unfurl (Instagram / TikTok / status).

## 2026-07-11

### Complete redesign — "The Applicant" pixel-runner Living CV
Full front-end replacement from the Claude Design handoff (`jaco-theron-cv-design-system`).
Config/build tooling retained.

- **New app shell** (`LivingCv`): full-screen ink-on-paper CV with a Chrome-dino-style pixel
  runner that walks/hops between six section flags. Coin score + persisted high score +
  distance HUD; `←`/`→` walk, `Space` jump, click a flag to navigate; Web Audio blips
  (SFX toggle); CRT/paper texture. Motion-safe (`prefers-reduced-motion`) and print-safe.
- **Game engine** (`src/game/pixelRunnerEngine.ts`): framework-agnostic canvas class owning
  the render loop, runner sprites/physics, numeric HUD, and audio. React owns navigation
  state; the engine is driven imperatively (`goTo`/`jump`).
- **New section components**: `CvHeader`, `CvGameStrip`, `CvProfile`, `CvExperience`,
  `CvSkills`, `CvProjects`, `CvEducation`, `CvContact`, `CvSectionHeading`, `CvPrintDoc`.
- **Theme**: revalued existing Tailwind `@theme` token names to the warm-paper palette
  (paper `#F4ECD8`, ink `#2B2118`, amber `#E0972B`) so kept components re-theme automatically;
  added `--color-heading/text-dim/text-faint/link/primary-ink` etc. Self-hosted Spectral /
  Space Mono / Silkscreen (`src/fonts.css`, `src/fonts/`) → `font-serif`/`font-mono`/`font-pixel`.
- **PWA**: new icon set (`public/icons/`) + manifest (`Jaco Theron — Living CV`,
  theme-color = ink, background = paper, `orientation: portrait`). `vite.config.ts` injects
  `%THEME_COLOR%` = ink parsed from CSS; dropped the now-unused Google-Fonts runtime caching.
- **Kept & adapted (restyled to paper)**: contact form (`InterestForm` → SMTP relay) placed
  in the Contact level; PWA install button + `InstallInstructionsModal`; PWA update toast
  (`UpdatePrompt`); PDF print; Google Analytics + `beforeinstallprompt` capture in `index.html`.
- **Removed (not in the new design)**: `ActivityCharts`, `ActivityTimeline`, `useRepoTorEmbed`,
  `constants/embed.ts` (repo-tor chart embeds); `DebugBanner`; old section components
  (`Hero`, `About`, `Experience`, `Education`, `Skills`, `Projects`, `Section`, `TimelineItem`,
  `SkillBadge`, `ProjectImage`); `scripts/generate-icons.mjs` (stale icon generator); old
  `public/` icons. Slimmed `diagnostics.ts` to just `diagnoseFailure` (the 12 check functions
  were DebugBanner-only).
- **Content**: rebuilt against the handoff's curated copy, then restored to the owner's full
  CV on request — **5 experience** entries (PBT Group back) with complete descriptions +
  highlights, and **5 education** entries (TorqueIT back); added profile intro + stats.
  `cv-data.ts` now also carries the `sections` game config (flag labels + coin values).
- **Tests**: rewrote `cv-data`, `components`, and `interest-form` tests for the new shape;
  added `living-cv` integration test; stubbed canvas/matchMedia in `setup.ts`. 97 tests pass.

## 2026-04-29

### Analytics
- Added Google Analytics (gtag.js) tag `G-61SDQXZSFT` to `index.html` for site usage tracking. Loader script is async to avoid blocking render; init runs synchronously so the initial page view is captured.

## 2026-03-26

### Code Review Fixes
- Fixed email validation to check trimmed length (validation.ts)
- Added error timer cleanup on manual dismiss in InterestForm
- Added focus restoration to InstallInstructionsModal on close (WCAG 2.4.3)
- Added fallback message in modal for browsers with no install steps (Firefox Desktop)
- Switched About and TimelineItem to index-based keys with prefixes
- Added Space Grotesk as heading font (h1-h6) alongside Inter body font

### Code Quality Fixes
- Added mountedRef guard to InterestForm to prevent setState after unmount during async diagnoseFailure
- Made UpdatePrompt.handleUpdate async to catch rejected promises from onUpdate
- Removed needRefresh from SW polling interval dependency in usePWAUpdate (runs once from mount)
- Added monotonic run counter to DebugBanner runDiagnostics to cancel stale concurrent runs

### Improvements
- Added aria-labelledby to Section component for screen reader landmark navigation
- Added aria-label to project "View Project" links with project name
- Added aria-label to ActivityTimeline section for heading hierarchy
- Added print CSS to show external link URLs via ::after pseudo-element
- Added standalone `npm run type-check` script

### Performance
- Fixed uncleaned setTimeout in DebugBanner handleCopy (memory leak)
- Memoized errorCount filter with useMemo in DebugBanner
- Replaced index-based keys with content-based keys in About and TimelineItem
- Extracted statusIcon as module-level function

### Security
- Added security headers to vercel.json (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Removed allow-same-origin from iframe sandbox attributes
- Replaced real API URL in .env.example with empty placeholder
- Added timing-based bot detection to InterestForm

### Debug Coverage
- Added PWA install lifecycle logs (prompt-captured, prompt-shown, prompt-result, app-installed)
- Added PWA update lifecycle logs (sw-registered, update-available, update-applied)
- Added embed.js load success log
- Reduced InterestForm submit log noise (removed static constants)

### Code Hygiene
- Extracted `fetchWithTimeout` utility (`src/utils/fetchWithTimeout.ts`) — deduplicates 6 AbortController+setTimeout occurrences across InterestForm and DebugBanner
- Extracted diagnostic check functions into `src/utils/diagnostics.ts` — 12 pure functions + shared `diagnoseFailure`, reducing DebugBanner from 582→355 lines and InterestForm from 507→433 lines
- Removed unused `avatarInitials` field from `PersonalInfo` interface, cvData, and tests
- Corrected test count in HISTORY.md (was 135 from grep overcounting, actual is 108)

### Documentation Accuracy
- Fixed 7 documentation discrepancies: missing ProjectImage in CLAUDE.md, stale vite-plugin-pwa version, stale test counts, TODO/Key Decisions contradiction, outdated AI Notes, stale EXTERNAL_REFERENCES date

### Mobile UX (WCAG 2.5.5 Compliance)
- Added `viewport-fit=cover` to index.html for safe area inset support on notched devices
- Added body safe area padding in index.css
- Increased all button/input touch targets to minimum 44px across Hero, UpdatePrompt, InterestForm, InstallInstructionsModal, DebugBanner, Projects
- Added safe area clearance to fixed elements (UpdatePrompt, DebugBanner, skip-to-content link)
- Made InstallInstructionsModal scrollable with max-h-[85vh] for small viewports
- Made iframe heights responsive (smaller on mobile, scaling up via sm/md breakpoints)

### Testing
- Added component render tests for Hero, About, Experience, Education, Skills, Projects (27 tests)
- Added InterestForm interaction tests: rendering, validation, submission, honeypot, error handling (17 tests)
- Added PWA hook tests for usePWAInstall and usePWAUpdate (12 tests)
- Installed `@testing-library/react` and `@testing-library/user-event` as dev dependencies
- Added `virtual:pwa-register/react` vitest alias with mock file for testing PWA hooks
- Test suite total: 108 tests across 6 files, all passing

## 2026-03-25

### Accessibility
- Fixed text contrast: bumped `--color-text-muted` from `#737373` to `#a3a3a3` for WCAG AA compliance
- Fixed 5 project accent colors that failed AA as text: Graphiki (`#818cf8`), Sancio (`#94a3b8`), Four Ems (`#60a5fa`), model-pear (`#7dd3fc`), repo-tor (`#60a5fa`)
- Updated default project accent fallback from `#737373` to `#a3a3a3`

### Code Quality
- Fixed ESLint error in `usePWAInstall.ts`: moved early prompt consumption to module level to avoid setState in useEffect
- Fixed ESLint error/warning in `DebugBanner.tsx`: added `canInstall` to `useCallback` dependency array
- Added `id: '/'` and `prefer_related_applications: false` to PWA manifest (per CLAUDE.md best practices)
- Added Inter font via Google Fonts with preconnect hints and weights 400/500/600/700

### Infrastructure
- Centralized theme colors: `src/index.css` @theme is the single source of truth
- `vite.config.ts` parses CSS at build time to extract `--color-background` and `--color-primary`
- Added `themeColorInjector` Vite plugin to inject parsed values into `index.html` meta tags
- `index.html` uses `%THEME_BACKGROUND%` / `%THEME_PRIMARY%` placeholders replaced at build time
- PWA manifest `theme_color` and `background_color` use the parsed CSS values
- Updated `mask-icon.svg` colors from old navy/sky-blue theme to current neutral grays
- Generated dedicated 1024x1024 maskable icon; PWA manifest now uses it instead of reusing 512x512

## 2026-03-24

### Theme & Visual Design
- Redesigned theme from saturated dark (sky blue, indigo, emerald accents) to dark minimal (near-monochrome neutral grays)
- Added per-project accent colors to project cards: left border, colored initials placeholder, tinted tech badges, colored "View Project" link
- Added `accent` optional field to `ProjectItem` interface
- Assigned 9 distinct brand colors across all projects
- Updated Hero avatar from blue ring to neutral gray

## 2026-03-23

### Documentation
- Updated README.md — expanded from 5 bullet points to full feature documentation covering all 13 components, 3 hooks, 3 utilities, PWA features, accessibility, print/PDF, and developer tools
- Created missing docs files: SESSION_NOTES.md, TODO.md, HISTORY.md, USER_ACTIONS.md, AI_MISTAKES.md
- Consolidated `docs/working/ai-fuckups.md` into `docs/AI_MISTAKES.md` per CLAUDE.md conventions
