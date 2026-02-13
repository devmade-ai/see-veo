interface UpdatePromptProps {
  onUpdate: () => void
}

export default function UpdatePrompt({ onUpdate }: UpdatePromptProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg bg-surface border border-border px-4 py-3 shadow-lg no-print">
      <p className="text-sm text-text">A new version is available.</p>
      <button
        onClick={onUpdate}
        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-background transition-colors hover:bg-primary-light"
      >
        Update
      </button>
    </div>
  )
}
