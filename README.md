# see-veo

A personal CV/resume built as a Progressive Web App (PWA) with React, TypeScript, Vite, and Tailwind CSS.

## Features

- Dark theme with responsive design
- PWA support (installable, works offline)
- Print-friendly styles
- Single data file for easy content updates
- Automated GitHub Pages deployment

## Development

```bash
npm install
npm run dev
```

## Build & Preview

```bash
npm run build
npm run preview
```

## Customizing

Edit `src/data/cv-data.ts` to update all CV content (personal info, experience, education, skills, projects, contact).

## Deployment

Pushes to `main` automatically deploy to GitHub Pages via GitHub Actions.

**Setup:** In your GitHub repo Settings > Pages, set the Source to "GitHub Actions".

## Tech Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)

## License

GPL-3.0
