// Requirement: Activity timeline chart below Projects, showing commits across all repos
// Approach: Standalone iframe embed of repo-tor's activity-timeline (stacked bar, one color per repo)
//   using the same card pattern as ActivityCharts
// Alternatives considered:
//   - Inline inside ActivityCharts component: Rejected — different purpose (timeline vs distribution)
//   - accent param: Rejected — activity-timeline is multi-dataset, needs colors series not single accent
//   - Default palette: Rejected — doesn't match our theme tokens

import { useRepoTorEmbed } from '../hooks/useRepoTorEmbed'
import { EMBED_BASE, CHART_COLORS } from '../constants/embed'

export default function ActivityTimeline() {
  useRepoTorEmbed()

  // Requirement: Container height determined by iframe content via postMessage
  // (same pattern as ActivityCharts — see ChartEmbed for full decision context)

  return (
    <section className="mb-16 no-print">
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <h3 className="mb-2 px-4 pt-3 text-sm font-medium text-text-muted">
          Commit Activity
        </h3>
        <iframe
          src={`${EMBED_BASE}?embed=activity-timeline&theme=dark&bg=transparent&colors=${CHART_COLORS}`}
          title="Commit Activity"
          className="h-72 w-full border-none sm:h-96 md:h-[28rem]"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </section>
  )
}
