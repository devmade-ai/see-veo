interface TimelineItemProps {
  title: string
  subtitle: string
  period: string
  location?: string
  description?: string
  highlights?: string[]
}

export default function TimelineItem({
  title,
  subtitle,
  period,
  location,
  description,
  highlights,
}: TimelineItemProps) {
  return (
    <div className="relative border-l-2 border-border pb-8 pl-6 last:pb-0">
      <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-primary" />
      <div className="mb-1 flex flex-col justify-between sm:flex-row sm:items-center">
        <h3 className="text-lg font-semibold text-text">{title}</h3>
        <span className="text-sm text-text-muted">{period}</span>
      </div>
      <p className="mb-2 text-primary">{subtitle}</p>
      {location && (
        <p className="mb-2 text-sm text-text-muted">{location}</p>
      )}
      {description && <p className="mb-3 text-text-muted">{description}</p>}
      {highlights && highlights.length > 0 && (
        <ul className="list-disc space-y-1 pl-5 text-text-muted">
          {highlights.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
