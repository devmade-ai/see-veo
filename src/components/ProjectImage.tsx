import { useState } from 'react'

// Requirement: Display project screenshots with graceful fallback using project accent color
// Approach: screenshot → colored initials placeholder (uses project's brand color)
// Alternatives considered:
//   - Google Favicon API: Rejected — external dependency, privacy concern
//   - Neutral gray placeholder: Rejected — accent color adds visual identity without screenshots

interface ProjectImageProps {
  screenshot?: string
  name: string
  /** Project brand color for the initials placeholder (resolved by caller) */
  accent: string
}

function PlaceholderIcon({ name, accent }: { name: string; accent: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex h-full w-full items-center justify-center bg-background">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accent}20` }}
      >
        <span
          className="text-lg font-semibold"
          style={{ color: accent }}
        >
          {initials}
        </span>
      </div>
    </div>
  )
}

export default function ProjectImage({ screenshot, name, accent }: ProjectImageProps) {
  const [failed, setFailed] = useState(false)

  if (!screenshot || failed) {
    return <PlaceholderIcon name={name} accent={accent} />
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
