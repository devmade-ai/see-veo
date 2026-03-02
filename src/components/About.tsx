import Section from './Section'

interface AboutProps {
  paragraphs: string[]
}

export default function About({ paragraphs }: AboutProps) {
  return (
    <Section title="About">
      <div className="space-y-4">
        {paragraphs.map((text, index) => (
          <p key={index} className="leading-relaxed text-text-muted">
            {text}
          </p>
        ))}
      </div>
    </Section>
  )
}
