// Requirement: Recreate the handoff's Chrome-dino-style pixel runner that walks and
//   hops along the ground between section flags, with a coin score + distance HUD.
// Approach: A framework-agnostic engine class owning the <canvas> render loop, the
//   runner physics, the numeric HUD, and the audio blips. React owns navigation state
//   (which section is active, which are visited) and the declarative flag/coin DOM;
//   it drives the engine imperatively via goTo()/jump(). This split keeps per-frame
//   canvas work out of React's render path (no state churn at 60fps) while letting
//   React stay the source of truth for what's on screen.
// Alternatives considered:
//   - Port the whole thing into a React component with state per frame: Rejected —
//     re-rendering the tree every animation frame is wasteful and janky.
//   - A DOM/CSS-only runner (no canvas): Rejected — the pixel sprite + parallax ground
//     speckle are far cheaper and crisper drawn imperatively on a canvas.

export interface PixelRunnerOptions {
  /** Number of section flags (used for the fallback even-spread positions). */
  flagCount: number
  /** Score to start with (the profile "level" is counted on load). */
  initialScore: number
  /** Read live so toggling sound doesn't require re-creating the engine. */
  isSoundOn: () => boolean
  /** When true: teleport instead of walk, no jumps, no drifting clouds. */
  prefersReducedMotion: boolean
}

const HI_STORAGE_KEY = 'jt-cv-hi'
// Must match the flag <nav> bottom offset in CvGameStrip so the runner's feet sit
// on the same ground line the flag masts rise from.
const GROUND_BOTTOM = 30
const PIXEL = 4 // logical sprite pixel unit
const SPRITE_COLS = 10

type Sprite = string[]

interface Cloud {
  x: number
  y: number
  s: number
}
interface Hill {
  x: number
  w: number
  h: number
}

export class PixelRunnerEngine {
  private readonly root: HTMLElement
  private readonly opts: PixelRunnerOptions

  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null

  private anim: boolean

  private w = 0
  private h = 0
  private px = PIXEL
  private groundBottom = GROUND_BOTTOM

  private activeIdx = 0
  private charX = 0
  private targetX = 0
  private facing = 1
  private vy = 0
  private jy = 0
  private grounded = true
  private runPhase = 0
  private blink = 0
  private blinkTimer = 1.2

  private score: number
  private dispScore: number
  private hi = 0
  private dist = 0

  private clouds: Cloud[] = [
    { x: 0.15, y: 16, s: 1 },
    { x: 0.55, y: 26, s: 0.8 },
    { x: 0.85, y: 10, s: 1.1 },
  ]
  private hills: Hill[] = [
    { x: 0.2, w: 220, h: 44 },
    { x: 0.6, w: 300, h: 60 },
    { x: 0.95, w: 180, h: 36 },
  ]
  private sprites: Record<'idle' | 'run1' | 'run2' | 'jump', Sprite>

  private raf = 0
  private sizeRetry = 0
  private last = 0
  private actx: AudioContext | null = null
  private readonly onResize = () => this.sizeCanvas()

  constructor(root: HTMLElement, opts: PixelRunnerOptions) {
    this.root = root
    this.opts = opts
    this.anim = !opts.prefersReducedMotion
    this.score = opts.initialScore
    this.dispScore = opts.initialScore
    this.sprites = this.buildSprites()

    let stored = 0
    try {
      stored = parseInt(localStorage.getItem(HI_STORAGE_KEY) || '0', 10) || 0
    } catch {
      stored = 0
    }
    this.hi = Math.max(stored, this.score)
  }

  start(): void {
    this.canvas = this.root.querySelector<HTMLCanvasElement>('[data-game-canvas]')
    this.ctx = this.canvas?.getContext('2d') ?? null
    if (!this.canvas || !this.ctx) return

    window.addEventListener('resize', this.onResize)
    this.sizeCanvas()

    // Place the runner at the active flag immediately (no opening walk-in).
    this.targetX = this.flagX(this.activeIdx)
    this.charX = this.targetX

    this.last = performance.now()
    this.raf = requestAnimationFrame((t) => this.loop(t))
    this.syncHud()
  }

  destroy(): void {
    if (this.raf) cancelAnimationFrame(this.raf)
    if (this.sizeRetry) cancelAnimationFrame(this.sizeRetry)
    window.removeEventListener('resize', this.onResize)
    if (this.actx) {
      void this.actx.close().catch(() => {})
      this.actx = null
    }
  }

  /** Walk to a flag, hop, and (if award > 0) bank the coins with a bright blip. */
  goTo(idx: number, { award = 0 }: { award?: number } = {}): void {
    this.activeIdx = idx
    this.targetX = this.flagX(idx)
    if (!this.anim) this.charX = this.targetX

    if (award > 0) {
      this.score += award
      this.hi = Math.max(this.hi, this.score)
      try {
        localStorage.setItem(HI_STORAGE_KEY, String(this.hi))
      } catch {
        /* private mode / storage disabled — high score just won't persist */
      }
      this.blip(660)
    } else {
      this.blip(430)
    }
    this.jump(0.7)
  }

  jump(power = 1): void {
    if (!this.anim || !this.grounded) return
    this.vy = power * 260
    this.grounded = false
    this.blip(520)
  }

  /** Re-anchor the runner to a flag without scoring (used after resize/relayout). */
  reanchor(idx: number): void {
    this.activeIdx = idx
    this.targetX = this.flagX(idx)
    if (!this.anim) this.charX = this.targetX
  }

  setReducedMotion(reduced: boolean): void {
    this.anim = !reduced
    if (reduced) this.charX = this.targetX
  }

  // ---- audio ----------------------------------------------------------------
  blip(freq: number): void {
    if (!this.opts.isSoundOn()) return
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (!Ctor) return
      const a = this.actx || (this.actx = new Ctor())
      if (a.state === 'suspended') void a.resume()
      const o = a.createOscillator()
      const g = a.createGain()
      o.type = 'square'
      o.frequency.value = freq || 500
      o.connect(g)
      g.connect(a.destination)
      const t = a.currentTime
      g.gain.setValueAtTime(0.04, t)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1)
      o.start(t)
      o.stop(t + 0.11)
    } catch {
      /* Web Audio unavailable — silently skip */
    }
  }

  // ---- canvas sizing --------------------------------------------------------
  private sizeCanvas(): void {
    const strip = this.root.querySelector<HTMLElement>('[data-game-strip]')
    if (!strip || !this.canvas || !this.ctx) return
    const r = strip.getBoundingClientRect()
    if (r.width < 2 || r.height < 2) {
      // Strip not laid out yet (mobile mount / orientation / address-bar) — retry.
      if (this.sizeRetry) cancelAnimationFrame(this.sizeRetry)
      this.sizeRetry = requestAnimationFrame(() => this.sizeCanvas())
      return
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.w = r.width
    this.h = r.height
    this.canvas.width = Math.round(r.width * dpr)
    this.canvas.height = Math.round(r.height * dpr)
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.ctx.imageSmoothingEnabled = false
    // Re-anchor to the active flag after a relayout.
    this.targetX = this.flagX(this.activeIdx)
    if (!this.anim) this.charX = this.targetX
  }

  private flagX(idx: number): number {
    const strip = this.root.querySelector<HTMLElement>('[data-game-strip]')
    const mast = this.root.querySelector<HTMLElement>(`[data-flag-mast="${idx}"]`)
    if (strip && mast) {
      const sr = strip.getBoundingClientRect()
      const mr = mast.getBoundingClientRect()
      return mr.left + mr.width / 2 - sr.left
    }
    // Fallback: even spread across the strip.
    const n = Math.max(1, this.opts.flagCount - 1)
    return (this.w || 320) * (0.1 + 0.8 * (idx / n))
  }

  // ---- sprites --------------------------------------------------------------
  private buildSprites(): Record<'idle' | 'run1' | 'run2' | 'jump', Sprite> {
    // 10-wide bitmaps. K/@ = ink, A = amber, W = paper (eye). Feet on the last rows.
    const idle: Sprite = [
      '...KKK....', '...KKK....', '...KWK....', '...KKK....', '..KKKKK...',
      '..KKKKK@@.', '.KKKKKK@@.', '..KKKKK...', '..KKKKK...', '...K.K....',
      '...K.K....', '...K.K....', '..KK.KK...',
    ]
    const run1: Sprite = [
      '...KKK....', '...KKK....', '...KWK....', '...KKK....', '..KKKKK...',
      '..KKKKK@@.', '.KKKKKK@@.', '..KKKKK...', '..KKKKK...', '...KK.....',
      '..KK......', '.KK...KK..', '.K.....KK.',
    ]
    const run2: Sprite = [
      '...KKK....', '...KKK....', '...KWK....', '...KKK....', '..KKKKK...',
      '..KKKKK@@.', '.KKKKKK@@.', '..KKKKK...', '..KKKKK...', '.....KK...',
      '......KK..', '..KK...KK.', '.KK.....K.',
    ]
    const jump: Sprite = [
      '...KKK....', '...KKK....', '...KWK....', '...KKK....', 'K.KKKKK.A.',
      'K.KKKKK@@.', '.KKKKKK@@.', '..KKKKK...', '..KKKKK...', '..KK.KK...',
      '.KK...KK..', '.KK...KK..', '..........',
    ]
    return { idle, run1, run2, jump }
  }

  private drawSprite(
    frame: Sprite,
    cx: number,
    feetY: number,
    facing: number,
    blink: boolean,
  ): void {
    const ctx = this.ctx
    if (!ctx) return
    const px = this.px
    const cols = SPRITE_COLS
    const rows = frame.length
    const sw = cols * px
    const sh = rows * px
    const left = Math.round(cx - sw / 2)
    const top = Math.round(feetY - sh)
    ctx.save()
    if (facing < 0) {
      ctx.translate(left + sw, top)
      ctx.scale(-1, 1)
      ctx.translate(-left, -top)
    }
    for (let r = 0; r < rows; r++) {
      const line = frame[r]
      for (let c = 0; c < cols; c++) {
        const ch = line[c]
        if (!ch || ch === '.' || ch === ' ') continue
        if (ch === 'W') ctx.fillStyle = blink ? '#2B2118' : '#F7F1E1'
        else if (ch === 'A') ctx.fillStyle = '#E0972B'
        else ctx.fillStyle = '#2B2118'
        ctx.fillRect(left + c * px, top + r * px, px, px)
      }
    }
    ctx.restore()
  }

  // ---- main loop ------------------------------------------------------------
  private loop(t: number): void {
    const dt = Math.min(0.05, (t - this.last) / 1000)
    this.last = t
    const ctx = this.ctx
    if (!ctx) {
      this.raf = requestAnimationFrame((n) => this.loop(n))
      return
    }
    const w = this.w
    const h = this.h
    const groundY = h - this.groundBottom
    if (!(w > 1) || !(h > 1)) {
      this.sizeCanvas()
      this.raf = requestAnimationFrame((n) => this.loop(n))
      return
    }

    // ---- update ----
    const dx = this.targetX - this.charX
    const moving = Math.abs(dx) > 1.5
    if (moving && this.anim) {
      const dir = Math.sign(dx)
      this.facing = dir
      const speed = Math.min(Math.abs(dx), 320 * dt + Math.abs(dx) * 0.12)
      this.charX += dir * speed
      this.runPhase += dt * 12
      this.dist += speed * 0.6
    } else {
      this.charX = this.targetX
    }
    // jump physics
    if (!this.grounded) {
      this.jy += this.vy * dt
      this.vy -= 900 * dt
      if (this.jy <= 0) {
        this.jy = 0
        this.vy = 0
        this.grounded = true
      }
    }
    // blink
    this.blinkTimer -= dt
    if (this.blinkTimer <= 0) {
      this.blink = 0.14
      this.blinkTimer = 1.4 + Math.random() * 2.6
    }
    if (this.blink > 0) this.blink -= dt
    // idle bob
    const bob =
      !moving && this.grounded && this.anim ? Math.sin(t / 380) * 1.4 : 0
    // clouds drift
    if (this.anim) {
      this.clouds.forEach((c) => {
        c.x += dt * 0.012 * c.s
        if (c.x > 1.15) c.x = -0.15
      })
    }
    // score ease
    if (this.dispScore < this.score) {
      this.dispScore = Math.min(
        this.score,
        this.dispScore + Math.ceil((this.score - this.dispScore) * 0.14) + 1,
      )
    }

    // ---- render ----
    ctx.clearRect(0, 0, w, h)
    // parallax hills
    this.hills.forEach((hl) => {
      const hx = hl.x * w
      ctx.fillStyle = 'rgba(43,33,24,0.08)'
      ctx.beginPath()
      ctx.ellipse(hx, groundY + hl.h * 0.5, hl.w * 0.5, hl.h, 0, Math.PI, Math.PI * 2)
      ctx.fill()
    })
    // clouds (pixel puffs)
    this.clouds.forEach((c) => {
      const cxp = c.x * w
      const cyp = c.y
      ctx.fillStyle = 'rgba(43,33,24,0.14)'
      const u = 3
      ;[[0, 1], [1, 0], [1, 1], [2, 0], [2, 1], [3, 1], [1, 2], [2, 2]].forEach((p) =>
        ctx.fillRect(
          Math.round(cxp + p[0] * u * c.s),
          Math.round(cyp + p[1] * u * c.s),
          Math.ceil(u * c.s),
          Math.ceil(u * c.s),
        ),
      )
    })
    // ground line + speckle
    ctx.fillStyle = '#2B2118'
    ctx.fillRect(0, groundY, w, 2)
    ctx.fillStyle = 'rgba(43,33,24,0.5)'
    const seed = Math.floor((this.anim ? this.dist : 0) * 0.25)
    for (let i = 0; i < w; i += 14) {
      const s = ((i + seed) * 37) % 100
      if (s < 40) ctx.fillRect(i, groundY + 5, 2, 2)
      else if (s < 70) ctx.fillRect(i + 5, groundY + 8, 3, 2)
    }
    // player
    let frame = this.sprites.idle
    if (!this.grounded) frame = this.sprites.jump
    else if (moving)
      frame = Math.floor(this.runPhase) % 2 === 0 ? this.sprites.run1 : this.sprites.run2
    this.drawSprite(frame, this.charX, groundY - this.jy + bob, this.facing, this.blink > 0)

    this.syncHud()
    this.raf = requestAnimationFrame((n) => this.loop(n))
  }

  private syncHud(): void {
    const pad3 = (n: number) => String(Math.round(n)).padStart(3, '0')
    const sc = this.root.querySelector('[data-hud-score]')
    if (sc) sc.textContent = pad3(this.dispScore)
    const hi = this.root.querySelector('[data-hud-hi]')
    if (hi) hi.textContent = pad3(this.hi)
    const di = this.root.querySelector('[data-hud-dist]')
    if (di) di.textContent = String(Math.round(this.dist)).padStart(4, '0')
  }
}
