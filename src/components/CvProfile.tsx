// Profile "level" — the CV masthead: name, title, contact meta, a signature quote,
// a positioning paragraph, a stat strip, and the game control hint with a blinking
// caret. Faithful port of the handoff's profile section.

import { cvData } from '../data/cv-data'

export default function CvProfile() {
  const { personal, profileIntro, stats } = cvData

  return (
    <section aria-labelledby="cv-name">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-primary pb-[18px]">
        <div className="min-w-0">
          <h1
            id="cv-name"
            className="m-0 font-serif text-[clamp(2.6rem,8vw,4.2rem)] font-bold leading-none tracking-[-0.015em] text-heading"
          >
            {personal.name}
          </h1>
          <div className="mt-2 text-[clamp(1rem,3.4vw,1.35rem)] italic text-text-muted">
            {personal.title}
          </div>
        </div>
        <div className="text-right font-mono text-[11.5px] leading-[1.9] text-text-muted">
          <div>{personal.location}</div>
          <div>
            <a
              className="text-link hover:text-accent"
              href={personal.linkedin.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {personal.linkedin.label}
            </a>
          </div>
          <div>
            <a
              className="text-link hover:text-accent"
              href={personal.github.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {personal.github.label}
            </a>
          </div>
        </div>
      </div>

      <p className="mt-[22px] max-w-[42rem] font-serif text-[clamp(1.15rem,3.6vw,1.5rem)] italic leading-[1.45] text-text">
        &ldquo;{personal.quote}&rdquo;
      </p>

      <p className="mt-[18px] max-w-[44rem] text-[clamp(1rem,2.4vw,1.0625rem)] leading-[1.7] text-text">
        {profileIntro}
      </p>

      <dl className="mt-[26px] grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] border border-[rgba(43,33,24,0.18)]">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`px-4 py-3.5 ${
              i < stats.length - 1 ? 'border-r border-[rgba(43,33,24,0.14)]' : ''
            }`}
          >
            <dt className="font-pixel text-[8px] uppercase tracking-[0.03em] text-text-dim">
              {stat.label}
            </dt>
            <dd className="m-0 mt-1 text-[1.5rem] font-bold text-heading">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 font-pixel text-[9px] leading-[1.7] tracking-[0.01em] text-text-dim">
        Use <span className="text-text">&larr; &rarr;</span> to walk between sections,{' '}
        <span className="text-text">Space</span> to jump &mdash; or click a flag below.
        <span
          aria-hidden="true"
          className="ml-1 inline-block h-[0.9em] w-[0.5em] translate-y-px bg-text-dim align-middle motion-safe:animate-caret"
        />
      </p>
    </section>
  )
}
