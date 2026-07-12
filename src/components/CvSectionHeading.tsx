// Shared "document header" for each level: a serif section title with a small
// pixel-font eyebrow (the game-layer tag: Campaign Log, Inventory, Side Quests …),
// underlined by the same 2px ink rule used across the CV. Faithful port of the
// repeated header block in the handoff's CvPage design.

interface CvSectionHeadingProps {
  title: string
  eyebrow: string
  id?: string
}

export default function CvSectionHeading({ title, eyebrow, id }: CvSectionHeadingProps) {
  return (
    <div className="mb-[22px] flex flex-wrap items-baseline gap-x-[14px] gap-y-2 border-b-2 border-primary pb-2.5">
      <h2
        id={id}
        className="m-0 font-serif text-[clamp(1.6rem,5vw,2rem)] font-bold text-heading [text-wrap:pretty]"
      >
        {title}
      </h2>
      <span className="font-pixel text-[8.5px] uppercase tracking-[0.05em] text-text-dim">
        {eyebrow}
      </span>
    </div>
  )
}
