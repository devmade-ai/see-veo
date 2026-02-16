// Requirement: Consolidate page header into Hero — removed separate site header
// Approach: Hero accepts action button props (install, PDF) and renders them below personal info
// Alternatives considered:
//   - Floating bottom bar: Rejected — takes up screen real estate on mobile
//   - Footer placement: Rejected — users expect actions near the top of the page

import type { PersonalInfo } from '../data/cv-data'

interface HeroProps {
  personal: PersonalInfo
  /** Whether the native PWA install prompt is available */
  canInstall?: boolean
  /** Callback to trigger native PWA install */
  onInstall?: () => void
  /** Whether to show the manual install instructions button */
  showManualInstructions?: boolean
  /** Callback to open install instructions modal */
  onShowInstructions?: () => void
}

export default function Hero({
  personal,
  canInstall,
  onInstall,
  showManualInstructions,
  onShowInstructions,
}: HeroProps) {
  return (
    <header className="bg-surface px-4 py-20 text-center">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-background">
          {personal.avatarInitials}
        </div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-text sm:text-5xl">
          {personal.name}
        </h1>
        <p className="mb-4 text-xl text-primary">{personal.title}</p>
        <p className="mb-2 text-lg text-text-muted">{personal.tagline}</p>
        <p className="text-sm text-text-muted">{personal.location}</p>

        <div className="mt-6 flex justify-center gap-3 no-print">
          {canInstall && onInstall && (
            <button
              type="button"
              onClick={onInstall}
              className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-background transition-colors hover:bg-primary-light"
            >
              Install as an App
            </button>
          )}
          {showManualInstructions && onShowInstructions && (
            <button
              type="button"
              onClick={onShowInstructions}
              className="rounded-md bg-surface-light px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-border"
            >
              How to Install
            </button>
          )}
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-md bg-surface-light px-3 py-1.5 text-sm font-medium text-text transition-colors hover:bg-border"
          >
            Download as PDF
          </button>
        </div>
      </div>
    </header>
  )
}
