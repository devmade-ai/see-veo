import { useState } from 'react'

// Requirement: Show a prominent banner when a PWA update is available (kept from the
//   previous app), restyled to the "The Applicant" ink-on-paper theme.
// Approach: Full-width fixed banner pinned to the top with a high z-index, ink fill,
//   paper text, and a squared "refresh" button. Includes error + loading feedback.
// Alternatives considered:
//   - autoUpdate (no prompt): Rejected — the project convention is user-controlled
//     updates so a refresh never interrupts mid-read

interface UpdatePromptProps {
  onUpdate: () => void
}

export default function UpdatePrompt({ onUpdate }: UpdatePromptProps) {
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
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 bg-primary px-4 py-2.5 text-primary-ink shadow-[0_2px_0_rgba(43,33,24,0.4)] no-print"
      style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top))' }}
    >
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
  )
}
