# Session Notes

**Worked on:** Fleet-standard PWA update policy — "auto-on-launch" (glow-props
`docs/implementations/PWA_SYSTEM.md` → "Update Application Policy") implemented in
`usePWAUpdate` + the update/check UI, on branch `claude/projects-missing-analytics-vla4ja`.

**Accomplished:**
- `usePWAUpdate` rewritten as a module-singleton policy hook: launch-apply a worker
  already waiting when registration first resolves (SKIP_WAITING postMessage + latch-gated
  `controllerchange` reload backstop), mid-session detections arm the banner only, hourly
  poll + new visibilitychange checks, `checkForUpdate()` with the canonical typed result
  (`'no-sw' | 'up-to-date' | 'update-available' | 'error'`, 1500ms settle).
- Persisted "Automatic updates" toggle — localStorage `jt-cv-auto-update` (default ON,
  try/catch-safe), 30s sessionStorage `jt-cv-pwa-updated` just-updated suppression (written
  by both launch-apply and the user-tap path).
- UI: toggle checkbox inside `UpdatePrompt` (no menu surface exists — the banner is the
  update system's one visible moment); "Check for updates" button + `role="status"` result
  line in `CvContact` beside the install affordance (the app-management corner).
- Tests: `pwa-hooks.test.ts` rewritten (launch-apply + pref/suppression gates, mid-session
  arm-only, toggle, all four check results); CvContact + UpdatePrompt component tests added.
- Docs: CLAUDE.md (Key Decisions bullet + PWA System section aligned to the policy),
  HISTORY.md entry.

**Current state:** type-check, lint, `npm run build`, and **116 tests** all pass. Generated
`dist/sw.js` verified to carry the `SKIP_WAITING` message handler the launch-apply
postMessage relies on. Committed on `claude/projects-missing-analytics-vla4ja` (not merged).

**Key context:**
- `registerType` stays `'prompt'` — it is the *mechanism*; the hook is the *policy*. Never
  revert to tap-only behavior (stale clients never converge) or raw `autoUpdate`
  (mid-session reloads).
- vite-plugin-pwa 1.x quirk: `updateServiceWorker(reloadPage)` **ignores** its argument —
  it only sends SKIP_WAITING; the reload comes from the library's `controlling` listener
  (installed when the `waiting` event fired). The hook's own `controllerchange` listener,
  gated on the launch-apply latch, is the order-independent backstop.
- `hasUpdate` is the module `_hasUpdate` flag, NOT the wrapper's `needRefresh` state — the
  wrapper sets its flag on every waiting event, which would bypass the launch-apply and
  just-updated suppression.
- Storage keys follow the `jt-cv-` prefix (`jt-cv-hi` precedent). Test reset:
  `_resetPwaUpdateStateForTesting()`.
