import type { PersonalInfo } from '../data/cv-data'

interface HeroProps {
  personal: PersonalInfo
}

export default function Hero({ personal }: HeroProps) {
  return (
    <header className="bg-surface px-4 py-20 text-center">
      <div className="mx-auto max-w-4xl">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl font-bold text-background">
          {personal.avatarInitials}
        </div>
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-text sm:text-5xl">
          {personal.name}
        </h1>
        <p className="mb-4 text-xl text-primary">{personal.title}</p>
        <p className="mb-2 text-lg text-text-muted">{personal.tagline}</p>
        <p className="text-sm text-text-muted">{personal.location}</p>
      </div>
    </header>
  )
}
