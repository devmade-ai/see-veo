# History

Record of completed work and changes.

## 2026-03-25

### Accessibility
- Fixed text contrast: bumped `--color-text-muted` from `#737373` to `#a3a3a3` for WCAG AA compliance
- Fixed 5 project accent colors that failed AA as text: Graphiki (`#818cf8`), Sancio (`#94a3b8`), Four Ems (`#60a5fa`), model-pear (`#7dd3fc`), repo-tor (`#60a5fa`)
- Updated default project accent fallback from `#737373` to `#a3a3a3`

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
