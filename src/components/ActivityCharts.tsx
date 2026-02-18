// Requirement: Embed repo-tor dashboard charts showing days and hours of work
// Approach: Two iframes in a responsive side-by-side grid, using repo-tor's embed mode
// Alternatives considered:
//   - Single iframe with both charts: Rejected — less layout control, can't arrange side-by-side
//   - Direct Chart.js integration: Rejected — repo-tor already has embed mode, no need to duplicate
//   - Static images: Rejected — loses interactivity and live data updates

import Section from './Section'

/** Base URL for the repo-tor embed dashboard */
const EMBED_BASE = 'https://devmade-ai.github.io/repo-tor/'

interface ChartEmbedProps {
  embedId: string
  title: string
}

function ChartEmbed({ embedId, title }: ChartEmbedProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <h3 className="px-4 pt-4 text-sm font-medium text-text-muted">{title}</h3>
      <iframe
        src={`${EMBED_BASE}?embed=${embedId}&theme=dark`}
        title={title}
        className="h-72 w-full border-none sm:h-80"
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
