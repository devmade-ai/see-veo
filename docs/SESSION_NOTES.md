# Session Notes

**Worked on:** Centralized theme color management to eliminate color drift

**Accomplished:**
- Created `src/constants/theme.ts` as single source of truth for theme colors used outside CSS
- Updated `vite.config.ts` to import theme constants for PWA manifest colors
- Added `themeColorInjector` Vite plugin using `transformIndexHtml` to inject colors into `index.html`
- Replaced hardcoded hex values in `index.html` with `%THEME_BACKGROUND%` / `%THEME_PRIMARY%` placeholders
- Added sync warning comment in `index.css` @theme block

**Current state:** All changes build and 52 tests pass. Theme colors now flow from `src/constants/theme.ts` → PWA manifest + HTML meta tags. CSS @theme tokens in `index.css` still need manual sync (with comment reminder).

**Key context:**
- `src/constants/theme.ts` exports `THEME_BACKGROUND` (#0a0a0a) and `THEME_PRIMARY` (#d4d4d4)
- `index.html` uses `%THEME_BACKGROUND%` and `%THEME_PRIMARY%` placeholders (not raw hex)
- `vite.config.ts` uses `THEME_BACKGROUND` constant for `theme_color` and `background_color`
- `index.css` @theme has a comment warning to keep values in sync with `theme.ts`
