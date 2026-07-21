// Contact "level" (eyebrow: Final Stage) — the end-of-game call to action. Keeps the
// handoff's copy and the "THANKS FOR PLAYING" flourish, and adapts the app's real
// functional bits into the design: the interest form (personal SMTP relay), a mailto
// + social links, and the PWA install affordance (button when the browser supports it,
// or a "how to install" link for Safari/Firefox where it can't be triggered directly).

import { useEffect, useRef, useState } from 'react'
import { cvData } from '../data/cv-data'
import CvSectionHeading from './CvSectionHeading'
import InterestForm from './InterestForm'
import type { UpdateCheckResult } from '../hooks/usePWAUpdate'

interface CvContactProps {
  canInstall: boolean
  isInstalled: boolean
  onInstall: () => void
  showManualInstructions: boolean
  onShowInstructions: () => void
  onCheckForUpdates: () => Promise<UpdateCheckResult>
}

// Secondary "outline" link/button — squared, ink hairline, amber on hover.
const OUTLINE_CLASS =
  'inline-flex min-h-[48px] items-center border border-[rgba(43,33,24,0.3)] bg-transparent px-5 font-mono text-[12px] tracking-[0.08em] text-text transition-colors hover:border-primary hover:text-link'

// Requirement: A user-reachable "Check for updates" action (fleet Update Application
//   Policy) in an app with no menu/settings surface — with plain-language results.
// Approach: Placed beside the PWA install affordance. The Contact level is already the
//   app-management corner of the CV (install button / how-to-install link), so the check
//   action and its result line belong in the same row.
// Alternatives considered:
//   - The SFX/PDF header cluster: Rejected — that is primary game chrome; a third
//     utility button there adds noise for a rarely used action
//   - Inside the UpdatePrompt banner: Rejected — the banner only shows once an update
//     is already known, which is exactly when checking is pointless
const CHECK_RESULT_COPY: Record<UpdateCheckResult, string> = {
  'no-sw': "This browser can't check for updates.",
  'up-to-date': "You're up to date.",
  'update-available': 'New version found — see the update bar at the top of the page.',
  error: "Couldn't check right now — please try again.",
}

export default function CvContact({
  canInstall,
  isInstalled,
  onInstall,
  showManualInstructions,
  onShowInstructions,
  onCheckForUpdates,
}: CvContactProps) {
  const { personal } = cvData
  const [checkStatus, setCheckStatus] = useState<'idle' | 'checking' | UpdateCheckResult>('idle')

  // The check awaits a ~1.5s settle inside the hook; guard the result setState against
  // this component unmounting mid-wait (it unmounts when the runner leaves the level).
  const mountedRef = useRef(true)
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const handleCheck = async () => {
    setCheckStatus('checking')
    let result: UpdateCheckResult
    try {
      result = await onCheckForUpdates()
    } catch {
      result = 'error'
    }
    if (mountedRef.current) setCheckStatus(result)
  }

  return (
    <section>
      <CvSectionHeading title="Get in Touch" eyebrow="Final Stage" />

      <p className="max-w-[40rem] text-[1.0625rem] leading-[1.7] text-text">
        You reached the end of the level. If you think I&rsquo;d be a good fit for what
        you&rsquo;re building, I&rsquo;d love to hear about it &mdash; drop me a line and
        I&rsquo;ll get back to you soon.
      </p>

      <div className="mt-[22px]">
        <InterestForm />
      </div>

      <div className="mt-[22px] flex flex-wrap gap-3">
        <a href={`mailto:${personal.email}`} className={OUTLINE_CLASS}>
          Email
        </a>
        <a
          href={personal.linkedin.url}
          target="_blank"
          rel="noopener noreferrer"
          className={OUTLINE_CLASS}
        >
          LinkedIn
        </a>
        <a
          href={personal.github.url}
          target="_blank"
          rel="noopener noreferrer"
          className={OUTLINE_CLASS}
        >
          GitHub
        </a>

        {/* Adapted PWA install — kept from the previous app, restyled to fit here. */}
        {!isInstalled && canInstall && (
          <button type="button" onClick={onInstall} className={OUTLINE_CLASS}>
            &#8595; Install app
          </button>
        )}
        {!isInstalled && !canInstall && showManualInstructions && (
          <button type="button" onClick={onShowInstructions} className={OUTLINE_CLASS}>
            How to install
          </button>
        )}

        {/* Fleet-standard manual update check — lives next to the install affordance. */}
        <button
          type="button"
          onClick={() => void handleCheck()}
          disabled={checkStatus === 'checking'}
          className={`${OUTLINE_CLASS} disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {checkStatus === 'checking' ? 'Checking…' : 'Check for updates'}
        </button>
      </div>

      {/* Always-mounted live region so screen readers announce the check result. */}
      <p
        role="status"
        className="mt-3 min-h-[1em] font-mono text-[11px] tracking-[0.02em] text-text-muted"
      >
        {checkStatus !== 'idle' && checkStatus !== 'checking'
          ? CHECK_RESULT_COPY[checkStatus]
          : ''}
      </p>

      <div className="mt-[34px] flex items-center gap-3 font-pixel text-[9px] uppercase tracking-[0.04em] text-text-dim">
        <span>Thanks for playing</span>
        <span className="h-px flex-1 bg-[rgba(43,33,24,0.18)]" />
        <span className="text-link">&#9733; &#9733; &#9733;</span>
      </div>
    </section>
  )
}
