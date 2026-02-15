import Section from './Section'

interface AboutProps {
  text: string
}

/**
 * Renders the about section. If the text looks like a code snippet
 * (starts with common code keywords), it renders inside a styled
 * code block. Otherwise it renders as a paragraph.
 */
export default function About({ text }: AboutProps) {
  const isCode = text.trimStart().startsWith('public ')
    || text.trimStart().startsWith('class ')
    || text.trimStart().startsWith('function ')

  return (
    <Section title="About">
      {isCode ? (
        <pre className="overflow-x-auto rounded-lg bg-surface border border-border p-4 text-sm leading-relaxed text-primary">
          <code>{text}</code>
        </pre>
      ) : (
        <p className="leading-relaxed text-text-muted">{text}</p>
      )}
    </Section>
  )
}
