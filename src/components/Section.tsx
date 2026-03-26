import type { ReactNode } from 'react'

interface SectionProps {
  title: string
  children: ReactNode
}

export default function Section({ title, children }: SectionProps) {
  // Requirement: Screen readers must associate sections with their headings
  // Approach: aria-labelledby links the <section> landmark to its <h2> via a stable ID
  // Alternatives considered:
  //   - aria-label with title string: Rejected — duplicates text, aria-labelledby is preferred
  //     when a visible heading already exists (WCAG 1.3.1)
  const id = `section-${title.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <section className="mb-16" aria-labelledby={id}>
      <h2 id={id} className="mb-8 text-2xl font-bold text-primary">{title}</h2>
      <div>{children}</div>
    </section>
  )
}
