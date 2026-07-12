// Contact "level" (eyebrow: Final Stage) — the end-of-game call to action. Keeps the
// handoff's copy and the "THANKS FOR PLAYING" flourish, and adapts the app's real
// functional bits into the design: the interest form (personal SMTP relay), a mailto
// + social links, and the PWA install affordance (button when the browser supports it,
// or a "how to install" link for Safari/Firefox where it can't be triggered directly).

import { cvData } from '../data/cv-data'
import CvSectionHeading from './CvSectionHeading'
import InterestForm from './InterestForm'

interface CvContactProps {
  canInstall: boolean
  isInstalled: boolean
  onInstall: () => void
  showManualInstructions: boolean
  onShowInstructions: () => void
}

// Secondary "outline" link/button — squared, ink hairline, amber on hover.
const OUTLINE_CLASS =
  'inline-flex min-h-[48px] items-center border border-[rgba(43,33,24,0.3)] bg-transparent px-5 font-mono text-[12px] tracking-[0.08em] text-text transition-colors hover:border-primary hover:text-link'

export default function CvContact({
  canInstall,
  isInstalled,
  onInstall,
  showManualInstructions,
  onShowInstructions,
}: CvContactProps) {
  const { personal } = cvData

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
      </div>

      <div className="mt-[34px] flex items-center gap-3 font-pixel text-[9px] uppercase tracking-[0.04em] text-text-dim">
        <span>Thanks for playing</span>
        <span className="h-px flex-1 bg-[rgba(43,33,24,0.18)]" />
        <span className="text-link">&#9733; &#9733; &#9733;</span>
      </div>
    </section>
  )
}
