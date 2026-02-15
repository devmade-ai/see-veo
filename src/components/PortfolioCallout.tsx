/**
 * Requirement: Make it clear that this app itself is proof of the author's skills.
 * Approach: A small, visually distinct callout between Hero and About that explicitly
 * frames the site as a portfolio piece. Uses a left-border accent style to stand out
 * without being intrusive.
 * Alternatives considered:
 *   - Inline text in the About section: Rejected — About already has a code snippet
 *     and mixing prose with it would feel disjointed.
 *   - Modal/popup on first visit: Rejected — intrusive and annoying for recruiters
 *     who just want to scan the CV quickly.
 */
export default function PortfolioCallout() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 no-print">
      <div className="rounded-r-lg border-l-4 border-primary bg-surface px-6 py-4">
        <p className="text-sm leading-relaxed text-text-muted">
          <span className="font-semibold text-text">
            You're looking at a live portfolio piece.
          </span>{' '}
          This site was designed, built, and deployed by me — React, TypeScript,
          Tailwind CSS, Vite, and PWA support included. The source code is{' '}
          <a
            href="https://github.com/devmade-ai/see-veo"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-light"
          >
            open on GitHub
          </a>
          .
        </p>
      </div>
    </div>
  )
}
