import Section from './Section'
import ProjectImage from './ProjectImage'
import type { ProjectItem } from '../data/cv-data'

// Requirement: Project cards with per-project accent color for visual identity
// Approach: CSS custom property --accent set on each card, consumed by child elements
//   for left border, initials placeholder, and tech badge styling. Inline style is
//   required here because accent colors are data-driven (per-project hex values) and
//   cannot be resolved by Tailwind at build time.
// Alternatives considered:
//   - Full card background tint: Rejected — user chose "subtle" accent level
//   - Tailwind safelist with fixed colors: Rejected — fragile, adds unused CSS
//   - Screenshot-based identity: Rejected — screenshots not uploaded

interface ProjectsProps {
  items: ProjectItem[]
}

/** Default accent for projects without a custom color */
const DEFAULT_ACCENT = '#a3a3a3'

export default function Projects({ items }: ProjectsProps) {
  return (
    <Section title="Projects">
      <div className="grid gap-6 sm:grid-cols-2">
        {items.map((project) => {
          const accent = project.accent ?? DEFAULT_ACCENT
          return (
            <div
              key={project.id}
              className="flex overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-text-muted/40"
              style={{
                borderLeftWidth: '3px',
                borderLeftColor: accent,
              }}
            >
              {/* Initials placeholder — uses project accent color */}
              <div className="aspect-[9/16] w-24 shrink-0 overflow-hidden border-r border-border sm:w-28 print:w-20">
                <ProjectImage
                  screenshot={project.screenshot}
                  name={project.name}
                  accent={accent}
                />
              </div>

              {/* Text content */}
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
                      className="rounded px-2 py-0.5 text-xs"
                      style={{
                        backgroundColor: `${accent}15`,
                        color: accent,
                      }}
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
                    aria-label={`View ${project.name}`}
                    className="mt-3 inline-flex min-h-[44px] items-center text-sm transition-opacity hover:opacity-80"
                    style={{ color: accent }}
                  >
                    View Project &rarr;
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
