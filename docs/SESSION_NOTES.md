# Session Notes

**Worked on:** Complete app replacement — implemented the "The Applicant" pixel-runner
Living CV from the Claude Design handoff (`jaco-theron-cv-design-system`).

**Accomplished:**
- Rebuilt the entire front end as a full-screen, playable ink-on-paper CV: a canvas pixel
  runner walks between six section flags (Profile/Work/Skills/Projects/Study/Contact) with a
  coin score + high score + distance HUD, sound blips, and a CRT/paper texture.
- New theme: revalued the existing Tailwind `@theme` token names to the warm-paper palette
  (paper `#F4ECD8`, ink `#2B2118`, amber `#E0972B`) so kept components re-theme automatically.
  Self-hosted Spectral / Space Mono / Silkscreen (18 woff2) → `font-serif`/`mono`/`pixel`.
- Game engine extracted to `src/game/pixelRunnerEngine.ts` (canvas + HUD + Web Audio),
  driven imperatively by `LivingCv` which owns navigation state (React source of truth).
- **Dropped** (not in design): repo-tor activity charts + on-screen debug banner.
- **Kept & adapted** (restyled to paper): contact form (SMTP relay), PWA install button +
  instructions modal, PWA update toast, PDF print, sound toggle, Google Analytics.
- New icon set + manifest (`Jaco Theron — Living CV`, theme-color = ink, bg = paper,
  portrait). `vite.config.ts` now injects `%THEME_COLOR%` = ink from CSS.
- Content updated to the handoff's curated copy (see Key context re: trimmed entries).
- Slimmed `diagnostics.ts` to just `diagnoseFailure` (the 12 check fns were DebugBanner-only).
- Tests rewritten: 97 pass (data, sections, LivingCv nav, header, game strip, form, PWA).

**Current state:** type-check, lint, 97 tests, and `npm run build` all pass. Verified in
real Chromium (Playwright) at mobile + desktop + print — renders faithfully; navigation,
scoring, coin collection, and the print doc all work. Ready to commit/push to
`claude/modest-newton-uixfn8`.

**Key context:**
- **Token-name reuse is the theming trick**: kept components (InterestForm, UpdatePrompt,
  InstallInstructionsModal) read `--color-primary/surface/text/...`; revaluing those to
  ink/paper re-themed them with minimal edits.
- **Content**: the handoff had curated the CV down, but the owner asked to restore it — so
  `cv-data.ts` now carries the full **5 experience** entries (PBT Group back) with complete
  descriptions + highlights, and **5 education** entries (TorqueIT back). The new layouts
  handle the fuller content fine (the stage scrolls). CvEducation test uses `getAllByText`
  for periods since two credentials share "2014".
- Engine no-ops without a 2D canvas context (jsdom) — this is how tests exercise the React
  nav layer. `HTMLCanvasElement.getContext` is stubbed to null in `src/test/setup.ts`.
- `debugLog` is now headless (no visual reader) but kept — it backs the contact form's
  mobile diagnosability. See TODO.
