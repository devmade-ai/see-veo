// Projects "level" (eyebrow: Side Quests) — paper cards with a hard ink drop-shadow,
// each linking out to the live deployment. Faithful port of the handoff.

import { cvData } from '../data/cv-data'
import CvSectionHeading from './CvSectionHeading'

export default function CvProjects() {
  return (
    <section>
      <CvSectionHeading title="Selected Projects" eyebrow="Side Quests" />
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,340px),1fr))] gap-4">
        {cvData.projects.map((project) => (
          <article
            key={project.id}
            className="flex flex-col border border-[rgba(43,33,24,0.2)] bg-surface p-[18px] shadow-[4px_4px_0_rgba(43,33,24,0.14)]"
          >
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <h3 className="m-0 font-serif text-[1.15rem] font-bold text-heading">
                {project.name}
              </h3>
              <span className="font-mono text-[10px] tracking-[0.06em] text-text-dim">
                {project.stack}
              </span>
            </div>
            <p className="mb-[14px] flex-1 text-[0.9rem] leading-[1.6] text-[#3a2f22]">
              {project.description}
            </p>
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="self-start border-b border-[rgba(180,115,42,0.4)] pb-px font-mono text-[11px] tracking-[0.08em] text-link hover:text-accent"
            >
              VISIT &rarr;
            </a>
          </article>
        ))}
      </div>
    </section>
  )
}
