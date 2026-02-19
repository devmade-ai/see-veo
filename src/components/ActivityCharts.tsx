// Requirement: Embed repo-tor dashboard charts showing days and hours of work
// Approach: Two iframes in a responsive side-by-side grid, using repo-tor's embed mode
// Alternatives considered:
//   - Single iframe with both charts: Rejected — less layout control, can't arrange side-by-side
//   - Direct Chart.js integration: Rejected — repo-tor already has embed mode, no need to duplicate
//   - Static images: Rejected — loses interactivity and live data updates

import Section from './Section'
import { useIframeAutoResize } from '../hooks/useIframeAutoResize'

/** Base URL for the repo-tor embed dashboard */
const EMBED_BASE = 'https://devmade-ai.github.io/repo-tor/'

// Requirement: Chart colors and background must match the see-veo theme palette
// Approach: Pass bg=transparent so iframe inherits the card's bg-surface color,
//   plus accent and muted URL params mapped from @theme tokens in index.css
// Alternatives considered:
//   - bg=1e293b (hardcoded surface hex): Rejected — breaks if surface token changes
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
  const { iframeRef, height } = useIframeAutoResize()

  // Requirement: Container height determined by iframe content via postMessage
  // Approach: Apply dynamic height from repo-tor:resize messages via style attr.
  //   Tailwind classes (h-80 / sm:h-96) serve as the initial fallback before the
  //   first message arrives. style={{}} is used here despite the project's Tailwind-
  //   first rule because the value is dynamic and only known at runtime.
  // Alternatives considered:
  //   - Tailwind arbitrary value [Npx]: Rejected — height isn't known at build time
  //   - CSS variable via ref: Rejected — more indirection for the same result

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
      <h3 className="mb-2 px-4 pt-3 text-sm font-medium text-text-muted">{title}</h3>
      <iframe
        ref={iframeRef}
        src={`${EMBED_BASE}?embed=${embedId}&theme=dark&bg=transparent&accent=${CHART_ACCENT}&muted=${CHART_MUTED}`}
        title={title}
        className={`mt-auto w-full border-none${height == null ? ' h-80 sm:h-96' : ''}`}
        style={height != null ? { height: `${height}px` } : undefined}
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
        <ChartEmbed embedId="daily-distribution" title="Most Active Days" />
        <ChartEmbed embedId="hourly-distribution" title="Peak Working Hours" />
      </div>
    </Section>
    </div>
  )
}
