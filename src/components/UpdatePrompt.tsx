import { useState } from 'react'

// Requirement: Show a prominent banner when a PWA update is available, restyled to the
//   "The Applicant" ink-on-paper theme — now also carrying the fleet-standard
//   "Automatic updates" preference (glow-props PWA_SYSTEM.md → Update Application
//   Policy: auto-on-launch, default ON, OFF = tap-only).
// Approach: Full-width fixed banner pinned to the top with ink fill, paper text, a
//   squared "refresh" button, and a small checkbox row for the auto-update toggle.
//   The toggle lives HERE because see-veo has no menu/settings surface — the update
//   banner is the one moment the update system is visible, so the preference rides
//   with it (visible whenever the prompt shows).
// Alternatives considered:
//   - autoUpdate (no prompt): Rejected — the fleet policy forbids mid-session reloads
//   - A dedicated settings surface for the toggle: Rejected — a whole new UI surface
//     for one preference on a single-screen CV; the banner keeps the design intact

interface UpdatePromptProps {
  onUpdate: () => void | Promise<void>
  autoUpdateEnabled: boolean
  onToggleAutoUpdate: (on: boolean) => void
}

export default function UpdatePrompt({
  onUpdate,
  autoUpdateEnabled,
  onToggleAutoUpdate,
}: UpdatePromptProps) {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(false)

  // onUpdate wraps an async service-worker update — await it so rejections surface.
  const handleUpdate = async () => {
    setUpdating(true)
    setError(false)
    try {
      await onUpdate()
    } catch {
      setError(true)
      setUpdating(false)
    }
  }

  // Safe-area clearance on notched devices + WCAG 2.5.5 touch targets (44px min).
  return (
    <div
      className="fixed inset-x-0 top-0 z-50 flex flex-col items-center bg-primary px-4 pb-1 pt-2.5 text-primary-ink shadow-[0_2px_0_rgba(43,33,24,0.4)] no-print"
      style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top))' }}
    >
      <div className="flex items-center justify-center gap-3">
        <p className="font-mono text-[12px] tracking-[0.02em]">
          {error ? 'Update failed — please try again.' : 'A new version is available.'}
        </p>
        <button
          type="button"
          onClick={() => void handleUpdate()}
          disabled={updating && !error}
          className="inline-flex min-h-[44px] shrink-0 items-center border border-primary-ink bg-primary-ink px-4 font-mono text-[11px] uppercase tracking-[0.06em] text-primary transition-colors hover:bg-transparent hover:text-primary-ink disabled:cursor-not-allowed disabled:opacity-50"
        >
          {updating && !error ? 'Updating…' : 'Refresh now'}
        </button>
      </div>
      <label className="flex min-h-[44px] cursor-pointer select-none items-center gap-2 font-mono text-[11px] tracking-[0.02em] text-primary-ink/80">
        <input
          type="checkbox"
          checked={autoUpdateEnabled}
          onChange={(e) => onToggleAutoUpdate(e.target.checked)}
          className="size-3.5 accent-accent"
        />
        Automatic updates — applied next time the app opens
      </label>
    </div>
  )
}
