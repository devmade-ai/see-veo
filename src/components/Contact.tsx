import Section from './Section'
import type { ContactInfo } from '../data/cv-data'

interface ContactProps {
  info: ContactInfo
}

export default function Contact({ info }: ContactProps) {
  return (
    <Section title="Contact">
      <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
        <a
          href={`mailto:${info.email}`}
          className="text-primary hover:text-primary-light"
        >
          {info.email}
        </a>
        <a
          href={info.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-light"
        >
          LinkedIn
        </a>
        <a
          href={info.github}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary-light"
        >
          GitHub
        </a>
        {info.website && (
          <a
            href={info.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-light"
          >
            Website
          </a>
        )}
      </div>
    </Section>
  )
}
