# Session Context — Handoff

**Last updated:** 2026-05-06
**Last session:** Rebuilt Track 4 (event dates), built Track 5 (reminder emails)
**Next priority:** Merge PR #24 (Track 4) and PR #23 (Track 5), then V1 is complete

---

## Current State

- **V1 Track 4 (event dates)** — ✅ Rebuilt and pushed. PR #24 open. Was never actually committed in a previous session — only docs were merged in PR #21. Now fully implemented.
- **V1 Track 5 (reminder emails)** — ✅ Built and pushed. PR #23 open.
- Both PRs need browser testing before merge.

## What's Next

1. Merge PR #24 (Track 4) — test in browser first
2. Merge PR #23 (Track 5) — verify cron shows up in Vercel dashboard after deploy
3. **V1 is complete** after both merges
4. Next up: V1.5 / V2 planning (see `project_spec.md §1.6` deferred items)

## Active Branches

- `feature/v1-track-4-event-dates` → PR #24
- `feature/v1-track-5-reminders` → PR #23
- `main` — clean

## Gotchas to Remember

1. RLS is the security boundary — never bypass with service role key on client
2. Owner blindness — list owners must never see purchase data (RLS enforces)
3. Timezone-safe dates — `new Date(y, m-1, d)`, not `new Date('YYYY-MM-DD')`
4. Server Actions — always fetch auth'd user server-side, never trust client ID
5. Race conditions on quantity — calculate available qty on server before accepting claim
6. `.claude/*` in .gitignore with exceptions for SESSION_CONTEXT.md and settings.json
7. Track 4 code was lost once (never committed) — don't let work pile up uncommitted
8. CRON_SECRET: Vercel auto-generates in production; set manually in .env.local for local testing
