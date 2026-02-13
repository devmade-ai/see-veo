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
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 no-print"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-md rounded-xl bg-surface border border-border p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-text">
          Install on {browser}
        </h2>

        {steps.length > 0 && (
          <ol className="mt-4 space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm text-text-muted">
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
          onClick={onClose}
          className="mt-6 w-full rounded-md bg-surface-light px-4 py-2 text-sm font-medium text-text transition-colors hover:bg-border"
        >
          Close
        </button>
      </div>
    </div>
  )
}
