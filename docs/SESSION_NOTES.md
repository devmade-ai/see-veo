# Session Notes

**Worked on:** Centralized theme color management to eliminate color drift

**Accomplished:**
- Made `src/index.css` @theme the single source of truth for theme colors
- `vite.config.ts` parses CSS at build time to extract `--color-background` and `--color-primary`
- `themeColorInjector` Vite plugin injects parsed values into `index.html` placeholders
- No separate constants file — CSS drives everything

**Current state:** All changes build and 52 tests pass. Change a color in `index.css` @theme and it automatically flows to PWA manifest and HTML meta tags.

**Key context:**
- `index.html` uses `%THEME_BACKGROUND%` and `%THEME_PRIMARY%` placeholders
- `vite.config.ts` reads `src/index.css` with `readFileSync` and regex-extracts the two color values
- No `src/constants/theme.ts` — deleted as unnecessary indirection
