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

  // Requirement: Heading hierarchy must not skip levels (h2 → h3, not h2 → h3 without h2)
  // Approach: Use aria-label on the section landmark instead of a visible h2,
  //   since this section visually follows the "Activity" h2 from ActivityCharts
  // Alternatives considered:
  //   - Wrap in <Section>: Rejected — adds a visible duplicate "Activity" heading
  //   - Use h2 instead of h3: Rejected — would be visually inconsistent with chart sub-headings
  return (
    <section className="mb-16 no-print" aria-label="Commit Activity">
      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <h3 className="mb-2 px-4 pt-3 text-sm font-medium text-text-muted">
          Commit Activity
        </h3>
        <iframe
          src={`${EMBED_BASE}?embed=activity-timeline&theme=dark&bg=transparent&colors=${CHART_COLORS}`}
          title="Commit Activity"
          className="h-72 w-full border-none sm:h-96 md:h-[28rem]"
          loading="lazy"
          // allow-same-origin: required — iframe fetches ./data.json from its own origin.
          // Without it, the sandbox assigns an opaque origin and the fetch fails silently.
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </section>
  )
}
