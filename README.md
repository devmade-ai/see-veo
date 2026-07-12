# see-veo

**Jaco Theron's Living CV** — a personal résumé reimagined as a playable, ink-on-paper
document. A little Chrome-dino-style pixel runner walks and hops along the ground between
section "flags"; a coin score + distance HUD tracks how much of the CV you've explored.
Built as an installable Progressive Web App with React, TypeScript, Vite, and Tailwind CSS.

## The experience

- **One screen, six levels** — Profile, Work, Skills, Projects, Study, Contact. Each is a
  flag on the ground; reaching a new one for the first time banks its coins.
- **Navigate any way you like** — walk with `←` / `→`, `Space` to jump, or click a flag.
- **Formal document, game soul** — Spectral serif body, Space Mono meta, Silkscreen pixel
  HUD/flags, on warm paper with a single amber accent and a subtle CRT/paper texture.
- **Score HUD** — coin score, persisted high score (`localStorage`), and walk distance.
- **Sound** — tiny Web Audio blips on navigation/jump, toggleable (SFX ON/OFF).
- **Motion- and print-safe** — respects `prefers-reduced-motion`; a clean printed CV
  replaces the game shell when you export to PDF.

## Features

### Kept from the previous app, restyled to the paper theme
- **Contact form** — name / email / message, POSTs to a personal serverless SMTP relay
  (`VITE_INTEREST_API_URL`) with validation, timeout + single retry, failure diagnosis,
  and honeypot + timing spam protection. Degrades gracefully when the API is unset/offline.
- **PWA install** — installable on Chromium via `beforeinstallprompt`; an "Install app"
  button (or platform-specific "How to install" steps for Safari/Firefox/Samsung) lives in
  the Contact level.
- **PWA update** — service worker with 60-minute update checks and a user-controlled
  refresh toast.
- **Download as PDF** — `window.print()` swaps the game shell for a clean printed document.

### Removed in this redesign
- The embedded repo-tor activity charts and the on-screen debug banner are not part of the
  new design. (`debugLog` remains as latent diagnosis infra behind the contact form.)

## Project structure

```
src/
├── App.tsx                    # Composes LivingCv + PWA update/install chrome
├── index.css                  # @theme paper/ink/amber tokens, keyframes, base, print
├── fonts.css                  # Self-hosted @font-face (Spectral / Space Mono / Silkscreen)
├── fonts/                     # woff2 binaries (latin + latin-ext)
├── data/
│   └── cv-data.ts             # All CV content + game section config (flags, coin values)
├── game/
│   └── pixelRunnerEngine.ts   # Framework-agnostic canvas engine: runner, HUD, audio
├── components/
│   ├── LivingCv.tsx           # Orchestrator: nav state, engine wiring, keyboard
│   ├── CvHeader.tsx           # Document title + score/hi/distance HUD + SFX/PDF
│   ├── CvGameStrip.tsx        # Canvas + clickable section flags (active/visited/coin)
│   ├── CvProfile / CvExperience / CvSkills / CvProjects / CvEducation / CvContact.tsx
│   ├── CvSectionHeading.tsx   # Shared serif title + pixel eyebrow
│   ├── CvPrintDoc.tsx         # Print-only clean CV
│   ├── InterestForm.tsx       # Contact form (SMTP relay)
│   ├── InstallInstructionsModal.tsx
│   └── UpdatePrompt.tsx
├── hooks/
│   ├── usePWAInstall.ts       # Install prompt capture + browser detection
│   └── usePWAUpdate.ts        # Service worker update detection
├── utils/
│   ├── debugLog.ts            # Pub/sub event store (latent diagnosis infra)
│   ├── diagnostics.ts         # Contact-form failure diagnosis (diagnoseFailure)
│   ├── fetchWithTimeout.ts    # fetch + abort-on-timeout
│   ├── pwa.ts                 # Browser detection, standalone check
│   └── validation.ts          # Email pattern, form payload validation
└── test/                      # Vitest + Testing Library
public/icons/                  # Favicon set + PWA icons (ink runner + amber flag motif)
```

## Development

```bash
npm install
npm run dev
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run type-check` | TypeScript check only |
| `npm run build` | TypeScript check + production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run Vitest test suite |
| `npm run test:watch` | Run Vitest in watch mode |

## Customizing

Edit `src/data/cv-data.ts` to update all CV content and the game's section metadata
(flag labels + coin values). Theme colors and fonts live in `src/index.css` / `src/fonts.css`.

## Environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_INTEREST_API_URL` | External API endpoint for the contact form |

See `.env.example` for reference.

## Deployment

Pushes to `main` automatically deploy to Vercel. Theme color (browser UI = ink) and the PWA
manifest colors are parsed from `src/index.css` at build time, so CSS stays the single
source of truth.

## Tech stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 7](https://vite.dev/) with `@vitejs/plugin-react`
- [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite` (CSS-first config)
- Self-hosted fonts: Spectral, Space Mono, Silkscreen
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox service worker)
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/)
- [Vercel](https://vercel.com/) for deployment

## License

GPL-3.0
