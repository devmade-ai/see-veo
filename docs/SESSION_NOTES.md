# Session Notes

**Worked on:** Documentation fixes + dark minimal theme redesign with per-project accent colors

**Accomplished:**
- Fixed documentation: expanded README, created missing docs (SESSION_NOTES, TODO, HISTORY, USER_ACTIONS, AI_MISTAKES), consolidated ai-fuckups.md
- Redesigned theme: stripped saturated colors (sky blue, indigo, emerald) → near-monochrome neutral grays
- Added per-project accent colors: each project card has a brand color used for left border, initials placeholder, tech badges, and "View Project" link
- Updated CLAUDE.md to reflect new theme approach

**Current state:** All changes build and pass tests. Theme is dark minimal with neutral grays. Project cards are the only colored elements on the page — each has a distinct accent color.

**Key context:**
- `accent` field added to `ProjectItem` interface (optional, falls back to #737373)
- Theme colors in `src/index.css` are now all neutral grays — no saturated colors
- Inline `style` is used intentionally on project cards for data-driven accent colors (Tailwind can't resolve dynamic per-item hex values)
- 9 projects have accent colors: violet, teal, amber, emerald, rose, blue, lime, orange, sky
