// Requirement: Embed repo-tor dashboard charts showing days and hours of work
// Approach: Two iframes in a responsive side-by-side grid, using repo-tor's embed mode
// Alternatives considered:
//   - Single iframe with both charts: Rejected — less layout control, can't arrange side-by-side
//   - Direct Chart.js integration: Rejected — repo-tor already has embed mode, no need to duplicate
//   - Static images: Rejected — loses interactivity and live data updates

import Section from './Section'

/** Base URL for the repo-tor embed dashboard */
const EMBED_BASE = 'https://devmade-ai.github.io/repo-tor/'

// Requirement: Chart colors must match the see-veo theme palette
// Approach: Pass accent and muted URL params mapped from @theme tokens in index.css
// Alternatives considered:
//   - CSS variable overrides: Rejected — CSS vars can't cross iframe boundaries
//   - Named palette preset: Rejected — none of the presets match our custom theme
//   - colors param: Rejected — daily/hourly are single-dataset charts, accent+muted is correct

/** Primary theme color (--color-primary: #38bdf8) for work-hours / weekday bars */
const CHART_ACCENT = '38bdf8'
/** Secondary theme color (--color-secondary: #818cf8) for after-hours / weekend bars */
const CHART_MUTED = '818cf8'

interface ChartEmbedProps {
  embedId: string
  title: string
}

function ChartEmbed({ embedId, title }: ChartEmbedProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <h3 className="mb-2 px-4 pt-3 text-sm font-medium text-text-muted">{title}</h3>
      <iframe
        src={`${EMBED_BASE}?embed=${embedId}&theme=dark&accent=${CHART_ACCENT}&muted=${CHART_MUTED}`}
        title={title}
        className="h-80 w-full border-none sm:h-96"
        loading="lazy"
      />
    </div>
  )
}

export default function ActivityCharts() {
  return (
    <div className="no-print">
    <Section title="Activity">
      <div className="grid gap-6 sm:grid-cols-2">
        <ChartEmbed embedId="daily-distribution" title="Days I work" />
        <ChartEmbed embedId="hourly-distribution" title="Hours I work" />
      </div>
    </Section>
    </div>
  )
}
