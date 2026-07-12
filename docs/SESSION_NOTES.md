# Session Notes

**Worked on:** Social share / link previews (Open Graph + Twitter cards) — the unfurl feature
from the `jaco-theron-cv-design-system` handoff (`templates/cv-page/CvPage.dc.html` `<helmet>`).

**Accomplished:**
- Added static OG + Twitter Card meta tags to `index.html` with **absolute** URLs on the real
  domain `https://see-veo.vercel.app` (the design's `YOUR-DOMAIN` placeholder is gone). Aligned
  `<meta name="description">` with the design's richer copy so search/social/card art match.
- Shipped the three share PNGs to `public/share/` (`og-card.png` 1200×630, `square-card.png`
  1080×1080, `story-card.png` 1080×1920) → served at `/share/*.png`.
- `vite.config.ts`: `globIgnores: ['share/**']` drops the share cards from the SW precache
  (app never displays them) — precache 1075 → 565 KiB.
- New `src/test/social-meta.test.ts` (6 tests) guards the silent-failure invariants
  (placeholder, absolute URLs, 1200×630, PNGs present).
- Docs updated: CLAUDE.md (Key Decisions), HISTORY, USER_ACTIONS (platform re-scrape steps).

**Current state:** type-check, lint, `npm run build`, and **103 tests** all pass. `dist/`
verified — `dist/share/og-card.png` is a real PNG and `dist/index.html` carries the absolute
tags with no placeholder. Ready to commit/push to `claude/cv-page-social-unfurl-06p3q5`.

**Key context:**
- **Domain source of truth:** the GitHub repo `homepage` field = `https://see-veo.vercel.app`.
  No custom domain. If one is added, update the absolute URLs in `index.html` **and** the
  expected domain in `social-meta.test.ts`.
- **Why static tags, not React/Helmet:** social scrapers don't execute JavaScript, so only
  tags present in the server-served `index.html` are seen.
- **Why absolute image URLs:** most scrapers ignore a relative `og:image`.
- **Static serving works with the existing SPA rewrite:** verified on the live site that
  Vercel serves root static files (`/icons/*`, `/sw.js`) before the `index.html` rewrite, so
  `/share/og-card.png` resolves as a real file once deployed. No `vercel.json` change needed.
- **Copy is baked in twice** — meta tags *and* PNG art. Both verified against `cv-data.ts`
  (name/title/tagline/"nine years"/"Cape Town"/handles). Keep them in sync on any CV change.
- Platform preview testing is user-only (needs the deploy + logins) → see `USER_ACTIONS.md`.
- Scratch plan removed from `docs/working/` after completion.
