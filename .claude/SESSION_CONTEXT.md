# Session Context — Handoff

**Last updated:** 2026-05-22
**Last session:** Merged PR #33 — public list mode
**Next priority:** Affiliate link rewriting (Amazon Associates) — only remaining V1.5 item

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
- **"All claimed" notification** — ✅ Merged (PR #31); emails all accepted gifters when every item is claimed; PR description corrected post-merge; DB migration required: `ALTER TABLE lists ADD COLUMN all_claimed_notified_at timestamptz;`
- **Anonymous purchase toggle** — ✅ Merged (PR #32); per-purchase checkbox; DB migration applied: `ALTER TABLE purchases ADD COLUMN is_anonymous boolean NOT NULL DEFAULT false;`
- **Public list mode** — ✅ Merged (PR #33); dashboard toggle per list; unauth visitors see items + "Sign in to claim"; auth non-members get full gifter view; all purchases on public lists always anonymous; DB migration applied to production

## What's Next

V1.5 complete. No deferred items remaining. Skimlinks affiliate approval still pending — affiliate link rewriting removed from backlog until approved.

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
