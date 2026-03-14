import Section from './Section'
import ProjectImage from './ProjectImage'
import type { ProjectItem } from '../data/cv-data'

// Requirement: Display project cards with screenshot on the left, text on the right
// Approach: Horizontal flex layout per card, portrait screenshot on left (fixed width),
//   text content fills remaining space. Falls back to favicon then placeholder.
// Alternatives considered:
//   - Screenshot above card (blog-style): Rejected — portrait phone screenshots are too tall
//   - Card flip animation: Rejected — gimmicky for a CV site
//   - Lightbox modal: Rejected — adds complexity without enough value for this use case

interface ProjectsProps {
  items: ProjectItem[]
}

export default function Projects({ items }: ProjectsProps) {
  return (
    <Section title="Projects">
      <div className="grid gap-6 sm:grid-cols-2">
        {items.map((project) => (
          <div
            key={project.id}
            className="flex overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-primary"
          >
            {/* Screenshot / favicon / placeholder — fixed width on left */}
            <div className="w-24 shrink-0 overflow-hidden border-r border-border sm:w-28 print:w-20">
              <ProjectImage
                screenshot={project.screenshot}
                name={project.name}
              />
            </div>

            {/* Text content on right */}
            <div className="flex min-w-0 flex-1 flex-col p-4">
              <h3 className="mb-1 text-lg font-semibold text-text">
                {project.name}
              </h3>
              <p className="mb-3 text-sm text-text-muted">
                {project.description}
              </p>
              <div className="mt-auto flex flex-wrap gap-1">
                {project.tech.map((t) => (
                  <span
                    key={t}
                    className="rounded bg-background px-2 py-0.5 text-xs text-primary"
                  >
                    {t}
                  </span>
                ))}
              </div>
              {project.link && (
                <a
                  href={project.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm text-primary hover:text-primary-light"
                >
                  View Project &rarr;
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
