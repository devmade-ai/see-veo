import Section from './Section'
import type { ProjectItem } from '../data/cv-data'

interface ProjectsProps {
  items: ProjectItem[]
}

export default function Projects({ items }: ProjectsProps) {
  return (
    <Section title="Projects">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((project, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-surface p-6 transition-colors hover:border-primary"
          >
            <h3 className="mb-2 text-lg font-semibold text-text">
              {project.name}
            </h3>
            <p className="mb-4 text-sm text-text-muted">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-1">
              {project.tech.map((t, j) => (
                <span
                  key={j}
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
                className="mt-4 inline-block text-sm text-primary hover:text-primary-light"
              >
                View Project &rarr;
              </a>
            )}
          </div>
        ))}
      </div>
    </Section>
  )
}
