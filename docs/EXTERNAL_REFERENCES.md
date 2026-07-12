# External References

Cross-project documentation that relates to this codebase.

---

## repo-tor Embed Charts — REMOVED (2026-07-11)

The activity charts that embedded [repo-tor](https://github.com/devmade-ai/repo-tor) via
iframes (`ActivityCharts`, `ActivityTimeline`, `useRepoTorEmbed`, `src/constants/embed.ts`)
were **removed** in the "The Applicant" redesign — the pixel-runner CV has no charts section.

If charts are re-introduced later, the embed system is documented in the repo-tor repo:

| Document | Raw URL |
|----------|---------|
| `EMBED_IMPLEMENTATION.md` | `https://raw.githubusercontent.com/devmade-ai/repo-tor/main/docs/EMBED_IMPLEMENTATION.md` |
| `EMBED_REFERENCE.md` | `https://raw.githubusercontent.com/devmade-ai/repo-tor/main/docs/EMBED_REFERENCE.md` |

The previous integration (embed IDs, URL params, `embed.js` auto-resize hook, and the
centralized `embed.ts` config) can be recovered from git history prior to 2026-07-11.

---

## Deployed Projects (Projects section)

Project cards in `src/data/cv-data.ts` are sourced from deployed repos across the
`devmade-ai` / `illuminAI-select` accounts. See CLAUDE.md → "Deployed Projects" for how to
refresh them and the list of excluded repos.

---

*Last updated: 2026-07-11 — repo-tor chart embeds removed in the pixel-runner redesign.*
