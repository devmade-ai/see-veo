import Section from './Section'
import TimelineItem from './TimelineItem'
import type { EducationItem } from '../data/cv-data'

interface EducationProps {
  items: EducationItem[]
}

export default function Education({ items }: EducationProps) {
  return (
    <Section title="Education">
      {items.map((item, i) => (
        <TimelineItem
          key={i}
          title={item.degree}
          subtitle={item.institution}
          period={item.period}
          description={item.description}
        />
      ))}
    </Section>
  )
}
