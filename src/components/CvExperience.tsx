// Experience "level" (eyebrow: Campaign Log) — a stack of roles, each with period,
// company, summary, and amber-bulleted highlights. Faithful port of the handoff.

import { cvData } from '../data/cv-data'
import CvSectionHeading from './CvSectionHeading'

export default function CvExperience() {
  return (
    <section>
      <CvSectionHeading title="Experience" eyebrow="Campaign Log" />
      <div className="flex flex-col gap-[26px]">
        {cvData.experience.map((job) => (
          <article key={job.id} className="grid gap-1.5 break-inside-avoid">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
              <h3 className="m-0 font-serif text-[1.2rem] font-semibold text-heading">
                {job.role}
              </h3>
              <span className="whitespace-nowrap font-mono text-[11px] tracking-[0.04em] text-text-dim">
                {job.period}
              </span>
            </div>
            <div className="text-[1rem] italic text-link">{job.company}</div>
            <p className="mt-1.5 text-[0.9375rem] leading-[1.65] text-text">
              {job.description}
            </p>
            <ul className="m-0 mt-2 flex list-none flex-col gap-[5px] p-0">
              {job.highlights.map((h) => (
                <li
                  key={h}
                  className="relative pl-5 text-[0.9rem] leading-[1.55] text-[#3a2f22]"
                >
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-0 font-mono text-accent"
                  >
                    &#9642;
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  )
}
