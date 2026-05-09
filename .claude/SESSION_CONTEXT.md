# Session Context — Handoff

**Last updated:** 2026-05-09
**Last session:** Filter bar (PR #28) + priority select label fix (PR #29) — both pushed, PRs open
**Next priority:** Merge PRs #28 and #29, then Request access CTA on access-denied page

---

## Current State

- **V1 all 5 tracks** — ✅ Merged and deployed to wishona.com
- **Universal invite link** — ✅ Live in production; `list_invite_links` migration run, Supabase types regenerated
- **Gift priority ranking** — ✅ Merged and deployed; `priority` column was already in DB, no migration needed
- **`/wrap-up` command** — ✅ Live at `.claude/skills/wrap-up/SKILL.md`
- **CRON_SECRET** — set manually in Vercel env vars (Vercel does NOT auto-generate this)
- **Filter bar** — PR #28 open on `feature/filter-bar-available-only`; not yet merged
- **Priority select label** — PR #29 open on `fix/priority-select-no-priority-label`; not yet merged

## What's Next

V1.5 deferred items:
- Merge PR #28 (filter bar) and PR #29 (priority select label)
- Request access CTA on access-denied page — next quick win
- Anonymous purchase toggle
- Item suggestions from gifters
- "All claimed" notification email to list owner
- Public list mode
- Affiliate link rewriting (Amazon Associates)

## Active Branches

- `feature/filter-bar-available-only` — PR #28; available-only toggle on member view; new `ItemsGrid` client component (`app/[username]/[slug]/items-grid.tsx`)
- `fix/priority-select-no-priority-label` — PR #29; "No priority" → "—" in both priority selects

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
