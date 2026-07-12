# TODO

Pending improvements and ideas. Completed items move to HISTORY.md.

## Technical
- [ ] `debugLog` is now headless (the on-screen DebugBanner was removed). Decide: add a small
      debug view / console helper for the contact form's mobile diagnostics, or remove the
      logging calls + `debugLog`/`formatDebugReport` entirely.
- [ ] Consider `<link rel="preload">` for the primary Spectral + Space Mono latin woff2 to
      cut first-paint font swap (currently `font-display: swap`, no preload).

## Documentation
- [ ] Add TESTING_GUIDE.md with test patterns and conventions
