import Section from './Section'
import SkillBadge from './SkillBadge'
import type { SkillCategory } from '../data/cv-data'

interface SkillsProps {
  categories: SkillCategory[]
}

export default function Skills({ categories }: SkillsProps) {
  return (
    <Section title="Skills">
      <div className="space-y-6">
        {categories.map((cat, i) => (
          <div key={i}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
              {cat.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {cat.skills.map((skill, j) => (
                <SkillBadge key={j} name={skill} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}
