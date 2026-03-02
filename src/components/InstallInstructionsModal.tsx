// Requirement: Accessible modal for PWA install instructions on unsupported browsers
// Approach: role="dialog", aria-modal, aria-labelledby, Escape key handler, and focus
//   trap for screen reader and keyboard accessibility
// Alternatives considered:
//   - Headless UI dialog: Rejected — adds a dependency for a single modal
//   - No focus trap: Rejected — keyboard users can Tab behind the modal, violating
//     WCAG 2.1 SC 2.4.3 (Focus Order) for aria-modal="true" dialogs

import { useEffect, useRef } from 'react'

interface InstallInstructionsModalProps {
  browser: string
  steps: string[]
  note?: string
  onClose: () => void
}

export default function InstallInstructionsModal({
  browser,
  steps,
  note,
  onClose,
}: InstallInstructionsModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // Requirement: Escape key must close the modal (standard dialog behavior)
  // Requirement: Focus must be trapped inside the modal while open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      // Focus trap: cycle Tab focus within the dialog
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    // Auto-focus the close button so keyboard users land inside the modal
    const closeBtn = dialogRef.current?.querySelector<HTMLElement>('button')
    closeBtn?.focus()

    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 no-print"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-modal-title"
        className="mx-4 w-full max-w-md rounded-xl bg-surface border border-border p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="install-modal-title" className="text-lg font-semibold text-text">
          Install on {browser}
        </h2>

        {steps.length > 0 && (
          <ol className="mt-4 space-y-2">
            {steps.map((step, i) => (
              <li key={step} className="flex gap-2 text-sm text-text-muted">
                <span className="font-medium text-primary">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        )}

        {note && (
          <p className="mt-4 text-sm text-text-muted italic">{note}</p>
        )}

        <div className="mt-5 space-y-2">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">
            Benefits
          </p>
          <ul className="space-y-1 text-sm text-text-muted">
            <li>Works offline</li>
            <li>Quick access from home screen</li>
            <li>Full-screen experience</li>
          </ul>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-md bg-surface-light px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-border"
        >
          Close
        </button>
      </div>
    </div>
  )
}
