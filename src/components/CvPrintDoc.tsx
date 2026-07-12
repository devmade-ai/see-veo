// Print-only CV: a clean, paginated document shown only when printing / saving to
// PDF (the interactive game shell is hidden by the print stylesheet). Faithful port
// of the handoff's [data-print-cv] block. Uses slightly darker print inks than the
// on-screen palette so text stays crisp on white paper.

import { cvData } from '../data/cv-data'

export default function CvPrintDoc() {
  const { personal, experience, projects, skills, education } = cvData

  return (
    <div className="mx-auto hidden max-w-[720px] font-serif text-[12px] leading-[1.5] text-[#1a140d] print:block">
      <header className="mb-[18px] border-b-2 border-[#1a140d] pb-3">
        <h1 className="m-0 font-serif text-[30px] font-bold tracking-[-0.01em]">
          {personal.name}
        </h1>
        <div className="mt-[3px] text-[13px] italic text-[#4a3d2c]">{personal.title}</div>
        <div className="mt-[7px] flex flex-wrap gap-x-4 gap-y-[3px] font-mono text-[10px] text-[#6b5a44]">
          <span>{personal.location}</span>
          <span>{personal.linkedin.label}</span>
          <span>{personal.github.label}</span>
        </div>
        <p className="mt-2.5 text-[12px] italic text-[#4a3d2c]">
          &ldquo;{personal.quote}&rdquo;
        </p>
      </header>

      <section className="mb-4">
        <h2 className="mb-[9px] mt-0 text-[12px] font-bold uppercase tracking-[0.1em]">
          Experience
        </h2>
        {experience.map((job) => (
          <div key={job.id} className="mb-3 break-inside-avoid">
            <div className="flex items-baseline justify-between gap-3">
              <strong className="text-[13px]">{job.role}</strong>
              <span className="whitespace-nowrap font-mono text-[10px] text-[#6b5a44]">
                {job.period}
              </span>
            </div>
            <div className="mt-px text-[12px] italic text-[#3a2f22]">{job.company}</div>
            <p className="mt-1 text-[11.5px] text-[#2b2118]">{job.description}</p>
            <ul className="mt-1 list-disc pl-4">
              {job.highlights.map((h) => (
                <li key={h} className="mb-0.5 text-[11.5px] text-[#2b2118]">
                  {h}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="mb-4">
        <h2 className="mb-[9px] mt-0 text-[12px] font-bold uppercase tracking-[0.1em]">
          Selected Projects
        </h2>
        {projects.map((project) => (
          <div key={project.id} className="mb-2 break-inside-avoid">
            <div className="flex items-baseline justify-between gap-3">
              <strong className="text-[12.5px]">{project.name}</strong>
              <span className="whitespace-nowrap font-mono text-[10px] text-[#6b5a44]">
                {project.stack}
              </span>
            </div>
            <p className="mt-0.5 text-[11.5px] text-[#2b2118]">{project.description}</p>
          </div>
        ))}
      </section>

      <section className="mb-4">
        <h2 className="mb-[9px] mt-0 text-[12px] font-bold uppercase tracking-[0.1em]">
          Skills
        </h2>
        {skills.map((cat) => (
          <div key={cat.id} className="mb-[5px] break-inside-avoid">
            <span className="text-[11.5px] font-bold">{cat.category}: </span>
            <span className="text-[11.5px] text-[#2b2118]">{cat.skills.join(', ')}</span>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-[9px] mt-0 text-[12px] font-bold uppercase tracking-[0.1em]">
          Education &amp; Credentials
        </h2>
        {education.map((edu) => (
          <div
            key={edu.id}
            className="mb-1.5 flex items-baseline justify-between gap-3 break-inside-avoid"
          >
            <div>
              <strong className="text-[12px]">{edu.degree}</strong>
              <div className="text-[11.5px] italic text-[#4a3d2c]">{edu.institution}</div>
            </div>
            <span className="whitespace-nowrap font-mono text-[10px] text-[#6b5a44]">
              {edu.period}
            </span>
          </div>
        ))}
      </section>
    </div>
  )
}
