# TODO

Pending improvements and ideas. Completed items move to HISTORY.md.

## Content (owner decision)
- [ ] The redesign trimmed content to match the handoff. Decide whether to restore the
      **PBT Group** experience entry and **TorqueIT** education entry (and the longer
      per-role highlights) that the design dropped. Re-add to `src/data/cv-data.ts` if wanted.

## Technical
- [ ] `debugLog` is now headless (the on-screen DebugBanner was removed). Decide: add a small
      debug view / console helper for the contact form's mobile diagnostics, or remove the
      logging calls + `debugLog`/`formatDebugReport` entirely.
- [ ] Consider `<link rel="preload">` for the primary Spectral + Space Mono latin woff2 to
      cut first-paint font swap (currently `font-display: swap`, no preload).

## Documentation
- [ ] Add TESTING_GUIDE.md with test patterns and conventions
