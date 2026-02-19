// Requirement: Full-width activity timeline chart below Projects, showing commits across all repos
// Approach: Standalone iframe embed of repo-tor's activity-timeline (stacked bar, one color per repo)
//   using the same card pattern as ActivityCharts but wider to give the 60-day timeline room to breathe
// Alternatives considered:
//   - Inline inside ActivityCharts component: Rejected — different layout (full-width vs constrained grid)
//   - accent param: Rejected — activity-timeline is multi-dataset, needs colors series not single accent
//   - Default palette: Rejected — doesn't match our theme tokens

/** Base URL for the repo-tor embed dashboard */
const EMBED_BASE = 'https://devmade-ai.github.io/repo-tor/'

// Requirement: Chart colors must align with see-veo theme palette
// Approach: Custom colors series built from @theme tokens in index.css, passed via colors URL param
//   Primary (#38bdf8), secondary (#818cf8), accent (#34d399) first, then complementary tones
// Alternatives considered:
//   - Named palette preset: Rejected — none of the presets match our custom dark theme
//   - accent+muted params: Rejected — those are for single-dataset charts, not stacked bars

const CHART_COLORS = ['38bdf8', '818cf8', '34d399', 'f472b6', 'fbbf24', '22d3ee'].join(',')

export default function ActivityTimeline() {
  return (
    <div className="no-print mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <h3 className="mb-2 px-4 pt-3 text-sm font-medium text-text-muted">
          Commit Activity
        </h3>
        <iframe
          src={`${EMBED_BASE}?embed=activity-timeline&theme=dark&colors=${CHART_COLORS}`}
          title="Commit Activity"
          className="h-80 w-full border-none sm:h-96"
          loading="lazy"
        />
      </div>
    </div>
  )
}
