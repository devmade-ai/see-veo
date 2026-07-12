// The game strip: a paper "sky" band with the pixel runner drawn on a <canvas>,
// and a row of clickable section flags standing on the ground line. React owns the
// flag/coin DOM and their active/visited/pop states (declarative); the engine only
// reads each flag mast's position to know where to walk the runner.
//
// Faithful port of the handoff's game strip. The DC prototype mutated flag styles
// imperatively from the render loop; here the active flag (taller mast, amber waving
// cloth, emphasised label) and coin visibility are plain conditional classes, and the
// first-visit coin "pop" is a motion-safe animation the orchestrator toggles.

import type { SectionId, SectionMeta } from '../data/cv-data'

interface CvGameStripProps {
  sections: SectionMeta[]
  activeIndex: number
  isVisited: (id: SectionId) => boolean
  /** Index whose coin is mid-"pop" (just collected); null when none. */
  poppingIndex: number | null
  onNavigate: (index: number) => void
}

export default function CvGameStrip({
  sections,
  activeIndex,
  isVisited,
  poppingIndex,
  onNavigate,
}: CvGameStripProps) {
  return (
    <div
      data-game-strip
      className="relative z-[15] h-[122px] shrink-0 overflow-hidden border-t-2 border-primary bg-[linear-gradient(180deg,#F7F1E1,#EFE6CF)]"
    >
      <canvas
        data-game-canvas
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[3] block h-full w-full [image-rendering:pixelated]"
      />

      <nav
        aria-label="CV sections"
        className="pointer-events-none absolute inset-x-0 bottom-[30px] z-[2] flex items-end justify-between px-[clamp(4px,2.5vw,48px)]"
      >
        {sections.map((section, index) => {
          const active = index === activeIndex
          const showCoin = !isVisited(section.id) || poppingIndex === index
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onNavigate(index)}
              aria-label={section.flagLabel}
              aria-current={active ? 'true' : undefined}
              className="pointer-events-auto relative flex min-w-0 flex-1 cursor-pointer flex-col items-center border-0 bg-transparent px-1"
            >
              {showCoin && (
                <span
                  aria-hidden="true"
                  className={`absolute -top-9 left-1/2 -ml-1.5 h-3 w-3 rounded-full border-[1.5px] border-primary bg-accent shadow-[1px_1px_0_rgba(43,33,24,0.4)] ${
                    poppingIndex === index ? 'motion-safe:animate-coin-pop' : ''
                  }`}
                />
              )}
              <span
                data-flag-mast={index}
                className={`w-0.5 bg-primary ${active ? 'h-[52px]' : 'h-[40px]'}`}
              />
              <span
                aria-hidden="true"
                className={`absolute left-[calc(50%+1px)] top-0 h-[11px] w-[15px] [clip-path:polygon(0_0,100%_0,100%_100%,0_100%,35%_50%)] ${
                  active
                    ? 'bg-accent motion-safe:animate-flag-wave'
                    : 'bg-[rgba(43,33,24,0.3)]'
                }`}
              />
              <span
                className={`absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-pixel text-[8px] font-bold uppercase tracking-[0.01em] ${
                  active ? 'top-[56px] text-heading' : 'top-[44px] text-text-dim'
                }`}
              >
                {section.flagLabel}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
