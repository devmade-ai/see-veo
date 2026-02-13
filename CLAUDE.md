# see-veo

React + TypeScript + Vite PWA that displays a personal CV/resume.

## Tech Stack

- React 19 with TypeScript
- Vite 7 with `@vitejs/plugin-react`
- Tailwind CSS v4 via `@tailwindcss/vite` (no tailwind.config — all config is CSS-first in `src/index.css` using `@theme`)
- PWA via `vite-plugin-pwa` (Workbox service worker, web manifest)
- GitHub Pages deployment via GitHub Actions (`.github/workflows/deploy.yml`)

## Project Structure

- `src/data/cv-data.ts` — All CV content and TypeScript interfaces. Edit this single file to update the resume.
- `src/components/` — One component per CV section (Hero, About, Experience, Education, Skills, Projects, Contact) plus reusable helpers (Section, TimelineItem, SkillBadge).
- `src/index.css` — Tailwind import, custom `@theme` color tokens (dark palette), and print styles.
- `src/App.tsx` — Composes all sections into a single-page layout. No routing.
- `vite.config.ts` — Vite config with `base: '/see-veo/'` for GitHub Pages, Tailwind plugin, and PWA plugin.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — TypeScript check + production build (`tsc -b && vite build`)
- `npm run preview` — Preview production build locally

## Key Decisions

- Dark theme only (no light/dark toggle). Colors defined via Tailwind v4 `@theme` tokens.
- Single-page app with no client-side routing.
- PWA `base`, `scope`, and `start_url` all use `/see-veo/` for GitHub Pages compatibility.
- Print styles in `src/index.css` override to white background. Elements with class `no-print` are hidden when printing.
