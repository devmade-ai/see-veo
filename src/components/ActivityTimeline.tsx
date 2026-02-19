// Requirement: Activity timeline chart below Projects, showing commits across all repos
// Approach: Standalone iframe embed of repo-tor's activity-timeline (stacked bar, one color per repo)
//   using the same card pattern as ActivityCharts
// Alternatives considered:
//   - Inline inside ActivityCharts component: Rejected — different purpose (timeline vs distribution)
//   - accent param: Rejected — activity-timeline is multi-dataset, needs colors series not single accent
//   - Default palette: Rejected — doesn't match our theme tokens

/** Base URL for the repo-tor embed dashboard */
const EMBED_BASE = 'https://devmade-ai.github.io/repo-tor/'

// Requirement: Chart colors must align with see-veo theme palette and support 12+ repos
// Approach: 15-color series starting with @theme tokens (primary, secondary, accent), then
//   visually distinct hues chosen for readability on dark backgrounds. 15 colors avoids
//   cycling/repeats as the repo count grows.
// Alternatives considered:
//   - Named palette preset: Rejected — presets only have 6 colors, not enough for 12+ repos
//   - accent+muted params: Rejected — those are for single-dataset charts, not stacked bars
//   - 6-color series: Rejected — cycles at 7+ repos, making them indistinguishable

const CHART_COLORS = [
  '38bdf8', // primary — sky blue
  '818cf8', // secondary — indigo
  '34d399', // accent — emerald
  'f472b6', // pink
  'fbbf24', // amber
  '22d3ee', // cyan
  'fb923c', // orange
  'a78bfa', // violet
  '4ade80', // green
  'f87171', // red
  '2dd4bf', // teal
  'e879f9', // fuchsia
  '60a5fa', // blue
  'facc15', // yellow
  'c084fc', // purple
].join(',')

export default function ActivityTimeline() {
  return (
    <section className="mb-16 no-print">
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
    </section>
  )
}
