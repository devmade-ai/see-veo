# see-veo

A personal CV/resume built as a Progressive Web App (PWA) with React, TypeScript, Vite, and Tailwind CSS.

## Features

### CV Sections
- **Hero** — Name, title, tagline, and action buttons (install app, download PDF, manual install instructions)
- **About** — Multi-paragraph personal summary
- **Skills** — Grouped skill badges across 4 categories (Core, Development, Data & Integration, Languages)
- **Projects** — Grid of 9 deployed project cards with screenshots, descriptions, tech stacks, and links
- **Activity Charts** — Embedded repo-tor iframe charts showing commit distribution (most active days, peak working hours)
- **Activity Timeline** — Embedded repo-tor iframe showing 60-day commit activity by repository
- **Experience** — Timeline of work history with highlights
- **Education** — Timeline of credentials and certifications
- **Interest Form** — Contact form (name, email, message) with validation, retry logic, failure diagnosis, and honeypot spam protection

### PWA
- Installable as a native app on Chromium browsers via `beforeinstallprompt`
- Platform-specific manual install instructions for Safari (iOS/macOS), Firefox, Samsung Internet
- Service worker with Workbox runtime caching for offline support
- Periodic update checks (60-minute interval) with user-controlled refresh prompt

### Accessibility
- Skip-to-content link for keyboard navigation
- Focus trap and Escape-to-close in modal dialogs
- ARIA labels and roles throughout
- Semantic HTML (nav, section, header, footer)

### Print / PDF
- Download as PDF via `window.print()` — no library needed
- `.no-print` class hides interactive UI when printing
- Print-specific styles (white background, page-break control)

### Developer Tools
- **Debug Banner** — Floating diagnostic pill with two tabs:
  - *Diagnostics* — HTTPS, network, API, CORS, service worker, standalone mode, browser detection checks
  - *Event Log* — Real-time severity-coded logs from InterestForm and PWA hooks
- Copy-to-clipboard for full diagnostic + event log report
- Debug logging via pub/sub event store (`debugLog` utility)

## Project Structure

```
src/
├── App.tsx                  # Single-page layout, composes all sections
├── index.css                # Tailwind import, @theme tokens, print styles
├── components/
│   ├── Hero.tsx             # Header with action buttons
│   ├── About.tsx            # Personal summary
│   ├── Experience.tsx       # Work timeline
│   ├── Education.tsx        # Credentials timeline
│   ├── Skills.tsx           # Skill categories + badges
│   ├── Projects.tsx         # Project card grid
│   ├── ActivityCharts.tsx   # repo-tor embed: daily/hourly charts
│   ├── ActivityTimeline.tsx # repo-tor embed: 60-day timeline
│   ├── InterestForm.tsx     # Contact form with error handling
│   ├── UpdatePrompt.tsx     # PWA update banner
│   ├── InstallInstructionsModal.tsx # Platform-specific install steps
│   ├── DebugBanner.tsx      # Floating debug/diagnostics panel
│   ├── Section.tsx          # Reusable section wrapper
│   ├── TimelineItem.tsx     # Reusable timeline entry
│   ├── SkillBadge.tsx       # Skill pill component
│   └── ProjectImage.tsx     # Project thumbnail with fallback
├── hooks/
│   ├── usePWAInstall.ts     # Install prompt capture + browser detection
│   ├── usePWAUpdate.ts      # Service worker update detection
│   └── useRepoTorEmbed.ts   # Dynamic embed.js script loading
├── utils/
│   ├── debugLog.ts          # Pub/sub event store for debug logging
│   ├── pwa.ts               # Browser detection, standalone check
│   └── validation.ts        # Email pattern, form payload validation
├── constants/
│   └── embed.ts             # repo-tor embed config (URLs, colors)
├── data/
│   └── cv-data.ts           # All CV content + TypeScript interfaces
└── test/
    ├── setup.ts             # Vitest + Testing Library config
    ├── cv-data.test.ts      # CV data structure validation
    ├── detect-browser.test.ts # Browser detection edge cases
    └── validate-payload.test.ts # Form validation coverage
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
| `npm run build` | TypeScript check + production build |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview production build locally |
| `npm run test` | Run Vitest test suite |
| `npm run test:watch` | Run Vitest in watch mode |

## Customizing

Edit `src/data/cv-data.ts` to update all CV content (personal info, experience, education, skills, projects, contact).

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_INTEREST_API_URL` | External API endpoint for the interest/contact form |

See `.env.example` for reference.

## Deployment

Pushes to `main` automatically deploy to Vercel. Connect the repo in the Vercel dashboard and add required env vars under **Settings > Environment Variables**.

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite 7](https://vite.dev/) with `@vitejs/plugin-react`
- [Tailwind CSS v4](https://tailwindcss.com/) via `@tailwindcss/vite` (CSS-first config)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Workbox service worker)
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) for tests
- [Vercel](https://vercel.com/) for deployment

## License

GPL-3.0
