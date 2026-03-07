# AI Fuckups

Log of AI mistakes during development sessions. Exists so patterns get spotted and not repeated.

---

## 2026-03-07 — Ignored user, curled a whitelisted endpoint

**What happened:** User explicitly stated the session IP wasn't on the backend's CORS whitelist. AI proceeded to curl the health endpoint anyway, got a 403 `host_not_allowed`, then explained the 403 back to the user as if it was a new finding.

**What should have happened:** Listen. The user already diagnosed the situation. Wait for them to test from their own environment and report back.

**Lesson:** When the user tells you something about their infrastructure, trust them. Don't try to verify things you've already been told you can't access.
