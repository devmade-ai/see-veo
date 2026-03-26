// Requirement: Embed repo-tor dashboard charts showing days and hours of work
// Approach: Two iframes in a responsive side-by-side grid, using repo-tor's embed mode
// Alternatives considered:
//   - Single iframe with both charts: Rejected — less layout control, can't arrange side-by-side
//   - Direct Chart.js integration: Rejected — repo-tor already has embed mode, no need to duplicate
//   - Static images: Rejected — loses interactivity and live data updates

import Section from './Section'
import { useRepoTorEmbed } from '../hooks/useRepoTorEmbed'
import { EMBED_BASE, CHART_ACCENT, CHART_MUTED } from '../constants/embed'

interface ChartEmbedProps {
  embedId: string
  title: string
}

function ChartEmbed({ embedId, title }: ChartEmbedProps) {
  // Requirement: Container height determined by iframe content via postMessage
  // Approach: Tailwind classes (h-80 / sm:h-96) act as fallback until embed.js
  //   receives the first repo-tor:resize message and sets inline style.height,
  //   which overrides the CSS class automatically.
  // Alternatives considered:
  //   - Custom postMessage listener with React state: Rejected — embed.js handles
  //     this natively, setting iframe.style.height directly without React overhead

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <h3 className="mb-2 px-4 pt-3 text-sm font-medium text-text-muted">{title}</h3>
      <iframe
        src={`${EMBED_BASE}?embed=${embedId}&theme=dark&bg=transparent&accent=${CHART_ACCENT}&muted=${CHART_MUTED}`}
        title={title}
        className="mt-auto h-64 w-full border-none sm:h-80 md:h-96"
        loading="lazy"
        sandbox="allow-scripts"
      />
    </div>
  )
}

export default function ActivityCharts() {
  useRepoTorEmbed()

  return (
    <div className="no-print">
    <Section title="Activity">
      <div className="grid gap-6 sm:grid-cols-2">
        <ChartEmbed embedId="daily-distribution" title="Most Active Days" />
        <ChartEmbed embedId="hourly-distribution" title="Peak Working Hours" />
      </div>
    </Section>
    </div>
  )
}
