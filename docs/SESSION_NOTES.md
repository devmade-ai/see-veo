# Session Notes

**Worked on:** Fix chart data loading — iframe sandbox too restrictive

**Accomplished:**
- Fixed `sandbox="allow-scripts"` → `sandbox="allow-scripts allow-same-origin"` on all chart iframes (ActivityCharts, ActivityTimeline)
- Charts were rendering empty because sandboxed iframes without `allow-same-origin` cannot make fetch/XHR requests to load data

**Current state:** Build clean, 108 tests pass. Pushed to `claude/fix-chart-data-loading-aIxRY`.

**Key context:**
- The embed script (`embed.js`) loaded fine — the issue was only about data fetching within the iframe
- `allow-same-origin` lets the iframe content make requests to its own origin (repo-tor.vercel.app) to fetch chart data
