import { useState } from 'react'

// Requirement: Display project screenshots with graceful fallback chain
// Approach: screenshot → Google Favicon API → SVG placeholder
// Alternatives considered:
//   - Direct /favicon.ico fetch: Rejected — not all Vite apps serve at that path
//   - Self-hosted favicons: Rejected — extra maintenance, Google API is reliable
//   - No fallback: Rejected — empty space looks broken

interface ProjectImageProps {
  screenshot?: string
  link?: string
  name: string
}

type FallbackStage = 'screenshot' | 'favicon' | 'placeholder'

/** Extracts the domain from a full URL for the Google Favicon API */
function getDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return ''
  }
}

/** Generic app placeholder shown when no screenshot or favicon is available */
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

export default function ProjectImage({ screenshot, link, name }: ProjectImageProps) {
  const [stage, setStage] = useState<FallbackStage>(
    screenshot ? 'screenshot' : link ? 'favicon' : 'placeholder'
  )

  const handleError = () => {
    if (stage === 'screenshot' && link) {
      setStage('favicon')
    } else {
      setStage('placeholder')
    }
  }

  if (stage === 'placeholder') {
    return <PlaceholderIcon name={name} />
  }

  if (stage === 'favicon') {
    const domain = getDomain(link!)
    if (!domain) return <PlaceholderIcon name={name} />

    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
          alt={`${name} icon`}
          width={48}
          height={48}
          className="rounded-lg"
          onError={() => setStage('placeholder')}
        />
      </div>
    )
  }

  // stage === 'screenshot'
  return (
    <img
      src={screenshot}
      alt={`${name} screenshot`}
      className="h-full w-full object-cover object-top"
      onError={handleError}
    />
  )
}
