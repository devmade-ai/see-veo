# AI Mistakes

Log of AI mistakes during development sessions. Exists so patterns get spotted and not repeated.

---

## 2026-03-07 — Ignored user, curled a whitelisted endpoint

**What happened:** User explicitly stated the session IP wasn't on the backend's CORS whitelist. AI proceeded to curl the health endpoint anyway, got a 403 `host_not_allowed`, then explained the 403 back to the user as if it was a new finding.

**What should have happened:** Listen. The user already diagnosed the situation. Wait for them to test from their own environment and report back.

**Lesson:** When the user tells you something about their infrastructure, trust them. Don't try to verify things you've already been told you can't access.

---

## 2026-03-26 — Security sweep reverted a fix from the same session

**What happened:** Commit `c2c08fd` added `allow-same-origin` to iframe sandboxes to fix chart data loading. Later in the same session, commit `2fbb40f` (a security hardening pass) removed it again, reasoning that it "prevents embedded content from accessing parent cookies/localStorage." This broke charts for the second time in one session.

**What should have happened:** Two failures compounded:
1. The original fix (`c2c08fd`) didn't add an inline comment explaining why `allow-same-origin` is required, despite the project's decision-comment rules. The commit message explained it, but the code didn't.
2. The security sweep (`2fbb40f`) didn't check git history before removing it. `git log -p -- ActivityCharts.tsx` would have shown the fix and its rationale immediately.

**Lesson:** When fixing something non-obvious, comment it in the code — not just the commit message. Commit messages explain history; inline comments protect against future changes. And before removing a permission, read the git history for why it was added.

---

## 2026-07-29 — A global game key handler silently ate every space in the contact form

**What happened:** `LivingCv` registered a `window` keydown listener for the game controls
(`←`/`→` walk, `Space` jump) that called `preventDefault()` without checking where the event
came from. The contact form lives on the same page, so every space a visitor typed into it was
cancelled before the browser could insert the character. It shipped, and a real person's message
arrived by email as `pleasesendmeyourcellphonenumber.` from `LouiseWentworth`. Arrow keys were
taken the same way — and since only the active level is mounted, they also unmounted the form
and discarded whatever had been typed.

**What should have happened:** Any listener bound to `window`/`document` that cancels a key has
to establish that the key is actually its own. The event's target tells you: a keystroke
dispatched from an `input`/`textarea`/`select`/contenteditable belongs to that field, and `Space`
on a focused `button` belongs to the button. Adding a game control to a page that also has a
form is exactly when to think about it.

**Lesson:** `preventDefault()` on a keydown is not "stop the page scrolling" — it cancels
character insertion and control activation too. Global key handlers need a target guard from the
first commit, and any page mixing keyboard controls with form fields needs a test that types a
sentence *with spaces* into a real field. Note the shape of the bug report: the evidence pointed
at the email pipeline (encoding, escaping, the SMTP relay), and the pipeline was innocent —
the check that ruled it out (compiling the actual MIME) was worth doing before touching it, but
the answer was in the browser.
