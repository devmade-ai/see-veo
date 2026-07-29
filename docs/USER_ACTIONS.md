# User Actions

Manual actions requiring user intervention. Cleared when completed.

---

## Reply to Louise Wentworth — her message was mangled by the space-eating bug

A real visitor's contact-form message arrived garbled (`pleasesendmeyourcellphonenumber.`)
because of the key-handler bug fixed on 2026-07-29. She never received a reply, and only
you can send one.

1. Email `louisew@pepla.co.za` — she asked for your cell phone number.
2. Optional: mention the form glitch mangled her message, in plain language.

Clear this section once she's been answered.

---

## Verify the social share unfurl after this deploys

The Open Graph / Twitter tags + share images are wired up and pushed, but the previews can
only be confirmed once the branch is deployed to `https://see-veo.vercel.app`. These steps
need a browser (and platform logins) the build can't do.

1. **Confirm the image resolves.** In an incognito window open
   `https://see-veo.vercel.app/share/og-card.png` — it must show the card (HTTP 200, a PNG),
   not the app. (Before deploy it returns the app shell because the file isn't live yet.)
2. **Force a re-scrape on each platform** — they cache aggressively, so an old/blank preview
   persists until you clear it:
   - LinkedIn Post Inspector — https://www.linkedin.com/post-inspector/
   - Facebook Sharing Debugger — https://developers.facebook.com/tools/debug/
   - X (Twitter) Card Validator — paste the link in a post/DM draft to preview
   Paste `https://see-veo.vercel.app/` into each and re-fetch.
3. **Auto-unfurl (no action needed):** WhatsApp, Telegram, Slack, iMessage, Discord pick it
   up on their own once the tags + image are live.
4. **No link preview on these — post the image itself:** Instagram, TikTok, WhatsApp/Signal
   status. Use `public/share/square-card.png` (feed) or `story-card.png` (stories/vertical).

## If the CV facts or domain ever change

- **CV facts** (name, title, tagline, handles, location): re-generate the three PNGs from the
  handoff `guidelines/share-*.card.html`, drop them into `public/share/`, and update the
  matching copy in `index.html` (`og:title`, `og:description`, `twitter:*`, `<meta
  name="description">`).
- **New custom domain**: update the absolute URLs in `index.html` (`og:url`, `og:image`,
  `twitter:image`) and the expected domain in `src/test/social-meta.test.ts`.
