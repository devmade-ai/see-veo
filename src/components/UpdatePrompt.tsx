import { useState } from 'react'

// Requirement: Show a prominent top banner when a PWA update is available
// Approach: Full-width fixed banner pinned to the top of the viewport with
//   high z-index so it's impossible to miss. Includes error state and loading feedback.
// Alternatives considered:
//   - Bottom-right toast: Rejected — user reported it was not visible after latest changes
//   - Modal dialog: Rejected — too intrusive for a non-blocking notification

interface UpdatePromptProps {
  onUpdate: () => void
}

export default function UpdatePrompt({ onUpdate }: UpdatePromptProps) {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState(false)

  const handleUpdate = () => {
    setUpdating(true)
    setError(false)
    try {
      onUpdate()
    } catch {
      setError(true)
      setUpdating(false)
    }
  }

  // Requirement: Safe area clearance on notched devices + WCAG 2.5.5 touch targets (44px min)
  // Approach: pt uses max() to pick the larger of base padding or safe-area-inset-top;
  //   button uses min-h-[44px] for touch compliance
  // Alternatives considered:
  //   - Fixed padding with no safe area: Rejected — content hidden behind notch on iOS
  return (
    <div
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 bg-primary px-4 py-2.5 text-background shadow-lg no-print"
      style={{ paddingTop: 'max(0.625rem, env(safe-area-inset-top))' }}
    >
      <p className="text-sm font-medium">
        {error
          ? 'Update failed — please try again.'
          : 'A new version is available.'}
      </p>
      <button
        type="button"
        onClick={handleUpdate}
        disabled={updating && !error}
        className="inline-flex min-h-[44px] shrink-0 items-center rounded-md bg-background px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-background/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {updating && !error ? 'Updating…' : 'Refresh now'}
      </button>
    </div>
  )
}
