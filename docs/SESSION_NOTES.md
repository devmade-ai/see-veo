# Session Notes

**Worked on:** Refreshing the Projects section — it was stale (4 entries, one
pre-rebrand) — on branch `claude/google-analytics-setup-34ltdy`.

**Accomplished:**
- `src/data/cv-data.ts` `projects[]` refreshed to the current deployed fleet:
  - **Fixed** the stale `SyncTone` entry → **inTXT** (`intxt.app`; description
    rewritten — the app tags message *intention*, and the old "tone revealed when
    the recipient opens the chat" mechanic no longer exists — tags show on the
    message). `id` `proj-synctone` → `proj-intxt`.
  - **Fixed** FuelHunt's URL `few-lap.vercel.app` → the live branded domain
    `fuelhunt.app`.
  - **Added** 8 deployed, non-excluded projects that were missing: Sancio
    (sun-sea-o), knowless (kl-website, `knowless.net`), redline (web-arch — a
    knowless sub-brand), Model Pear (model-pear-web), Four Ems, Repo-Tor, Farlume
    (budgy-ting, rebranded), and devmade (dm-website, now live at
    `www.devmade.app`). Total 12 projects.
- Descriptions written in the existing non-technical, one-sentence voice.

**Current state:** `npm run type-check` clean; **116 tests pass** (incl.
`cv-data.test.ts`). Committed on `claude/google-analytics-setup-34ltdy` (branch is
new — no prior PR/merge on the remote).

**Key context:**
- Project inclusion follows the CLAUDE.md "Deployed Projects" rule: deployed
  `devmade-ai`/`illuminAI-select` repos, minus the documented exclusions
  (glow-props, canva-grid-assets, tool-till-tees, chatty-chart, plant-fur,
  coin-zapp, see-veo itself). sp-website stays out — Medusa storefront, not
  deployed yet.
- Ground truth came from querying each scoped repo's GitHub `homepage`/`has_pages`
  directly — the account-wide `/user/repos` API is blocked (sessions are
  repo-scoped). The `illuminAI-select` account can't be enumerated from here, so
  any of its projects beyond what's listed would still need adding (Farlume's repo
  `budgy-ting` is outside this session's scope; its entry was sourced from the
  glow-props project meta + the owner's rebrand note).
- `id` values are React keys only — safe to rename (no test/component referenced
  `proj-synctone`).
