import { useState } from 'react'

// Requirement: Display project screenshots with graceful fallback
// Approach: screenshot → initials placeholder
// Alternatives considered:
//   - Google Favicon API: Rejected — external dependency, privacy concern
//   - Direct /favicon.ico fetch: Rejected — not all Vite apps serve at that path
//   - Self-hosted favicons: Rejected — extra maintenance per project

interface ProjectImageProps {
  screenshot?: string
  name: string
}

/** Generic app placeholder shown when no screenshot is available */
function PlaceholderIcon({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-light">
        <span className="text-lg font-semibold text-text-muted">{initials}</span>
      </div>
    </div>
  )
}

export default function ProjectImage({ screenshot, name }: ProjectImageProps) {
  const [failed, setFailed] = useState(false)

  if (!screenshot || failed) {
    return <PlaceholderIcon name={name} />
  }

  return (
    <img
      src={screenshot}
      alt={`${name} screenshot`}
      className="h-full w-full object-cover object-top"
      onError={() => setFailed(true)}
    />
  )
}
