# Session Context — Handoff

**Last updated:** 2026-05-05
**Last session:** Documentation, memory system, session handoff wiring
**Next priority:** V1 Track 5 (reminder emails)

---

## Current State

- **V1 Track 4 (event dates)** — ✅ Merged PR #21
- **Docs optimization** — ✅ Merged PR #22. CLAUDE.md cleaned up, README reorganized.
- **Pattern extraction** — ✅ 9 pattern files in memory system (~25k words)
- **Session handoff system** — ✅ SESSION_CONTEXT.md auto-loaded via `@` import in CLAUDE.md; Stop hook fires reminder at session end

## What's Next

**V1 Track 5 — Reminder emails (~2 days)**
- Branch: `feature/v1-track-5-reminders`
- Vercel cron at 9am ET → `/api/cron/send-reminders`
- Cadence: 14 days before + 3 days before event_date
- Reuse Resend HTML email pattern from `lib/actions/invites.ts`
- Add `CRON_SECRET` env var for route auth
- Schema dependency: Track 4's `event_date` column (already live)

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
