# Session Context — Handoff

**Last updated:** 2026-05-09
**Last session:** Merged PRs #28 (filter bar), #29 (priority select label), #30 (request access CTA on access-denied page)
**Next priority:** Anonymous purchase toggle or "All claimed" notification email to list owner

---

## Current State

- **V1 all 5 tracks** — ✅ Merged and deployed to wishona.com
- **Universal invite link** — ✅ Live in production; `list_invite_links` migration run, Supabase types regenerated
- **Gift priority ranking** — ✅ Merged and deployed; `priority` column was already in DB, no migration needed
- **`/wrap-up` command** — ✅ Live at `.claude/skills/wrap-up/SKILL.md`
- **CRON_SECRET** — set manually in Vercel env vars (Vercel does NOT auto-generate this)
- **Filter bar** — ✅ Merged (PR #28)
- **Priority select label** — ✅ Merged (PR #29)
- **Request access CTA** — ✅ Merged (PR #30); no DB changes; dev mode skips email

## What's Next

V1.5 deferred items:
- Anonymous purchase toggle
- Item suggestions from gifters
- "All claimed" notification email to list owner
- Public list mode
- Affiliate link rewriting (Amazon Associates)

## Active Branches

None.

## Blockers / Decisions

None outstanding.

## Gotchas to Remember

1. RLS is the security boundary — never bypass with service role key on client
2. Owner blindness — list owners must never see purchase data (RLS enforces)
3. Timezone-safe dates — `new Date(y, m-1, d)`, not `new Date('YYYY-MM-DD')`
4. Server Actions — always fetch auth'd user server-side, never trust client ID
5. Race conditions on quantity — calculate available qty on server before accepting claim
6. `.claude/*` in .gitignore with exceptions for SESSION_CONTEXT.md and settings.json
7. CRON_SECRET: Vercel does NOT auto-generate — must be set manually in Vercel dashboard
8. Don't let work pile up uncommitted — Track 4 code was lost once this way
