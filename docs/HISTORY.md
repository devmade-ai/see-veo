# History

Record of completed work and changes.

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
