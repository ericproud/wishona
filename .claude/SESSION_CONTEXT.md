# Session Context — Handoff

**Last updated:** 2026-05-09
**Last session:** Universal invite link + invites page UI redesign (PR #26 merged)
**Next priority:** Run DB migration in Supabase, then V1.5 / V2 planning

---

## Current State

- **V1 all 5 tracks** — ✅ Merged and deployed to wishona.com
- **Universal invite link** — ✅ Code merged (PR #26); `list_invite_links` table migration still needs to be run in Supabase SQL editor (see PR #26 description for SQL), then regenerate types
- **Supabase types** — `list_invite_links` manually patched in `types/supabase.ts`; after running migration: `npx supabase gen types typescript --project-id <ref> > types/supabase.ts`
- **CRON_SECRET** — set manually in Vercel env vars (Vercel does NOT auto-generate this)
- **Git** — clean, only `main` locally, all feature branches deleted

## What's Next

1. Run the `list_invite_links` migration in Supabase production (SQL in PR #26 description)
2. Regenerate Supabase types
3. V1.5 / V2 deferred items from `project_spec.md §1.6`:
   - Anonymous purchase toggle
   - Gift priority ranking
   - Item suggestions from gifters
   - "All claimed" notification email to list owner
   - Public list mode
   - Affiliate link rewriting (Amazon Associates)
   - Filter bar on list page (available only toggle)
   - Request access CTA on access-denied page

## Active Branch

`main` — clean, up to date with origin.

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
