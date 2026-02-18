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

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 bg-primary px-4 py-2.5 text-background shadow-lg no-print">
      <p className="text-sm font-medium">
        {error
          ? 'Update failed — please try again.'
          : 'A new version is available.'}
      </p>
      <button
        type="button"
        onClick={handleUpdate}
        disabled={updating && !error}
        className="rounded-md bg-background px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-background/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {updating && !error ? 'Updating…' : 'Refresh now'}
      </button>
    </div>
  )
}
