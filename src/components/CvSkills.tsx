// Skills "level" (eyebrow: Inventory) — a ruled grid of categories, each a mono
// caps label over a comma-joined skill line. Faithful port of the handoff.

import { cvData } from '../data/cv-data'
import CvSectionHeading from './CvSectionHeading'

export default function CvSkills() {
  return (
    <section>
      <CvSectionHeading title="Skills" eyebrow="Inventory" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] border-t border-[rgba(43,33,24,0.16)]">
        {cvData.skills.map((cat) => (
          <div
            key={cat.id}
            className="border-b border-[rgba(43,33,24,0.16)] px-[18px] py-4"
          >
            <div className="mb-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-heading">
              {cat.category}
            </div>
            <div className="text-[0.9375rem] leading-[1.7] text-[#3a2f22]">
              {cat.skills.join(', ')}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
