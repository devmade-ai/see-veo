import { useState } from 'react'

// Requirement: Show a toast when a PWA update is available, with error handling on failure
// Approach: Local state to track update status, try-catch around onUpdate callback
// Alternatives considered:
//   - Fire-and-forget (no error handling): Rejected — user gets no feedback if update fails

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
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg bg-surface border border-border px-4 py-3 shadow-lg no-print">
      <div>
        <p className="text-sm text-text">
          {error ? 'Update failed. Please try again.' : 'A new version is available.'}
        </p>
      </div>
      <button
        type="button"
        onClick={handleUpdate}
        disabled={updating && !error}
        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-background transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50"
      >
        {updating && !error ? 'Updating...' : 'Update'}
      </button>
    </div>
  )
}
