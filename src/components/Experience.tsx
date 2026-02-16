import Section from './Section'
import TimelineItem from './TimelineItem'
import type { ExperienceItem } from '../data/cv-data'

interface ExperienceProps {
  items: ExperienceItem[]
}

export default function Experience({ items }: ExperienceProps) {
  return (
    <Section title="Experience">
      {items.map((item) => (
        <TimelineItem
          key={item.id}
          title={item.role}
          subtitle={item.company}
          period={item.period}
          location={item.location}
          description={item.description}
          highlights={item.highlights}
        />
      ))}
    </Section>
  )
}
