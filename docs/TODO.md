# TODO

Pending improvements and ideas. Completed items move to HISTORY.md.

## Technical
- [ ] `debugLog` is now headless (the on-screen DebugBanner was removed). Decide: add a small
      debug view / console helper for the contact form's mobile diagnostics, or remove the
      logging calls + `debugLog`/`formatDebugReport` entirely.
- [ ] Consider `<link rel="preload">` for the primary Spectral + Space Mono latin woff2 to
      cut first-paint font swap (currently `font-display: swap`, no preload).

## Documentation
- [ ] Add TESTING_GUIDE.md with test patterns and conventions

## PWA pattern audit — 2026-08-03

Repo-side findings from a fleet-wide audit of every devmade-ai PWA against the
glow-props implementation patterns. The pattern-side learnings are already folded
back into those docs, so **fetch the current pattern before starting any item** —
several of these are now described directly by it:

```bash
curl -sf "https://devmade-ai.github.io/glow-props/patterns/PWA_SYSTEM.md"
curl -sf "https://devmade-ai.github.io/glow-props/patterns/PWA_ICON_CACHE_BUST.md"
```

Line references were accurate at audit time. Severity-ordered.

1. [ ] **Implement PWA_ICON_CACHE_BUST** — manifest icons (`vite.config.ts:67-90`)
   and HTML links (`index.html:5-8`) use stable un-versioned URLs; no hashing, no
   `ignoreURLParametersMatching`, no tripwire. If the ink-stamp icon ever changes,
   installed users keep the old one indefinitely.
2. [ ] **Give Chromium users an install affordance when the prompt is suppressed** —
   `showManualInstructions` is `!supportsAutoInstall && !isStandalone()`
   (`usePWAInstall.ts:61-64`), so under Chrome's 90-day post-dismissal suppression
   *nothing renders at all*. Add the pattern's 5s diagnostic-timeout fallback.
3. [ ] **Remove the dead `navigateFallbackDenylist` entry** (`vite.config.ts:107`) —
   `[/^https?:\/\/.*\.vercel\.app\/api\//]` can never match: Workbox tests denylist
   regexes against `pathname + search`, never the origin. The adjacent comment
   claims it excludes an API domain; it does nothing.
4. [ ] **Set `cleanupOutdatedCaches: true` explicitly** — the plugin defaults it to
   true so behaviour is correct, but the pattern's tripwire greps the source.
5. [ ] **Add the display-mode-change listener and install-funnel analytics** —
   install-via-browser-menu is currently undetected.
6. [ ] **Reconcile the icon generator** — `sharp` and `png-to-ico` sit in
   devDependencies but there is no `scripts/` directory and no `favicon.ico`.
   Either restore the generator or drop the dead deps. (APP_ICONS.md used to cite
   this repo as its `png-to-ico` reference; that citation has been removed.)
7. [ ] **Fix the CSP blocking Google Analytics** — `vercel.json` `script-src` omits
   `googletagmanager.com` and `connect-src` omits the GA collection endpoints, yet
   `index.html` loads gtag (`G-61SDQXZSFT`). GA is almost certainly dead in
   production. *(Not a PWA item — found during the audit.)*

**Promoted into the fleet pattern from this repo:** the `hasUpdate`-must-not-OR-`needRefresh`
rule, the launch-apply once-guard, catching `registration.update()` rejections, the
`globIgnores`-scraper-assets rule, and the vitest recipe for aliasing the virtual module.


## Public visibility — 2026-08-04 fleet audit

Findings from the fleet-wide public-visibility audit against
[`DISCOVERABILITY.md`](https://devmade-ai.github.io/glow-props/patterns/discoverability/).
**Fetch that pattern before starting.** Verified against the deployed origin
(`https://see-veo.vercel.app/`) on 2026-08-04, not only read from source.

This is a CV — being found is the entire point — and the Open Graph set and card
are already in place. The gaps are everything around them.

1. [ ] **No `robots.txt`, and the SPA rewrite serves `/robots.txt` as the app's
   HTML** (verified live: 200, `text/html`). This is the exact trap the pattern
   names. Add a real `public/robots.txt` allowing the crawl and naming the
   sitemap, and exclude any path containing a file extension from the rewrite so
   a missing static file 404s.
2. [ ] **`GET /sitemap.xml` has the same problem** — 200, HTML. No sitemap exists.
3. [ ] **`<meta name="description">` is present but EMPTY** (`content=""`).
   A search result has nothing to show beneath the title, and an empty tag reads
   as deliberate to a crawler in a way a missing one does not. The `og:title`
   already carries good copy — the description should match its quality, within
   the ~155-character budget.
4. [ ] **No canonical and no host redirects.** `*.vercel.app` and every branch
   preview alias serve byte-identical HTML, so they are full duplicates competing
   with each other. 308 redirects to one host plus a canonical is the fix.
5. [ ] **The served document has zero crawlable body text** (measured: 0
   characters). For a CV this is the substantive gap — the skills, roles and
   dates that should rank exist only after JavaScript runs.
6. [ ] **Soft 404s.** A nonexistent path returns **200** with the app.
7. [ ] **The tripwire asserts dimension LITERALS and only `existsSync`s the
   PNGs** — it never reads the IHDR, so a resized or corrupted card passes green.
   Read the actual header bytes; the pattern's Step 6 shows the check.
8. [ ] **No `robots.txt` / dist / identity assertions in the tripwire, and no
   CI at all** — so nothing above would be caught even once tested.
9. [ ] **No `Person` + `ProfilePage` structured data**, despite `cv-data.ts`
   already holding `sameAs`-ready profile links. This is the single highest-value
   structured-data case in the fleet (Step 5).
