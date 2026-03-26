# History

Record of completed work and changes.

## 2026-03-26

### Testing
- Added component render tests for Hero, About, Experience, Education, Skills, Projects (27 tests)
- Added InterestForm interaction tests: rendering, validation, submission, honeypot, error handling (17 tests)
- Added PWA hook tests for usePWAInstall and usePWAUpdate (12 tests)
- Installed `@testing-library/react` and `@testing-library/user-event` as dev dependencies
- Added `virtual:pwa-register/react` vitest alias with mock file for testing PWA hooks
- Test suite total: 135 tests across 6 files, all passing

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
