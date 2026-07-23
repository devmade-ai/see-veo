# Session Notes

**Worked on:** Recurating the Projects section (`src/data/cv-data.ts` `projects[]`)
— impact-led reorder, dropped the thinner entries, added a "see all" capstone.
Branch `claude/google-analytics-setup-34ltdy` (restarted from `main` after the
prior projects-refresh PR merged).

**Accomplished:**
- **Dropped** Model Pear, Four Ems, Repo-Tor (thinner / generic-category pieces).
- **Reordered** the remaining nine impact-led instead of grouped-by-type:
  inTXT → FuelHunt → Sancio → knowless → redline → Farlume → Graphiki →
  CanvaGrid → devmade. Leads with the novel + instantly-clear builds; Graphiki
  moved late (most powerful but most confusing), CanvaGrid down (weakest real
  build). **knowless must stay immediately before redline** — redline's copy
  opens "Part of knowless —".
- **Added** a `Full Portfolio` capstone card (`proj-portfolio`) at the very end —
  a generic "see all" entry linking to the GitHub Pages project showcase
  (`https://devmade-ai.github.io/glow-props/`), deliberately not labelled by its
  repo name. Now 10 project cards.
- Updated `CLAUDE.md` Excluded-repos note: glow-props is no longer excluded; it's
  opted in as the capstone (keep it last + generically named on future refreshes).

**Current state:** `npm run build` clean; all 116 tests pass (cv-data shape /
unique-id + CvProjects link-count assertions cover the new card). Committed +
pushed to the branch; **not yet merged.**

**Key context / open calls before merge:**
- **devmade kept** at #9 — sits just above the capstone (two closing meta cards).
  Cuttable if that reads as one too many.
- The capstone link URL still contains the string "glow-props" on hover
  (unavoidable without moving the deployment); the display name does not.
- Card fields are `{ id, name, stack, url, description }`; `url` must match
  `^https?://` and ids must be unique (both tested in `cv-data.test.ts`).
