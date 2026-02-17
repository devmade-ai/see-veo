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
- `src/components/` — One component per CV section (Hero, About, Experience, Education, Skills, Projects, Contact) plus reusable helpers (Section, TimelineItem, SkillBadge) and `InterestForm` for the contact form.
- `src/index.css` — Tailwind import, custom `@theme` color tokens (dark palette), and print styles.
- `src/App.tsx` — Composes all sections into a single-page layout. No routing.
- `vite.config.ts` — Vite config with `base: '/see-veo/'` for GitHub Pages, Tailwind plugin, and PWA plugin.
- `vitest.config.ts` — Vitest config with jsdom environment and React plugin.
- `src/test/` — Test files (Vitest + Testing Library).
- Interest notification API is a separate project deployed independently to Vercel. Frontend POSTs to it via `VITE_INTEREST_API_URL`.

## Commands

- `npm run dev` — Start dev server
- `npm run build` — TypeScript check + production build (`tsc -b && vite build`)
- `npm run preview` — Preview production build locally
- `npm run test` — Run Vitest test suite
- `npm run test:watch` — Run Vitest in watch mode

## Key Decisions

- Dark theme only (no light/dark toggle). Colors defined via Tailwind v4 `@theme` tokens.
- Single-page app with no client-side routing.
- PWA `base`, `scope`, and `start_url` all use `/see-veo/` for GitHub Pages compatibility.
- Print styles in `src/index.css` override to white background. Elements with class `no-print` are hidden when printing.
- Interest notification form in Contact section — POSTs to an external API endpoint configured via `VITE_INTEREST_API_URL` env variable. Hidden when printing. Degrades gracefully when API is not configured.

---

## Hard Rules

These rules are non-negotiable. Stop and ask before proceeding if any rule would be violated.

### Before Making Changes

- Read relevant existing code and documentation first
- Ask clarifying questions if scope, approach, or intent is unclear
- Confirm understanding before implementing non-trivial changes
- Never assume — when in doubt, ask

### Best Practices

- Follow established patterns and conventions already in the codebase
- Use industry-standard solutions over custom implementations when available
- Prefer well-maintained, widely-adopted libraries over obscure alternatives
- Apply SOLID principles, DRY, and separation of concerns
- Follow security best practices (input validation, sanitization, principle of least privilege)
- Handle errors gracefully with meaningful messages
- Write self-documenting code with clear naming

### Code Organization

- Prefer smaller, focused files and functions
- Pause and consider extraction at: 500 lines (file), 100 lines (function), 400 lines (class)
- Strongly consider refactoring at: 800+ lines (file), 150+ lines (function), 600+ lines (class)
- Extract reusable logic into separate modules/files immediately
- Group related functionality into logical directories
- Split large classes into smaller, focused classes when responsibilities diverge

### Styling

- Use Tailwind CSS utility classes in JSX — this is the project's standard approach
- Custom theme tokens, base styles, and print overrides go in `src/index.css` via `@theme`
- Do not create separate component stylesheet files
- Do not write inline `style={}` attributes; use Tailwind classes instead

### Decision Documentation

Every non-trivial code change must include comments explaining:
- **What** the requirement or instruction was
- **Why** this approach was chosen
- **What alternatives** were considered and why they were rejected

Trivial changes (content updates in `cv-data.ts`, minor styling tweaks) do not need this.

Example:
```typescript
// Requirement: Rate limit API calls to external service
// Approach: Token bucket algorithm with Redis backend
// Alternatives considered:
//   - Simple sleep/delay: Rejected - doesn't handle concurrent requests
//   - Fixed window counter: Rejected - allows burst at window boundaries
//   - Leaky bucket: Similar but token bucket gives more control over burst allowance
```

### User Experience

Assume all end users are non-technical. This is non-negotiable.

- UI must be intuitive without instructions
- Use plain language — no jargon, technical terms, or developer-speak
- Error messages must tell users what went wrong AND what to do next, in simple terms
- Labels, buttons, and instructions should be clear to someone unfamiliar with the domain
- Prioritize clarity over brevity in user-facing text
- Provide feedback for all user actions (loading states, success confirmations, etc.)
- Design for the least technical person who will use this

> **Project note:** The site includes an interest/contact form in the Contact section. All UX rules above apply to this and any future interactive features.

### Cleanup

- Remove all temporary files after implementation is complete
- Delete unused imports, variables, and dead code immediately
- Remove commented-out code unless explicitly marked for preservation
- Clean up `console.log` statements before marking work complete

### Quality Checks

During every change, actively scan for:
- Error handling gaps
- Edge cases not covered
- Inconsistent naming
- Code duplication that should be extracted
- Missing validation
- Security concerns
- Performance issues

Report findings even if not directly related to current task.

### Documentation

- Update relevant documentation with every code change
- All documentation lives in `/docs` directory
- Plans, notes, and scratch files go in `/docs/working`
- Never write docs or plans to root directory or random locations
- This CLAUDE.md must reflect current project state at all times

### Testing

- Write tests for critical paths and core business logic
- Test error handling and edge cases for critical functions
- Tests are not required for trivial getters/setters or UI-only code
- Run existing tests before and after changes

> **Project note:** Vitest is configured with jsdom environment. Tests live in `src/test/`. Run with `npm run test`.

### Commit Message Format

All commits must include metadata footers:

```
type(scope): subject

Body explaining why.

Tags: tag1, tag2, tag3
Complexity: 1-5
Urgency: 1-5
Impact: internal|user-facing|infrastructure|api
Risk: low|medium|high
Debt: added|paid|neutral
Epic: feature-name
Semver: patch|minor|major
```

**Tags:** Use from the project's tag list (see docs/EXTRACTION_PLAYBOOK.md)
**Complexity:** 1=trivial, 2=small, 3=medium, 4=large, 5=major rewrite
**Urgency:** 1=planned, 2=normal, 3=elevated, 4=urgent, 5=critical
**Impact:** internal, user-facing, infrastructure, or api
**Risk:** low=safe change, medium=could break things, high=touches critical paths
**Debt:** added=introduced shortcuts, paid=cleaned up debt, neutral=neither
**Epic:** groups related commits under one feature/initiative name
**Semver:** patch=bugfix, minor=new feature, major=breaking change

These footers are required on every commit. No exceptions.

---

## Communication Style

- Direct, concise responses
- No filler phrases or conversational padding
- State facts and actions, not opinions
- Ask specific questions with concrete options when clarification needed
- Never proceed with assumptions on ambiguous requests

---

## Project-Specific Configuration

### Paths
```
DOCS_PATH=/docs
WORKING_DOCS_PATH=/docs/working
COMPONENTS_PATH=src/components/
STYLES_PATH=src/index.css
TESTS_PATH=src/test/
```

### Stack
```
LANGUAGE=TypeScript
FRAMEWORK=React 19
TEST_RUNNER=vitest
PACKAGE_MANAGER=npm
```

### Conventions
```
NAMING_CONVENTION=camelCase
FILE_NAMING=PascalCase (components), kebab-case (config)
COMPONENT_STRUCTURE=flat (src/components/)
```

---

## Workflow

1. **Receive task** — Ask clarifying questions if needed
2. **Plan** — Write plan to `/docs/working` if task is non-trivial
3. **Implement** — Follow all hard rules above
4. **Verify** — Run `npm run build` to confirm TypeScript and build pass; run tests if configured
5. **Document** — Update all affected documentation (this file, `/docs`, etc.)
6. **Report** — Summarize changes and any issues found

---

## Prohibitions

Never:
- Start implementation without understanding full scope
- Create files outside established project structure
- Leave TODO comments without tracking them
- Ignore errors or warnings in output
- Make "while I'm here" changes without asking
- Use placeholder data that looks like real data
- Skip error handling "for now"
- Write code without decision context comments
