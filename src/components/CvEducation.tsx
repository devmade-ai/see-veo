// Education "level" (eyebrow: Unlocks) — a ruled list of degrees and credentials,
// each with institution and period. Faithful port of the handoff.

import { cvData } from '../data/cv-data'
import CvSectionHeading from './CvSectionHeading'

export default function CvEducation() {
  return (
    <section>
      <CvSectionHeading title="Education & Credentials" eyebrow="Unlocks" />
      <div>
        {cvData.education.map((edu) => (
          <div
            key={edu.id}
            className="flex items-baseline gap-4 border-b border-[rgba(43,33,24,0.16)] py-3.5"
          >
            <div className="min-w-0 flex-1">
              <div className="font-serif text-[1.05rem] font-semibold text-heading">
                {edu.degree}
              </div>
              <div className="text-[0.95rem] italic text-text-muted">
                {edu.institution}
              </div>
            </div>
            <span className="shrink-0 whitespace-nowrap font-mono text-[11px] text-text-dim">
              {edu.period}
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
