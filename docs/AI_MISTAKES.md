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

**What should have happened:** The security sweep should have checked recent commit history before tightening sandbox attributes. The fix was made minutes earlier — reverting it without testing showed the change wasn't understood. Additionally, the security reasoning was wrong: `allow-same-origin` restores the iframe's *own* origin identity, not access to the *parent*. Cross-origin cookie/localStorage access is already blocked by the browser's same-origin policy since the iframe (`repo-tor.vercel.app`) and parent (`see-veo.vercel.app`) are different domains.

**Lesson:** Removing permissions is a functional change, not just a security improvement. It needs to be tested, not just reasoned about. The AI was confident its reasoning was correct — and it was wrong. If it had checked whether the charts still loaded after the change, the breakage would have been caught immediately.
