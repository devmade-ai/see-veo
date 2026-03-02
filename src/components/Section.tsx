import type { ReactNode } from 'react'

interface SectionProps {
  title: string
  children: ReactNode
}

export default function Section({ title, children }: SectionProps) {
  return (
    <section className="mb-16">
      <h2 className="mb-8 text-2xl font-bold text-primary">{title}</h2>
      <div>{children}</div>
    </section>
  )
}
