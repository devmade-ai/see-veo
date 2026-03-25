# History

Record of completed work and changes.

## 2026-03-25

### Infrastructure
- Centralized theme colors: created `src/constants/theme.ts` as single source of truth for `THEME_BACKGROUND` and `THEME_PRIMARY`
- Added `themeColorInjector` Vite plugin to inject theme colors into `index.html` meta tags at build time via `transformIndexHtml`
- `index.html` now uses `%THEME_BACKGROUND%` / `%THEME_PRIMARY%` placeholders instead of hardcoded hex values
- `vite.config.ts` PWA manifest imports `THEME_BACKGROUND` from shared constants instead of hardcoded `#0a0a0a`
- Added sync warning comment in `index.css` @theme block referencing `theme.ts`

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
