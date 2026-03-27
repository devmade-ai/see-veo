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
