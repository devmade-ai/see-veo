// Requirement: The whole app is a playable, ink-on-paper CV — a pixel runner walks
//   between section "flags"; arrow keys / Space / clicking a flag navigate; a coin
//   score + distance HUD track progress; PDF export and a sound toggle live in the
//   header. This orchestrator owns navigation state and wires it to the canvas engine.
// Approach: React is the source of truth for which section is shown and which have
//   been visited (declarative render + flag/coin states); the PixelRunnerEngine owns
//   the per-frame canvas + HUD + audio and is driven imperatively via goTo()/jump().
//   Only the active section is mounted, keyed by screen so it replays the slide-in.
// Alternatives considered:
//   - One long scrolling page: Rejected — the design is a discrete-level game, not a scroll
//   - Engine owning navigation state too: Rejected — keeping state in React makes the
//     flags/coins/sections declarative and testable; the engine stays presentation-only

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { cvData, sections, type SectionId } from '../data/cv-data'
import { PixelRunnerEngine } from '../game/pixelRunnerEngine'
import CvHeader from './CvHeader'
import CvGameStrip from './CvGameStrip'
import CvProfile from './CvProfile'
import CvExperience from './CvExperience'
import CvSkills from './CvSkills'
import CvProjects from './CvProjects'
import CvEducation from './CvEducation'
import CvContact from './CvContact'
import CvPrintDoc from './CvPrintDoc'
import type { UpdateCheckResult } from '../hooks/usePWAUpdate'

const order: SectionId[] = sections.map((s) => s.id)

// Coin "pop" lifetime — slightly longer than the 0.6s coin-pop animation so it fully
// plays before the coin unmounts.
const COIN_POP_MS = 640

// Requirement: The game's keys must never take keystrokes away from the page's own
//   controls. A visitor's contact-form message arrived with every space missing: the
//   window-level listener below claimed Space for the runner's jump and called
//   preventDefault(), which cancels the browser's insertion of the character. The arrow
//   keys had the same shape — they moved the runner instead of the caret, and navigating
//   away unmounts the Contact level along with anything typed into the form.
// Approach: The listener ignores events dispatched from a form field, and leaves Space
//   alone when the focused element is one a browser activates with Space.
// Alternatives considered:
//   - onKeyDown={e => e.stopPropagation()} on each field: Rejected — every input added
//     later has to remember to opt out; the guard belongs with the handler taking the keys
//   - Reading document.activeElement: Rejected — e.target is the element the event was
//     actually dispatched to, and stays correct if focus moves during dispatch
//   - Dropping Space as a control: Rejected — jump is a documented game control

/** True for anything the visitor types or edits into — the keys belong to it, not the game. */
function isFormFieldTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable) return true
  return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT'
}

/**
 * True when Space would activate the focused control. Swallowing it there leaves keyboard
 * users unable to press buttons they can see — including "Send a message".
 */
function isSpaceActivatedTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.closest('button, summary, [role="button"]') !== null
}

interface LivingCvProps {
  canInstall: boolean
  isInstalled: boolean
  onInstall: () => void
  showManualInstructions: boolean
  onShowInstructions: () => void
  onCheckForUpdates: () => Promise<UpdateCheckResult>
}

export default function LivingCv({
  canInstall,
  isInstalled,
  onInstall,
  showManualInstructions,
  onShowInstructions,
  onCheckForUpdates,
}: LivingCvProps) {
  const [screen, setScreen] = useState<SectionId>('profile')
  const [soundOn, setSoundOn] = useState(true)
  const [visited, setVisited] = useState<Set<SectionId>>(() => new Set<SectionId>(['profile']))
  const [poppingIndex, setPoppingIndex] = useState<number | null>(null)

  const rootRef = useRef<HTMLDivElement>(null)
  const engineRef = useRef<PixelRunnerEngine | null>(null)
  const popTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Live mirrors so the stable keydown listener + engine callbacks read current values
  // without being torn down and rebuilt on every state change. Synced after each commit
  // (event handlers/effects run after commit, so they always see up-to-date values).
  const screenRef = useRef(screen)
  const visitedRef = useRef(visited)
  const soundOnRef = useRef(soundOn)
  useEffect(() => {
    screenRef.current = screen
    visitedRef.current = visited
    soundOnRef.current = soundOn
  })

  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false,
    [],
  )

  const activeIndex = order.indexOf(screen)

  const navigate = useCallback(
    (index: number) => {
      const target = sections[index]
      if (!target || target.id === screenRef.current) return

      const alreadyVisited = visitedRef.current.has(target.id)
      setScreen(target.id)
      if (!alreadyVisited) {
        setVisited((prev) => {
          const next = new Set(prev)
          next.add(target.id)
          return next
        })
      }

      // Drive the runner: walk to the flag, hop, bank coins on a first visit.
      engineRef.current?.goTo(index, { award: alreadyVisited ? 0 : target.coinValue })

      // First-visit coin "pop" (skipped under reduced motion — the coin just clears).
      if (!alreadyVisited && !prefersReducedMotion) {
        setPoppingIndex(index)
        if (popTimerRef.current) clearTimeout(popTimerRef.current)
        popTimerRef.current = setTimeout(() => setPoppingIndex(null), COIN_POP_MS)
      }

      // Reset the document scroll for the new section.
      const stage = rootRef.current?.querySelector('[data-doc-stage]')
      if (stage) stage.scrollTop = 0
    },
    [prefersReducedMotion],
  )

  // Create + start the canvas engine once the shell is mounted.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const engine = new PixelRunnerEngine(root, {
      flagCount: sections.length,
      initialScore: sections[0].coinValue, // profile is counted on load
      isSoundOn: () => soundOnRef.current,
      prefersReducedMotion,
    })
    engineRef.current = engine
    engine.start()
    return () => {
      engine.destroy()
      engineRef.current = null
    }
  }, [prefersReducedMotion])

  // Keyboard controls: ← / → walk between sections, Space jumps.
  // Guarded so typing in the contact form (or using a focused control) always wins —
  // see isFormFieldTarget / isSpaceActivatedTarget above for why.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Already handled elsewhere, or a browser/OS shortcut (Alt+← is "back", ⌘←
      // is start-of-line) — either way the game has no claim on it.
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return
      if (isFormFieldTarget(e.target)) return

      const idx = order.indexOf(screenRef.current)
      if (e.key === 'ArrowRight') {
        navigate(Math.min(idx + 1, order.length - 1))
        e.preventDefault()
      } else if (e.key === 'ArrowLeft') {
        navigate(Math.max(idx - 1, 0))
        e.preventDefault()
      } else if (e.key === ' ' || e.code === 'Space') {
        if (isSpaceActivatedTarget(e.target)) return
        engineRef.current?.jump()
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate])

  // Clean up the pending coin-pop timer on unmount.
  useEffect(
    () => () => {
      if (popTimerRef.current) clearTimeout(popTimerRef.current)
    },
    [],
  )

  const toggleSound = useCallback(() => {
    const next = !soundOnRef.current
    soundOnRef.current = next // update before blip so the confirmation respects the new value
    setSoundOn(next)
    engineRef.current?.blip(560)
  }, [])

  const handlePrint = useCallback(() => window.print(), [])

  const isVisited = useCallback((id: SectionId) => visited.has(id), [visited])

  return (
    <>
      <div
        ref={rootRef}
        data-cv-root
        className="relative flex h-svh min-h-svh flex-col overflow-hidden bg-background font-serif text-text print:hidden"
      >
        {/* CRT scanline / paper texture overlay */}
        <div className="pointer-events-none absolute inset-0 z-40 opacity-60 [background:repeating-linear-gradient(0deg,rgba(43,33,24,0.045)_0_1px,transparent_1px_3px)] [mix-blend-mode:multiply]" />

        <CvHeader
          name={cvData.personal.name}
          soundOn={soundOn}
          onToggleSound={toggleSound}
          onPrint={handlePrint}
        />

        <main
          data-doc-stage
          className="relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-[clamp(16px,5vw,40px)] pb-[clamp(24px,4vw,40px)] pt-[clamp(20px,4vw,44px)]"
        >
          <div key={screen} className="mx-auto max-w-[56rem] motion-safe:animate-doc-in">
            {screen === 'profile' && <CvProfile />}
            {screen === 'experience' && <CvExperience />}
            {screen === 'skills' && <CvSkills />}
            {screen === 'projects' && <CvProjects />}
            {screen === 'education' && <CvEducation />}
            {screen === 'contact' && (
              <CvContact
                canInstall={canInstall}
                isInstalled={isInstalled}
                onInstall={onInstall}
                showManualInstructions={showManualInstructions}
                onShowInstructions={onShowInstructions}
                onCheckForUpdates={onCheckForUpdates}
              />
            )}
          </div>
        </main>

        <CvGameStrip
          sections={sections}
          activeIndex={activeIndex}
          isVisited={isVisited}
          poppingIndex={poppingIndex}
          onNavigate={navigate}
        />
      </div>

      {/* Clean printed document — hidden on screen, shown by the print stylesheet. */}
      <CvPrintDoc />
    </>
  )
}
