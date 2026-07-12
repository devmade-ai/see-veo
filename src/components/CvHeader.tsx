// Top bar: the document identity (left) and the game HUD + controls (right). The
// three HUD number spans carry data-hud-* hooks that the engine writes into every
// frame (score is eased, distance ticks up as the runner walks). Faithful port of
// the handoff, including its responsive rules: the "Curriculum Vitae" sub-label and
// distance drop below 560px, the HI score drops below 400px.

interface CvHeaderProps {
  name: string
  soundOn: boolean
  onToggleSound: () => void
  onPrint: () => void
}

export default function CvHeader({ name, soundOn, onToggleSound, onPrint }: CvHeaderProps) {
  return (
    <header className="relative z-20 flex shrink-0 items-center justify-between gap-x-[14px] border-b border-[rgba(43,33,24,0.18)] px-[clamp(16px,4vw,34px)] pb-3 pt-[max(14px,env(safe-area-inset-top))] max-[560px]:flex-wrap max-[560px]:gap-x-2.5 max-[560px]:gap-y-1.5 max-[560px]:px-3.5">
      <div className="flex min-w-0 items-baseline gap-3">
        <span className="whitespace-nowrap font-serif text-[16px] font-bold tracking-[0.02em] text-heading">
          {name}
        </span>
        <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.24em] text-text-dim max-[560px]:hidden">
          Curriculum Vitae
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="flex items-center gap-[14px] border border-[rgba(43,33,24,0.18)] bg-surface px-3 py-1.5 font-pixel text-[10px] tracking-[0.03em] text-text-muted max-[560px]:gap-[9px] max-[560px]:px-[9px] max-[560px]:py-[5px]">
          <span className="inline-flex items-center gap-[5px] text-link">
            <span className="h-[9px] w-[9px] rounded-full bg-accent shadow-[1px_1px_0_rgba(43,33,24,0.5)]" />
            <span data-hud-score>000</span>
          </span>
          <span className="text-text-faint max-[400px]:hidden">
            HI <span data-hud-hi>000</span>
          </span>
          <span className="text-text-dim max-[560px]:hidden">
            <span data-hud-dist>0000</span>m
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleSound}
          aria-label="Toggle sound effects"
          aria-pressed={soundOn}
          className="min-h-[34px] cursor-pointer border border-[rgba(43,33,24,0.18)] bg-surface px-[11px] font-pixel text-[9px] tracking-[0.02em] text-text-muted transition-colors hover:border-primary hover:text-text"
        >
          {soundOn ? 'SFX ON' : 'SFX OFF'}
        </button>

        <button
          type="button"
          onClick={onPrint}
          aria-label="Download as PDF"
          className="min-h-[34px] cursor-pointer border border-primary bg-primary px-[13px] font-pixel text-[9px] tracking-[0.02em] text-primary-ink shadow-[2px_2px_0_rgba(43,33,24,0.35)] transition-transform active:translate-x-px active:translate-y-px"
        >
          PDF
        </button>
      </div>
    </header>
  )
}
