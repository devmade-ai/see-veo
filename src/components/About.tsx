import Section from './Section'

interface AboutProps {
  text: string
}

export default function About({ text }: AboutProps) {
  return (
    <Section title="About">
      <p className="leading-relaxed text-text-muted">{text}</p>
    </Section>
  )
}
