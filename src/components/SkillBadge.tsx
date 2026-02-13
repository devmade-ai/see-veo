interface SkillBadgeProps {
  name: string
}

export default function SkillBadge({ name }: SkillBadgeProps) {
  return (
    <span className="inline-block rounded-full bg-surface-light px-3 py-1 text-sm text-text-muted transition-colors hover:bg-primary hover:text-background">
      {name}
    </span>
  )
}
