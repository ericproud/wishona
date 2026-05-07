# Session Context — Handoff

**Last updated:** 2026-05-07
**Last session:** V1 complete — Track 4 (event dates) rebuilt, Track 5 (reminder emails) built and tested in production
**Next priority:** V1.5 / V2 planning

---

## Current State

- **V1 all 5 tracks** — ✅ Merged and deployed to wishona.com
- **Reminder emails** — ✅ Tested in production via curl, emails delivered to real recipients
- **CRON_SECRET** — set manually in Vercel env vars (not auto-generated — Vercel does NOT auto-generate this)
- **Git** — clean, only `main` locally, all feature branches deleted

## What's Next

V1 is shipped. Deferred items from `project_spec.md §1.6` for V1.5 / V2:
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
