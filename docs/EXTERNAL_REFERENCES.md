# External References

Cross-project documentation that relates to this codebase.

---

## repo-tor Embed Docs

The `ActivityCharts` component (`src/components/ActivityCharts.tsx`) embeds charts from the
[repo-tor](https://github.com/devmade-ai/repo-tor) project via iframes. The embed system's
documentation lives in that repo:

| Document | What it covers | Raw URL |
|----------|---------------|---------|
| `EMBED_IMPLEMENTATION.md` | Architecture, URL parameters, color system, security, alternatives | `https://raw.githubusercontent.com/devmade-ai/repo-tor/main/docs/EMBED_IMPLEMENTATION.md` |
| `EMBED_REFERENCE.md` | All embed IDs, chart types, CV recommendations, color customization | `https://raw.githubusercontent.com/devmade-ai/repo-tor/main/docs/EMBED_REFERENCE.md` |

### How to fetch these docs in a session

Use `WebFetch` with the raw GitHub URLs above, or the GitHub API / `gh` CLI:

```bash
# Via gh CLI
gh api repos/devmade-ai/repo-tor/contents/docs/EMBED_IMPLEMENTATION.md --jq '.content' | base64 -d
gh api repos/devmade-ai/repo-tor/contents/docs/EMBED_REFERENCE.md --jq '.content' | base64 -d
```

### Key details (quick reference)

**Available embed IDs used by this project:**

| Embed ID | Chart Type | Component | Description |
|----------|-----------|-----------|-------------|
| `activity-timeline` | Stacked bar | `ActivityTimeline` | Daily commit counts over 60 days, by repo (full-width, `colors` param) |
| `daily-distribution` | Bar | `ActivityCharts` | Commits by day of week (Mon-Sun, `accent`+`muted` params) |
| `hourly-distribution` | Bar | `ActivityCharts` | Commits by hour of day (0-23, `accent`+`muted` params) |

**Other embed IDs available for future use:**

| Embed ID | Chart Type | Description |
|----------|-----------|-------------|
| `code-changes-timeline` | Stacked bar | Net code changes per day |
| `feature-vs-bugfix-trend` | Line | Monthly feature vs bug fix counts |
| `complexity-over-time` | Line | Average commit complexity per month |
| `semver-distribution` | Doughnut | Patch / minor / major distribution |
| `contributor-complexity` | Horizontal bar | Avg complexity per contributor |
| `tag-distribution` | Doughnut | Commit tag distribution |
| `urgency-trend` | Line | Average urgency per month |
| `impact-over-time` | Stacked bar | Monthly impact type breakdown |
| `debt-trend` | Line | Tech debt added vs paid |
| `activity-heatmap` | HTML heatmap | Commit activity heatmap |

**URL parameters:**

| Param | Description |
|-------|-------------|
| `embed` | Required. Chart ID(s), comma-separated |
| `theme` | `light` or `dark` |
| `bg` | Hex or `transparent`. Background color of embedded element (default: `#1B1B1B`) |
| `palette` | Named preset: `default`, `warm`, `cool`, `earth`, `vibrant`, `mono` |
| `colors` | Custom hex series for multi-dataset charts |
| `accent` | Primary hex color for single-dataset charts |
| `muted` | Secondary hex color (after-hours, weekends) |

**Auto-resize (embed.js):**

repo-tor provides an `embed.js` helper script that auto-discovers all repo-tor iframes
on the page and handles `repo-tor:resize` postMessage events. Embedders include it once:

```html
<script src="https://devmade-ai.github.io/repo-tor/embed.js"></script>
```

This project loads the script dynamically via `src/hooks/useRepoTorEmbed.ts`, which
appends the `<script>` tag once on first render. Iframes use static Tailwind height
classes as fallback until the first resize message arrives and embed.js sets the
inline `style.height`.

Opt-out: remove the hook usage and omit the script. Iframes stay at their static CSS height.
The postMessage calls are entirely passive — no listener means no effect.

---

*Last updated: 2026-02-19 — Switched from custom useIframeAutoResize listener to repo-tor's embed.js helper script*
